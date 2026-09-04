import crypto from 'crypto';
import hostelRepository from './hostel.repository.js';
import { sendEmail } from '../../utils/email.js';
import { cache } from '../../config/cache.js';

const CORE_FEATURE_NAMES = [
  'user_management',
  'hostel_configuration',
  'bill_management',
  'bill_generation',
  'residence_management',
];

const normalizeFeatureName = (name) => (name || '').toLowerCase().replace(/[\s-]+/g, '_');
const isCoreFeature = (name) => CORE_FEATURE_NAMES.includes(normalizeFeatureName(name));

class HostelService {
  /**
   * Register a new hostel with its initial admin and manager accounts (Superadmin only)
   */
  async registerHostel(data) {
    const existingName = await hostelRepository.findByName(data.name);
    if (existingName) {
      const error = new Error('A hostel with this name is already registered.');
      error.statusCode = 409;
      throw error;
    }

    const adminExists = await hostelRepository.findUserByEmail(data.adminEmail);
    if (adminExists) {
      const error = new Error(`User with email ${data.adminEmail} already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const managerExists = await hostelRepository.findUserByEmail(data.managerEmail);
    if (managerExists) {
      const error = new Error(`User with email ${data.managerEmail} already exists.`);
      error.statusCode = 409;
      throw error;
    }

    let planData = data.plan
      ? await hostelRepository.findPlanById(data.plan)
      : await hostelRepository.findDefaultPlan();

    if (!planData) {
      const error = new Error('No subscription plans found. Create a plan first.');
      error.statusCode = 404;
      throw error;
    }

    const planSnapshot = {
      planId: planData._id,
      name: planData.name,
      limits: planData.limits,
      features: (planData.features || []).map((f) => ({
        name: typeof f === 'string' ? f : f.name,
        isEnabled: true,
      })),
    };

    // Initial 30-day trial/access window
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const hostel = await hostelRepository.create({
      name: data.name.trim(),
      subdomain: data.subdomain.trim().toLowerCase(),
      location: data.location.trim(),
      plan: planSnapshot,
      settings: {
        authMethod: data.settings?.authMethod || 'Email',
        attendanceMethod: data.settings?.attendanceMethod || 'Manual',
        billingModel: data.settings?.billingModel || 'Prepaid',
        autoMealVerification: data.settings?.autoMealVerification ?? true,
        maxMealSelection: data.settings?.maxMealSelection ?? 4,
      },
      status: 'Active',
      subscriptionExpiresAt: expiresAt,
    });

    const createdUsers = [];
    try {
      const adminUser = await this.createHostelUser(hostel._id, hostel.name, {
        name: data.adminName,
        email: data.adminEmail,
        role: 'admin',
      });
      createdUsers.push(adminUser.email);

      const managerUser = await this.createHostelUser(hostel._id, hostel.name, {
        name: data.managerName,
        email: data.managerEmail,
        role: 'manager',
      });
      createdUsers.push(managerUser.email);

      // Sync initial features to newly created admin
      await this._syncAdminPermissions(hostel._id, planSnapshot.features);
    } catch (error) {
      // Rollback newly created users and hostel on failure
      for (const email of createdUsers) {
        const u = await hostelRepository.findUserByEmail(email);
        if (u) {
          await hostelRepository.deleteUserById(u._id);
          await hostelRepository.deletePlainUserByEmail(email);
        }
      }
      await hostelRepository.delete(hostel._id);

      const rollbackErr = new Error(`Failed to create initial users. Hostel creation rolled back: ${error.message}`);
      rollbackErr.statusCode = error.statusCode || 500;
      throw rollbackErr;
    }

    return hostel;
  }

  /**
   * Auto-expiring status checker with immediate cache invalidation on status change
   */
  async getAndSyncHostelStatus(hostelId) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) return 'Inactive';

    const now = new Date();
    const expires = hostel.subscriptionExpiresAt ? new Date(hostel.subscriptionExpiresAt) : new Date(0);

    if (expires < now && hostel.status === 'Active') {
      await hostelRepository.updateHostel(hostelId, { status: 'Expired' });
      await cache.del(`hostel:config:${hostelId}`);
      return 'Expired';
    }

    return hostel.status;
  }

  /**
   * Superadmin unified update: subscription extension, plan upgrades, and settings in one pass
   */
  async updateSuperadminHostelSettings(hostelId, validatedData) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }

    const updatePayload = {};

    // 1. Subscription & Plan Updates
    if (validatedData.additionalDays !== undefined || validatedData.plan || validatedData.status || validatedData.isTrial !== undefined) {
      const now = new Date();
      const currentExpiry = hostel.subscriptionExpiresAt ? new Date(hostel.subscriptionExpiresAt) : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;

      if (validatedData.additionalDays !== undefined && validatedData.additionalDays > 0) {
        updatePayload.subscriptionExpiresAt = new Date(
          baseDate.getTime() + validatedData.additionalDays * 24 * 60 * 60 * 1000
        );
        updatePayload.status = 'Active';
        updatePayload.isTrial = false;
      }

      if (validatedData.status) {
        updatePayload.status = validatedData.status;
      }

      if (validatedData.isTrial !== undefined) {
        updatePayload.isTrial = validatedData.isTrial;
      }

      if (validatedData.plan) {
        const planData = await hostelRepository.findPlanById(validatedData.plan);
        if (!planData) {
          const error = new Error('Selected plan not found.');
          error.statusCode = 404;
          throw error;
        }

        const currentStudents = hostel.plan?.limits?.students || 0;
        const currentManagers = hostel.plan?.limits?.managers || 0;

        updatePayload.plan = {
          planId: planData._id,
          name: planData.name,
          limits: {
            maxStudents: planData.limits?.maxStudents ?? 100,
            maxManagers: planData.limits?.maxManagers ?? 1,
            students: currentStudents,
            managers: currentManagers,
          },
          features: (planData.features || []).map((f) => ({
            name: typeof f === 'string' ? f : f.name,
            isEnabled: true,
          })),
        };
      }
    }

    // 2. Direct property updates
    if (validatedData.name) updatePayload.name = validatedData.name.trim();
    if (validatedData.subdomain) updatePayload.subdomain = validatedData.subdomain.trim().toLowerCase();
    if (validatedData.location) updatePayload.location = validatedData.location.trim();
    if (validatedData.locationCoords) updatePayload.locationCoords = validatedData.locationCoords;
    if (validatedData.qrSecret) updatePayload.qrSecret = validatedData.qrSecret.trim();

    // 3. Settings updates
    if (validatedData.settings) {
      updatePayload.settings = {
        ...(hostel.settings ? (typeof hostel.settings.toObject === 'function' ? hostel.settings.toObject() : hostel.settings) : {}),
        ...validatedData.settings,
      };
    }

    // 4. Feature updates if provided
    const incomingFeatures = validatedData['plan.features'] || validatedData.planFeatures;
    if (incomingFeatures && Array.isArray(incomingFeatures)) {
      const existingFeatures = updatePayload.plan?.features || hostel.plan?.features || [];
      const mergedFeatures = existingFeatures.map((existing) => {
        const incoming = incomingFeatures.find(
          (f) => normalizeFeatureName(f.name) === normalizeFeatureName(existing.name)
        );

        if (isCoreFeature(existing.name)) {
          return { name: existing.name, isEnabled: true };
        }

        return {
          name: existing.name,
          isEnabled: incoming ? Boolean(incoming.isEnabled) : existing.isEnabled,
        };
      });

      if (updatePayload.plan) {
        updatePayload.plan.features = mergedFeatures;
      } else {
        updatePayload['plan.features'] = mergedFeatures;
      }
    }

    if (validatedData.customRegistrationFields) {
      updatePayload.customRegistrationFields = validatedData.customRegistrationFields;
    }

    const updatedHostel = await hostelRepository.updateHostel(hostelId, updatePayload);
    await cache.del(`hostel:config:${hostelId}`);

    // Sync admin permissions if features changed
    const finalFeatures = updatedHostel?.plan?.features;
    if (finalFeatures) {
      await this._syncAdminPermissions(hostelId, finalFeatures);
    }

    return updatedHostel;
  }

  /**
   * Extend or upgrade subscription (Backward compatibility helper)
   */
  async extendOrUpgradeSubscription(hostelId, planId, additionalDays) {
    return this.updateSuperadminHostelSettings(hostelId, { plan: planId, additionalDays });
  }

  /**
   * Get all hostels with optional search/filter for Superadmin
   */
  async getAllHostels(queryParams = {}) {
    const filter = {};
    if (queryParams.status) {
      filter.status = queryParams.status;
    }
    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { subdomain: searchRegex }, { location: searchRegex }];
    }

    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 0;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const [hostels, total] = await Promise.all([
      hostelRepository.findAll({ filter, skip, limit }),
      hostelRepository.countAll(filter),
    ]);

    return { hostels, total, page, limit: limit || total };
  }

  /**
   * Get hostel by ID with caching and role-based data masking
   */
  async getHostelById(hostelId, role = null) {
    if (!hostelId) {
      const error = new Error('Hostel ID is required.');
      error.statusCode = 400;
      throw error;
    }

    const cacheKey = `hostel:config:${hostelId}`;
    const hostel = await cache.getOrSet(
      cacheKey,
      async () => {
        return await hostelRepository.findById(hostelId, { lean: true });
      },
      1800,
      300
    );

    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }

    return this._maskHostelDataForRole(hostel, role);
  }

  /**
   * Mask sensitive hostel details for student role
   */
  _maskHostelDataForRole(hostel, role) {
    if (role !== 'student') return hostel;

    const safeData = JSON.parse(JSON.stringify(hostel));
    if (safeData.plan) {
      delete safeData.plan.limits;
      delete safeData.plan.price;
      delete safeData.plan.planId;
      delete safeData.plan.name;
    }
    delete safeData.isTrial;
    delete safeData.trialExpiresAt;
    // CRITICAL SECURITY: Never expose QR Secret to students
    delete safeData.qrSecret;

    return safeData;
  }

  /**
   * Update tenant-level hostel settings (Admin updating their own hostel)
   */
  async updateTenantSettings(hostelId, newSettingsData) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }

    const updatePayload = {};

    if (newSettingsData.subdomain !== undefined) {
      updatePayload.subdomain = newSettingsData.subdomain.trim().toLowerCase();
    }
    if (newSettingsData.location !== undefined) {
      updatePayload.location = newSettingsData.location.trim();
    }
    if (newSettingsData.locationCoords) {
      updatePayload.locationCoords = newSettingsData.locationCoords;
    }
    if (newSettingsData.qrSecret) {
      updatePayload.qrSecret = newSettingsData.qrSecret.trim();
    }
    if (newSettingsData.customRegistrationFields) {
      updatePayload.customRegistrationFields = newSettingsData.customRegistrationFields;
    }

    if (newSettingsData.settings) {
      updatePayload.settings = {
        ...(hostel.settings ? (typeof hostel.settings.toObject === 'function' ? hostel.settings.toObject() : hostel.settings) : {}),
        ...newSettingsData.settings,
      };
    }

    // Feature toggling: only existing non-core features can be toggled
    const incomingFeatures = newSettingsData['plan.features'] || newSettingsData.planFeatures;
    if (incomingFeatures && Array.isArray(incomingFeatures)) {
      const existingFeatures = hostel.plan?.features || [];
      const mergedFeatures = existingFeatures.map((existing) => {
        const incoming = incomingFeatures.find(
          (f) => normalizeFeatureName(f.name) === normalizeFeatureName(existing.name)
        );

        if (isCoreFeature(existing.name)) {
          return { name: existing.name, isEnabled: true };
        }

        return {
          name: existing.name,
          isEnabled: incoming ? Boolean(incoming.isEnabled) : existing.isEnabled,
        };
      });

      updatePayload['plan.features'] = mergedFeatures;
    }

    const updatedHostel = await hostelRepository.updateHostel(hostelId, updatePayload);
    await cache.del(`hostel:config:${hostelId}`);

    if (updatedHostel?.plan?.features) {
      await this._syncAdminPermissions(hostelId, updatedHostel.plan.features);
    }

    return updatedHostel;
  }

  // Alias for backward compatibility
  async updateHostelSettings(hostelId, newSettingsData) {
    return this.updateTenantSettings(hostelId, newSettingsData);
  }

  /**
   * Internal helper: Create user under hostel with plan limit enforcement and credentials email
   */
  async createHostelUser(hostelId, hostelName, userData) {
    const existing = await hostelRepository.findUserByEmail(userData.email);
    if (existing) {
      const error = new Error(`User with email ${userData.email} already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }

    const role = userData.role;
    if (role === 'student' || role === 'manager') {
      const maxLimit = role === 'manager'
        ? hostel.plan?.limits?.maxManagers
        : hostel.plan?.limits?.maxStudents;

      const currentCount = await hostelRepository.countUsersByRole(hostelId, role);

      if (maxLimit !== undefined && maxLimit !== -1 && currentCount >= maxLimit) {
        const error = new Error(`Plan limit reached. Your current subscription only allows ${maxLimit} ${role}(s). Upgrade plan to add more.`);
        error.statusCode = 402;
        throw error;
      }
    }

    const enabledFeatures = hostel.plan?.features || [];

    if (userData.role === 'admin') {
      userData.permissions = enabledFeatures
        .filter((f) => f.isEnabled)
        .map((f) => normalizeFeatureName(f.name));
    } else if (userData.role === 'manager' && (!userData.permissions || userData.permissions.length === 0)) {
      const hasFeat = (name) =>
        enabledFeatures.some(
          (f) => normalizeFeatureName(f.name) === normalizeFeatureName(name) && f.isEnabled
        );
      userData.permissions = [];
      if (hasFeat('meal_settings')) userData.permissions.push('meal_settings');
      if (hasFeat('bill_management')) userData.permissions.push('bill_management');
    }

    const password = crypto.randomBytes(8).toString('base64url');
    const user = await hostelRepository.createUser({
      id: userData.id ? userData.id.toLowerCase().trim() : undefined,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role,
      hostelId: hostelId.toString(),
      password,
      permissions: userData.permissions || [],
      additionalInfo: Array.isArray(userData.additionalInfo) ? userData.additionalInfo : [],
    });

    await hostelRepository.upsertPlainUser({
      id: userData.id ? userData.id.toLowerCase().trim() : undefined,
      password,
      role: userData.role,
      name: userData.name.trim(),
      hostelId: hostelId.toString(),
      permissions: userData.permissions || [],
    });

    if (role === 'student' || role === 'manager') {
      const updatedCount = await hostelRepository.countUsersByRole(hostelId, role);
      const countField = role === 'manager' ? 'plan.limits.managers' : 'plan.limits.students';
      await hostelRepository.updateLimitCount(hostelId, countField, updatedCount);
      await cache.del(`hostel:config:${hostelId}`);
    }

    const lineItems = [
      `Hostel: ${hostelName}`,
      `Role: ${userData.role}`,
      `Email: ${userData.email}`,
      `Temporary password: ${password}`,
      `Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
    ];

    try {
      await sendEmail({
        to: userData.email,
        subject: `Welcome to MessPro — ${userData.role} account created`,
        text: `Your ${userData.role} account has been created.\n\n${lineItems.join('\n')}\n\nPlease change your password after first login.`,
        html: `<p>Your <strong>${userData.role}</strong> account has been created.</p><p>${lineItems.map((line) => line.replace(/\n/g, '<br/>')).join('<br/>')}</p><p>Please change your password after first login.</p>`,
      });
    } catch (emailError) {
      console.warn(`Could not send welcome email to ${userData.email}:`, emailError.message);
    }

    return { email: user.email, role: user.role, name: user.name };
  }

  /**
   * Role-governed user creation
   */
  async addHostelUser(creatorRole, hostelId, userData) {
    const allowedCreations = {
      superadmin: ['admin', 'manager'],
      admin: ['manager', 'student'],
      manager: ['student'],
    };

    if (!allowedCreations[creatorRole]?.includes(userData.role)) {
      const error = new Error(`Access Denied: A ${creatorRole} is not permitted to create a ${userData.role}.`);
      error.statusCode = 403;
      throw error;
    }

    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }

    return this.createHostelUser(hostelId, hostel.name, userData);
  }

  /**
   * Internal permission synchronizer
   */
  async _syncAdminPermissions(hostelId, features) {
    if (!features || !Array.isArray(features)) return;

    const activePermissions = features
      .filter((f) => f.isEnabled)
      .map((f) => normalizeFeatureName(f.name));

    await hostelRepository.syncAdminPermissions(hostelId, activePermissions);
  }
}

export default new HostelService();