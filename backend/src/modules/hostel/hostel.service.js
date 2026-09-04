import crypto from 'crypto';
import hostelRepository from './hostel.repository.js';
import { sendEmail } from '../../utils/email.js';
import { cache } from '../../config/cache.js';
import {
  verifyEmailDomainMX,
  validateEmailFormat,
  validateSubdomain,
} from '../../utils/emailValidator.js';


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

    if (data.managerEmail && typeof data.managerEmail === 'string' && data.managerEmail.trim()) {
      const managerExists = await hostelRepository.findUserByEmail(data.managerEmail.trim());
      if (managerExists) {
        const error = new Error(`User with email ${data.managerEmail} already exists.`);
        error.statusCode = 409;
        throw error;
      }
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
        password: data.adminPassword,
      });
      createdUsers.push(adminUser.email);

      if (data.managerEmail && typeof data.managerEmail === 'string' && data.managerEmail.trim()) {
        const managerUser = await this.createHostelUser(hostel._id, hostel.name, {
          name: data.managerName?.trim() || 'Manager',
          email: data.managerEmail.trim(),
          role: 'manager',
        });
        createdUsers.push(managerUser.email);
      }

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

    const password = userData.password && userData.password.trim().length >= 6
      ? userData.password.trim()
      : crypto.randomBytes(8).toString('base64url');
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

  // ─── Hostel Setup Onboarding Requests ───────────────────────────────────────

  /**
   * Public submission of a hostel setup / trial request (from landing page)
   * Hardened for production: MX verification, disposable block, user collision, duplicate/subdomain checks
   */
  async submitHostelRequest(data) {
    const rawAdminEmail = (data.adminEmail || '').toLowerCase().trim();
    const rawManagerEmail = (data.managerEmail || '').toLowerCase().trim();
    const rawSubdomain = (data.subdomain || '').toLowerCase().trim();
    const rawHostelName = (data.hostelName || '').trim();

    // 1. Subdomain Validation & Reserved Word Guard
    const subValidation = validateSubdomain(rawSubdomain);
    if (!subValidation.valid) {
      const error = new Error(subValidation.reason);
      error.statusCode = 400;
      throw error;
    }
    const cleanSubdomain = subValidation.sanitized;

    // 2. Email Syntax & DNS MX Deliverability Verification (Real mailbox domain verification)
    const emailMxCheck = await verifyEmailDomainMX(rawAdminEmail);
    if (!emailMxCheck.valid) {
      const error = new Error(emailMxCheck.reason);
      error.statusCode = 400;
      throw error;
    }

    if (rawManagerEmail) {
      const mgrMxCheck = await verifyEmailDomainMX(rawManagerEmail);
      if (!mgrMxCheck.valid) {
        const error = new Error(`Manager Email: ${mgrMxCheck.reason}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // 3. Check for Subdomain Collisions (Active Hostel or Pending Request)
    const existingSubdomainHostel = await hostelRepository.findBySubdomain(cleanSubdomain);
    if (existingSubdomainHostel) {
      const error = new Error(`The subdomain "${cleanSubdomain}.messpro.app" is already in use by an active hostel. Please choose another unique subdomain slug.`);
      error.statusCode = 409;
      throw error;
    }

    const pendingSubdomainRequest = await hostelRepository.findPendingHostelRequestBySubdomain(cleanSubdomain);
    if (pendingSubdomainRequest) {
      const error = new Error(`The subdomain "${cleanSubdomain}.messpro.app" has already been requested and is pending review. Please choose another unique subdomain.`);
      error.statusCode = 409;
      throw error;
    }

    // 4. Check for Hostel Name Collisions (Active Hostel)
    const existingName = await hostelRepository.findByName(rawHostelName);
    if (existingName) {
      const error = new Error(`A hostel named "${rawHostelName}" is already active on MessPro. Please choose a distinct hostel name.`);
      error.statusCode = 409;
      throw error;
    }

    // 5. Existing User Check: If admin is already a registered user in MessPro
    const existingAdminUser = await hostelRepository.findUserByEmail(rawAdminEmail);
    if (existingAdminUser) {
      const error = new Error(`An account with email "${rawAdminEmail}" is already registered on MessPro. If you are already an administrator or resident, please sign in or submit this setup request using a different official email address.`);
      error.statusCode = 409;
      throw error;
    }

    if (rawManagerEmail) {
      const existingManagerUser = await hostelRepository.findUserByEmail(rawManagerEmail);
      if (existingManagerUser) {
        const error = new Error(`The manager email "${rawManagerEmail}" is already associated with an account on MessPro. Please provide an unused manager email or leave it empty.`);
        error.statusCode = 409;
        throw error;
      }
    }

    // 6. One Active Pending Request Per Email Guard
    const pendingRequest = await hostelRepository.findPendingHostelRequestByEmail(rawAdminEmail);
    if (pendingRequest) {
      const error = new Error(`A setup request from "${rawAdminEmail}" is already pending review by the MessPro Superadmin team. Our team will verify and activate your workspace shortly. If you need to request another facility, please use another email address.`);
      error.statusCode = 409;
      throw error;
    }

    // 7. Persist Validated Setup Request
    const request = await hostelRepository.createHostelRequest({
      hostelName: rawHostelName,
      subdomain: cleanSubdomain,
      location: data.location?.trim() || 'Asia/Karachi',
      address: data.address?.trim() || '',
      adminName: data.adminName.trim(),
      adminEmail: rawAdminEmail,
      adminPhone: data.adminPhone.trim(),
      managerName: data.managerName?.trim() || '',
      managerEmail: rawManagerEmail || '',
      requestedPlan: data.requestedPlan || {},
      status: 'pending',
    });

    // 8. Dispatch Acknowledgment Email to Client
    try {
      await sendEmail({
        to: rawAdminEmail,
        subject: `Onboarding Request Received — MessPro 2.0 (${rawHostelName})`,
        text: `Hello ${data.adminName},\n\nWe received your setup request for "${rawHostelName}" with subdomain "${cleanSubdomain}.messpro.app".\n\nOur Superadmin team is currently reviewing your configuration. Once approved, your dedicated hostel workspace and initial 10-day trial credentials will be provisioned and sent to this email.\n\nThank you for choosing MessPro 2.0!`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="color: #b8842a;">Hostel Onboarding Request Received</h2>
            <p>Hello <strong>${data.adminName}</strong>,</p>
            <p>Thank you for submitting a setup request for <strong>${rawHostelName}</strong> on MessPro 2.0.</p>
            <div style="background: #f9fafb; padding: 14px; border-radius: 8px; border-left: 4px solid #b8842a; margin: 16px 0;">
              <p style="margin: 3px 0;"><strong>Facility:</strong> ${rawHostelName}</p>
              <p style="margin: 3px 0;"><strong>Subdomain:</strong> ${cleanSubdomain}.messpro.app</p>
              <p style="margin: 3px 0;"><strong>Timezone:</strong> ${data.location || 'Asia/Karachi'}</p>
              <p style="margin: 3px 0;"><strong>Status:</strong> Under Review (MessPro Team)</p>
            </div>
            <p>Once our team verifies your submission, your tenant instance and administrator credentials will be generated and dispatched automatically.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6b7280;">MessPro 2.0 — Smart Mess & Hostel Management Platform</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn('Could not send onboarding acknowledgment email:', e.message);
    }

    return {
      success: true,
      message: 'Your hostel setup request has been submitted successfully! Check your email for confirmation.',
      data: request,
    };
  }


  /**
   * Superadmin retrieval of all onboarding requests with status & search filtering
   */
  async getHostelRequests({ status = 'all', search = '', page = 1, limit = 25 } = {}) {
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { hostelName: regex },
        { adminEmail: regex },
        { adminName: regex },
        { subdomain: regex },
        { adminPhone: regex },
      ];
    }

    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const [requests, total] = await Promise.all([
      hostelRepository.findHostelRequests({ filter, skip, limit: Math.max(1, limit) }),
      hostelRepository.countHostelRequests(filter),
    ]);

    return {
      data: requests,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Math.max(1, limit)),
    };
  }

  /**
   * Superadmin approval of a hostel setup request: Provisions tenant, creates accounts, and sends official credentials
   */
  async approveHostelRequest(requestId, approvalData, approverUser = null) {
    const request = await hostelRepository.findHostelRequestById(requestId);
    if (!request) {
      const error = new Error('Hostel setup request not found.');
      error.statusCode = 404;
      throw error;
    }

    if (request.status !== 'pending') {
      const error = new Error(`Cannot approve request: This request is already marked as ${request.status}.`);
      error.statusCode = 400;
      throw error;
    }

    const planData = await hostelRepository.findPlanById(approvalData.planId);
    if (!planData) {
      const error = new Error('Selected subscription plan does not exist.');
      error.statusCode = 404;
      throw error;
    }

    // 1. Provision the real Hostel and Admin account
    const provisionResult = await this.registerHostel({
      name: request.hostelName,
      subdomain: request.subdomain,
      location: request.location,
      plan: planData._id.toString(),
      adminName: request.adminName,
      adminEmail: request.adminEmail,
      adminPassword: approvalData.temporaryPassword?.trim() || undefined,
      managerName: request.managerName || undefined,
      managerEmail: request.managerEmail || undefined,
    });

    // 2. Fetch created hostel document to get exact ID
    const createdHostel = await hostelRepository.findByName(request.hostelName);

    // 3. Extract Superadmin Support Contacts from additionalInfo
    let superadminInfo = approverUser?.additionalInfo || [];
    if ((!superadminInfo || superadminInfo.length === 0) && approverUser?._id) {
      const dbUser = await hostelRepository.findUserById(approverUser._id);
      if (dbUser?.additionalInfo && Array.isArray(dbUser.additionalInfo)) {
        superadminInfo = dbUser.additionalInfo;
      }
    }

    const supportEmails = [];
    const supportPhones = [];

    if (Array.isArray(superadminInfo) && superadminInfo.length > 0) {
      superadminInfo.forEach((item) => {
        if (!item || !item.value) return;
        const val = String(item.value).trim();
        const key = String(item.key || 'Contact').trim();
        if (!val) return;

        const isEmail = val.includes('@') || key.toLowerCase().includes('mail');
        if (isEmail) {
          supportEmails.push({ label: key, value: val });
        } else {
          supportPhones.push({ label: key, value: val });
        }
      });
    }

    // Fallbacks if no custom contacts configured
    if (supportEmails.length === 0) {
      const fallbackEmail = approvalData.supportEmail?.trim() || approverUser?.email || process.env.EMAIL_USER || 'support@messpro.app';
      supportEmails.push({ label: 'Support Email', value: fallbackEmail });
    }
    if (supportPhones.length === 0 && approvalData.supportPhone?.trim()) {
      supportPhones.push({ label: 'WhatsApp Support', value: approvalData.supportPhone.trim() });
    }

    // 4. Mark request as approved
    await hostelRepository.updateHostelRequest(requestId, {
      status: 'approved',
      approvedHostelId: createdHostel?._id || null,
      supportContact: {
        email: supportEmails.map((e) => `${e.label}: ${e.value}`).join(' | '),
        phone: supportPhones.map((p) => `${p.label}: ${p.value}`).join(' | '),
      },
    });

    // 5. Send Official Approval & Onboarding Email to the client
    const featuresList = (planData.features || [])
      .map((f) => `• ${typeof f === 'string' ? f : f.name}`)
      .join('\n');

    const supportLinesText = [
      ...supportEmails.map((e) => `📧 ${e.label}: ${e.value}`),
      ...supportPhones.map((p) => `💬 ${p.label} (WhatsApp): ${p.value}`),
    ].join('\n');

    const supportLinesHtml = [
      ...supportEmails.map((e) => `<p style="margin: 2px 0;">📧 <strong>${e.label}:</strong> <a href="mailto:${e.value}" style="color: #2563eb;">${e.value}</a></p>`),
      ...supportPhones.map((p) => `<p style="margin: 2px 0;">💬 <strong>${p.label} (WhatsApp):</strong> <a href="https://wa.me/${p.value.replace(/[^0-9]/g, '')}" style="color: #16a34a; font-weight: bold;">${p.value}</a></p>`),
    ].join('');

    const emailLines = [
      `🎉 Congratulations! Your MessPro Hostel Workspace is Ready.`,
      ``,
      `Hostel Name: ${request.hostelName}`,
      `Subdomain / Suffix: ${request.subdomain}.messpro.app`,
      `Assigned Plan: ${planData.name} (10-Day Free Trial Activated)`,
      `Student Capacity Limit: ${planData.limits?.maxStudents === -1 ? 'Unlimited' : (planData.limits?.maxStudents ?? 100)} students`,
      `Manager Limit: ${planData.limits?.maxManagers === -1 ? 'Unlimited' : (planData.limits?.maxManagers ?? 2)} managers`,
      ``,
      `Included Features:`,
      featuresList,
      ``,
      `Login Portal: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
      `Admin Email: ${request.adminEmail}`,
      ``,
      `Need to extend your trial, upgrade limits, or ask questions? Contact MessPro Superadmin support:`,
      supportLinesText,
    ];

    try {
      await sendEmail({
        to: request.adminEmail,
        subject: `🎉 Workspace Activated: Welcome to MessPro 2.0 — ${request.hostelName}`,
        text: emailLines.join('\n'),
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="color: #2563eb;">🎉 Your MessPro Workspace is Active!</h2>
            <p>Hello <strong>${request.adminName}</strong>,</p>
            <p>Your hostel setup request for <strong>${request.hostelName}</strong> has been approved. A 10-day free trial on the <strong>${planData.name}</strong> plan is now active.</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Hostel:</strong> ${request.hostelName}</p>
              <p style="margin: 4px 0;"><strong>Subdomain:</strong> ${request.subdomain}.messpro.app</p>
              <p style="margin: 4px 0;"><strong>Plan Tier:</strong> ${planData.name} (10-Day Free Trial)</p>
              <p style="margin: 4px 0;"><strong>Student Limit:</strong> ${planData.limits?.maxStudents === -1 ? 'Unlimited' : (planData.limits?.maxStudents ?? 100)}</p>
              <p style="margin: 4px 0;"><strong>Manager Limit:</strong> ${planData.limits?.maxManagers === -1 ? 'Unlimited' : (planData.limits?.maxManagers ?? 2)}</p>
            </div>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login to Admin Portal</a></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <h4 style="margin-bottom: 8px; color: #1f2937;">Need to renew, upgrade your plan, or get assistance?</h4>
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #2563eb;">
              ${supportLinesHtml}
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('Could not send approval email to client:', emailErr.message);
    }

    return {
      success: true,
      message: `Hostel "${request.hostelName}" approved and provisioned successfully. Welcome email dispatched to ${request.adminEmail}.`,
      hostel: createdHostel,
    };
  }

  /**
   * Superadmin rejection of a hostel setup request
   */
  async rejectHostelRequest(requestId, reason) {
    const request = await hostelRepository.findHostelRequestById(requestId);
    if (!request) {
      const error = new Error('Hostel setup request not found.');
      error.statusCode = 404;
      throw error;
    }

    if (request.status !== 'pending') {
      const error = new Error(`Cannot reject request: This request is already marked as ${request.status}.`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await hostelRepository.updateHostelRequest(requestId, {
      status: 'rejected',
      rejectionReason: reason,
    });

    try {
      await sendEmail({
        to: request.adminEmail,
        subject: `Update regarding your MessPro Onboarding Request — ${request.hostelName}`,
        text: `Hello ${request.adminName},\n\nThank you for your interest in MessPro 2.0. Regarding your onboarding request for "${request.hostelName}", we are currently unable to approve the setup for the following reason:\n\n${reason}\n\nIf you believe this is a misunderstanding or wish to submit updated details, please feel free to reach out to us.`,
        html: `<p>Hello <strong>${request.adminName}</strong>,</p><p>Thank you for your interest in MessPro 2.0. Regarding your onboarding request for <strong>${request.hostelName}</strong>, our team was unable to approve the request for the following reason:</p><blockquote style="border-left: 3px solid #ef4444; margin: 12px 0; padding-left: 12px; color: #374151;">${reason}</blockquote><p>If you have any questions, please reply to this email.</p>`,
      });
    } catch (e) {
      console.warn('Could not send rejection email:', e.message);
    }

    return {
      success: true,
      message: `Hostel request for "${request.hostelName}" has been rejected.`,
      data: updated,
    };
  }

  /**
   * Superadmin deletion of a hostel: Cascade deletes all admins, managers, students, and tenant records
   */
  async deleteHostel(hostelId) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }

    const result = await hostelRepository.deleteHostelWithCascade(hostelId);
    await cache.del(`hostel:config:${hostelId}`);

    return {
      success: true,
      message: `Hostel "${hostel.name}" and all associated users (${result.deletedUsersCount} total: admins, managers, students) have been permanently deleted.`,
      data: result,
    };
  }
}

export default new HostelService();