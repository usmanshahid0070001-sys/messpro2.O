// import crypto from 'crypto';
// import hostelRepository from './hostel.repository.js';
// import User from '../auth/auth.model.js';
// import PlainUser from '../auth/plainUser.model.js';
// import Plan from '../plan/plan.model.js';
// import { sendEmail } from '../../utils/email.js';



// class HostelService {
//   async registerHostel(data) {
//     const existingName = await hostelRepository.findByName(data.name);
//     if (existingName) {
//       throw new Error('A hostel with this name is already registered.');
//     }

//     // const existingSubdomain = await hostelRepository.findBySubdomain(data.subdomain);
//     // if (existingSubdomain) {
//     //   throw new Error('This subdomain is already in use. Please choose another.');
//     // }

//     const adminExists = await User.findOne({ email: data.adminEmail.toLowerCase().trim() });
//     if (adminExists) {
//       throw new Error(`User with email ${data.adminEmail} already exists.`);
//     }

//     const managerExists = await User.findOne({ email: data.managerEmail.toLowerCase().trim() });
//     if (managerExists) {
//       throw new Error(`User with email ${data.managerEmail} already exists.`);
//     }

//     let planData = null;
//     if (data.plan) {
//       planData = await Plan.findById(data.plan);
//     }
//     if (!planData) {
//       planData = await Plan.findOne(); // fallback to any existing plan
//     }
    
//     if (!planData) {
//       throw new Error('No subscription plans found in the database. Please create a plan first.');
//     }

//     const planSnapshot = {
//       planId: planData._id,
//       name: planData.name,
//       limits: planData.limits,
//       features: planData.features,
//     };

//     const hostel = await hostelRepository.create({
//       name: data.name,
//       subdomain: data.subdomain,
//       location: data.location,
//       plan: planSnapshot,
//       settings: {
//         authMethod: data.settings?.authMethod || 'Email',
//         attendanceMethod: data.settings?.attendanceMethod || 'Manual',
//         billingModel: data.settings?.billingModel || 'Prepaid',
//         autoMealVerification: data.settings?.autoMealVerification ?? true,
//       },
//       status: 'Active',
//     });

//     try {
//       await Promise.all([
//         this.createHostelUser(newhostel._id, newhostel.name, {
//           name: data.adminName,
//           email: data.adminEmail,
//           role: 'admin',
//         }),
//         this.createHostelUser(newhostel._id, newhostel.name, {
//           name: data.managerName,
//           email: data.managerEmail,
//           role: 'manager',
//         }),
//       ]);
//     } catch (error) {
//       // Manual rollback to maintain atomicity if user creation fails
//       await hostelRepository.delete(hostel._id);
//       throw new Error(`Failed to create initial users, hostel creation rolled back. Original error: ${error.message}`);
//     }

//     return hostel;
//   }

//   async getAllHostels() {
//     return await hostelRepository.findAll();
//   }


//   async getHostelById(hostelId) {
//     const hostel = await hostelRepository.findById(hostelId);
//     if (!hostel) {
//       throw new Error('Hostel not found.');
//     }
//     return hostel;
//   }

//   async updateHostelSettings(hostelId, newSettingsData) {
//     const hostel = await hostelRepository.findById(hostelId);
//     if (!hostel) {
//       throw new Error('Hostel not found.');
//     }

//     const updateData = {};

//     if (newSettingsData.plan) {
//       const planData = await Plan.findById(newSettingsData.plan);
//       if (!planData) {
//         throw new Error('Selected plan not found.');
//       }
      
//       updateData.plan = {
//         planId: planData._id,
//         name: planData.name,
//         limits: planData.limits,
//         features: planData.features,
//       };
//     }

//     return await hostelRepository.updateHostel(hostelId, updateData);
//   }

//   async createHostelUser(hostelId,hostelName,userData) {
//     const existing = await User.findOne({ email: userData.email.toLowerCase().trim() });
//     if (existing) {
//       throw new Error(`User with email ${userData.email} already exists.`);
//     }

//     const password = crypto.randomBytes(8).toString('base64url');
//     const user = await User.create({
//       name: userData.name,
//       email: userData.email.toLowerCase().trim(),
//       role: userData.role,
//       hostelId: hostel._id.toString(),
//       password,
//     });

//     await PlainUser.findOneAndUpdate(
//       { email: userData.email.toLowerCase().trim() },
//       {
//         password,
//         role: userData.role,
//         name: userData.name,
//         hostelId: hostel._id.toString(),
//       },
//       { upsert: true, new: true }
//     );

//     const lineItems = [
//       `Hostel: ${hostelName}`,
//       `Role: ${userData.role}`,
//       `Email: ${userData.email}`,
//       `Temporary password: ${password}`,
//       `Login here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
//     ];

//     await sendEmail({
//       to: userData.email,
//       subject: `Welcome to MessPro — ${userData.role} access created`,
//       text: `Your ${userData.role} account has been created.

// ${lineItems.join('\n')}

// Please change your password after first login.
// `,
//       html: `<p>Your <strong>${userData.role}</strong> account has been created.</p>
// <p>${lineItems.map((line) => line.replace(/\n/g, '<br/>')).join('<br/>')}</p>
// <p>Please change your password after first login.</p>`,
//     });

//     return { email: user.email, role: user.role, name: user.name };
//   }

//   // async addHostelUser(hostelId, userData) {
//   //   const hostel = await hostelRepository.findById(hostelId);
//   //   if (!hostel) {
//   //     throw new Error('Hostel not found.');
//   //   }

//   //   return this.createHostelUser(hostelId,hostel.name,userData);
//   // }

//   async addHostelUser(creatorRole,hostelId, userData) {



// const allowedCreations = {
//       superadmin: ['admin', 'manager'],
//       admin:      ['manager', 'student'],
//       manager:    ['student'],
//       student:    [] 
//     };

//     if (!allowedCreations[creatorRole]?.includes(userData.role)) {
//       const error = new Error(`Access Denied: A ${creatorRole} cannot create a ${userData.role}.`);
//       error.statusCode = 403; // 403 Forbidden
//       throw error;
//     }

//     const hostel = await hostelRepository.findById(hostelId);
//     if (!hostel) {
//       throw new Error('Hostel not found.');
//     }

//     // 🚨 THE SAAS BOUNCER: Check Plan Limits
//     if (userData.role === 'manager' || userData.role === 'student') {
//       // 1. Count how many users of this role already exist in this specific hostel
//       const currentCount = await User.countDocuments({ 
//         hostelId: hostelId.toString(), 
//         role: userData.role 
//       });

//       // 2. Check the snapshot for the limit
//       const limit = userData.role === 'manager' 
//         ? hostel.plan.limits.maxManagers 
//         : hostel.plan.limits.maxStudents;

//       // 3. Block them if they hit the limit (-1 usually means unlimited)
//       if (limit !== -1 && currentCount >= limit) {
//         const error = new Error(`Upgrade required. Your current plan only allows ${limit} ${userData.role}(s).`);
//         error.statusCode = 402; // 402 means "Payment Required"
//         throw error;
//       }
//     }

//     // If they pass the bouncer, create the user!
//     return this.createHostelUser(hostelId, hostel.name, userData);
//   }
// }

// export default new HostelService();


import crypto from 'crypto';
import hostelRepository from './hostel.repository.js';
import User from '../auth/auth.model.js';
import PlainUser from '../auth/plainUser.model.js';
import Plan from '../plan/plan.model.js';
import { sendEmail } from '../../utils/email.js';

class HostelService {
  async registerHostel(data) {
    const existingName = await hostelRepository.findByName(data.name);
    if (existingName) throw new Error('A hostel with this name is already registered.');

    const adminExists = await User.findOne({ email: data.adminEmail.toLowerCase().trim() });
    if (adminExists) throw new Error(`User with email ${data.adminEmail} already exists.`);

    const managerExists = await User.findOne({ email: data.managerEmail.toLowerCase().trim() });
    if (managerExists) throw new Error(`User with email ${data.managerEmail} already exists.`);

    let planData = await (data.plan ? Plan.findById(data.plan) : Plan.findOne());
    if (!planData) throw new Error('No subscription plans found. Create a plan first.');

    const planSnapshot = {
      planId: planData._id,
      name: planData.name,
      limits: planData.limits,
      features: planData.features.map(f => ({ name: f, isEnabled: true })),
    };

    // Give them an initial 30 days of access
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); 

    const hostel = await hostelRepository.create({
      name: data.name,
      subdomain: data.subdomain,
      location: data.location,
      plan: planSnapshot,
      settings: {
        authMethod: data.settings?.authMethod || 'Email',
        attendanceMethod: data.settings?.attendanceMethod || 'Manual',
        billingModel: data.settings?.billingModel || 'Prepaid',
        autoMealVerification: data.settings?.autoMealVerification ?? true,
      },
      status: 'Active',
      subscriptionExpiresAt: expiresAt, // 👈 New Tracking Field
    });

    try {
      await Promise.all([
        this.createHostelUser(hostel._id, hostel.name, {
          name: data.adminName, email: data.adminEmail, role: 'admin',
        }),
        this.createHostelUser(hostel._id, hostel.name, {
          name: data.managerName, email: data.managerEmail, role: 'manager',
        }),
      ]);
    } catch (error) {
      await hostelRepository.delete(hostel._id);
      throw new Error(`Failed to create initial users, hostel creation rolled back. Original error: ${error.message}`);
    }

    return hostel;
  }

  // 👇 PHASE 1 FEATURE: The Auto-Expiring Status Checker
  async getAndSyncHostelStatus(hostelId) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) return 'Inactive';

    const now = new Date();
    const expires = hostel.subscriptionExpiresAt ? new Date(hostel.subscriptionExpiresAt) : new Date(0);

    // If they are past their expiry date and currently active, downgrade them
    if (expires < now && hostel.status === 'Active') {
      await hostelRepository.updateHostel(hostelId, { status: 'Expired' });
      return 'Expired';
    }

    return hostel.status;
  }

  // 👇 PHASE 1 FEATURE: Bulletproof Subscription Math
  async extendOrUpgradeSubscription(hostelId, planId, additionalDays) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) throw new Error('Hostel not found.');

    const updateData = {};
    const now = new Date();
    const currentExpiry = hostel.subscriptionExpiresAt ? new Date(hostel.subscriptionExpiresAt) : now;

    // THE GOLDEN RULE: Max(Current Date, Old Expiration Date) + Added Days
    // This guarantees no duplicate days and no cheating!
    const baseDate = currentExpiry > now ? currentExpiry : now;
    updateData.subscriptionExpiresAt = new Date(baseDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
    updateData.status = 'Active'; // Immediately unlock them if they were expired
    if (additionalDays > 0) {
      updateData.isTrial = false; // Ends trial if days are added
    }

    if (planId && planId !== hostel.plan?.planId?.toString()) {
      const planData = await Plan.findById(planId);
      if (!planData) throw new Error('Selected plan not found.');
      updateData.plan = {
        planId: planData._id,
        name: planData.name,
        limits: planData.limits,
        features: planData.features.map(f => ({ name: f, isEnabled: true })),
      };
    }

    return await hostelRepository.updateHostel(hostelId, updateData);
  }

  async getAllHostels() { return await hostelRepository.findAll(); }

  async getHostelById(hostelId) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) throw new Error('Hostel not found.');
    return hostel;
  }

  async updateHostelSettings(hostelId, newSettingsData) {
    // Basic settings updater remains the same
    return await hostelRepository.updateHostel(hostelId, newSettingsData);
  }

  async createHostelUser(hostelId, hostelName, userData) {
    const existing = await User.findOne({ email: userData.email.toLowerCase().trim() });
    if (existing) throw new Error(`User with email ${userData.email} already exists.`);

    const password = crypto.randomBytes(8).toString('base64url');
    const user = await User.create({
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      role: userData.role,
      hostelId: hostelId.toString(),
      password,
    });

    await PlainUser.findOneAndUpdate(
      { email: userData.email.toLowerCase().trim() },
      { password, role: userData.role, name: userData.name, hostelId: hostelId.toString() },
      { upsert: true, new: true }
    );

    const lineItems = [
      `Hostel: ${hostelName}`, `Role: ${userData.role}`, `Email: ${userData.email}`,
      `Temporary password: ${password}`, `Login here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
    ];

    await sendEmail({
      to: userData.email,
      subject: `Welcome to MessPro — ${userData.role} access created`,
      text: `Your ${userData.role} account has been created.\n\n${lineItems.join('\n')}\n\nPlease change your password after first login.`,
      html: `<p>Your <strong>${userData.role}</strong> account has been created.</p><p>${lineItems.map((line) => line.replace(/\n/g, '<br/>')).join('<br/>')}</p><p>Please change your password after first login.</p>`,
    });

    return { email: user.email, role: user.role, name: user.name };
  }

  async addHostelUser(creatorRole, hostelId, userData) {
    const allowedCreations = { superadmin: ['admin', 'manager'], admin: ['manager', 'student'], manager: ['student'], student: [] };
    if (!allowedCreations[creatorRole]?.includes(userData.role)) {
      const error = new Error(`Access Denied: A ${creatorRole} cannot create a ${userData.role}.`);
      error.statusCode = 403; throw error;
    }

    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) throw new Error('Hostel not found.');

    if (userData.role === 'manager' || userData.role === 'student') {
      const currentCount = await User.countDocuments({ hostelId: hostelId.toString(), role: userData.role });
      const limit = userData.role === 'manager' ? hostel.plan.limits.maxManagers : hostel.plan.limits.maxStudents;
      if (limit !== -1 && currentCount >= limit) {
        const error = new Error(`Upgrade required. Your current plan only allows ${limit} ${userData.role}(s).`);
        error.statusCode = 402; throw error;
      }
    }

    return this.createHostelUser(hostelId, hostel.name, userData);
  }
}

export default new HostelService();