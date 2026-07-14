import crypto from 'crypto';
import hostelRepository from './hostel.repository.js';
import User from '../auth/auth.model.js';
import PlainUser from '../auth/plainUser.model.js';
import Plan from '../plan/plan.model.js';
import { sendEmail } from '../../utils/email.js';



class HostelService {
  async registerHostel(data) {
    const existingName = await hostelRepository.findByName(data.name);
    if (existingName) {
      throw new Error('A hostel with this name is already registered.');
    }

    const existingSubdomain = await hostelRepository.findBySubdomain(data.subdomain);
    if (existingSubdomain) {
      throw new Error('This subdomain is already in use. Please choose another.');
    }

    let planData = null;
    if (data.plan) {
      planData = await Plan.findById(data.plan);
    }
    if (!planData) {
      planData = await Plan.findOne(); // fallback to any existing plan
    }
    
    if (!planData) {
      throw new Error('No subscription plans found in the database. Please create a plan first.');
    }

    const planSnapshot = {
      planId: planData._id,
      name: planData.name,
      limits: planData.limits,
      features: planData.features,
    };

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
    });

    await Promise.all([
      this.createHostelUser(hostel._id, {
        name: data.adminName,
        email: data.adminEmail,
        role: 'admin',
      }),
      this.createHostelUser(hostel._id, {
        name: data.managerName,
        email: data.managerEmail,
        role: 'manager',
      }),
    ]);

    return hostel;
  }

  async getAllHostels() {
    return await hostelRepository.findAll();
  }

  async updateHostelSettings(hostelId, newSettingsData) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) {
      throw new Error('Hostel not found.');
    }

    const updateData = {};

    if (newSettingsData.plan) {
      const planData = await Plan.findById(newSettingsData.plan);
      if (!planData) {
        throw new Error('Selected plan not found.');
      }
      
      updateData.plan = {
        planId: planData._id,
        name: planData.name,
        limits: planData.limits,
        features: planData.features,
      };
    }

    return await hostelRepository.updateHostel(hostelId, updateData);
  }

  async createHostelUser(hostelId, userData) {
    const existing = await User.findOne({ email: userData.email.toLowerCase().trim() });
    if (existing) {
      throw new Error(`User with email ${userData.email} already exists.`);
    }

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
      {
        password,
        role: userData.role,
        name: userData.name,
        hostelId: hostelId.toString(),
      },
      { upsert: true, new: true }
    );

    const lineItems = [
      `Hostel: ${hostel.name}`,
      `Role: ${userData.role}`,
      `Email: ${userData.email}`,
      `Temporary password: ${password}`,
      `Login here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
    ];

    await sendEmail({
      to: userData.email,
      subject: `Welcome to MessPro — ${userData.role} access created`,
      text: `Your ${userData.role} account has been created.

${lineItems.join('\n')}

Please change your password after first login.
`,
      html: `<p>Your <strong>${userData.role}</strong> account has been created.</p>
<p>${lineItems.map((line) => line.replace(/\n/g, '<br/>')).join('<br/>')}</p>
<p>Please change your password after first login.</p>`,
    });

    return { email: user.email, role: user.role, name: user.name };
  }

  async addHostelUser(hostelId, userData) {
    const hostel = await hostelRepository.findById(hostelId);
    if (!hostel) {
      throw new Error('Hostel not found.');
    }

    return this.createHostelUser(hostelId, userData);
  }
}

export default new HostelService();