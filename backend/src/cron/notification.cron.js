import 'dotenv/config';
import cron from 'node-cron';
import webpush from 'web-push';
import MealSchedule from '../modules/meal/meal.model.js';
import MealRecord from '../modules/mealRecord/mealRecord.model.js';
import User from '../modules/auth/auth.model.js';
import mongoose from 'mongoose';

// Initialize web-push if keys are available
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@messpro.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('⚠️ VAPID keys are missing. Push notifications will not work.');
}

// Helper to convert time string (e.g., "14:00" or "02:00 PM") to Date object today
const parseTimeToday = (timeStr) => {
  if (!timeStr) return null;
  const now = new Date();
  
  // Handle HH:MM Format
  if (timeStr.includes(':') && !timeStr.toLowerCase().includes('m')) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  }

  // Handle hh:mm AM/PM Format
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let [_, hours, minutes, modifier] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (hours === 12) hours = 0;
    if (modifier.toUpperCase() === 'PM') hours += 12;

    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  }

  return null;
};

// Send notification helper
const sendNotification = async (user, payload) => {
  if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

  const validSubscriptions = [];
  
  for (const subscription of user.pushSubscriptions) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      validSubscriptions.push(subscription); // Keep valid ones
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        // Subscription has expired or is no longer valid
        console.log(`Subscription expired for user ${user._id}`);
      } else {
        console.error('Push notification error:', error);
        validSubscriptions.push(subscription); // keep it if it's a server error
      }
    }
  }

  // Update user's subscriptions if some expired
  if (validSubscriptions.length !== user.pushSubscriptions.length) {
    user.pushSubscriptions = validSubscriptions;
    await user.save();
  }
};

// ==========================================
// 🕒 CRON JOB 1: Meal Selection Reminder
// Runs every 15 minutes
// ==========================================
cron.schedule('*/15 * * * *', async () => {
  try {
    const now = new Date();
    const activeSchedules = await MealSchedule.find({ status: 'active' });

    for (const schedule of activeSchedules) {
      if (!schedule.selectionTiming || schedule.selectionTiming.length === 0) continue;

      for (let i = 0; i < schedule.selectionTiming.length; i++) {
        const timing = schedule.selectionTiming[i];
        const mealName = schedule.mealNames[i] || 'Meal';
        
        const selectionEnd = parseTimeToday(timing.end);
        if (!selectionEnd) continue;

        const diffMinutes = (selectionEnd - now) / (1000 * 60);

        // If selection ends in the next 15 to 30 minutes
        if (diffMinutes > 0 && diffMinutes <= 30) {
          const dateStr = now.toISOString().split('T')[0];

          // Find students in this hostel
          const students = await User.find({ hostelId: schedule.hostelId, role: 'student' });

          for (const student of students) {
            // Check if they already selected
            const record = await MealRecord.findOne({
              hostelId: schedule.hostelId,
              date: dateStr,
              mealType: mealName,
              studentId: student._id
            });

            if (!record || !record.selection.hasSelected) {
              await sendNotification(student, {
                title: 'Meal Selection Reminder',
                body: `Don't forget to select your ${mealName} before the cutoff time!`,
                icon: '/pwa-192x192.png'
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in selection reminder cron:', error);
  }
});

// ==========================================
// 🕒 CRON JOB 2: Serving Time Started
// Runs every 5 minutes
// ==========================================
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const activeSchedules = await MealSchedule.find({ status: 'active' });

    for (const schedule of activeSchedules) {
      if (!schedule.servingTiming || schedule.servingTiming.length === 0) continue;

      for (let i = 0; i < schedule.servingTiming.length; i++) {
        const timing = schedule.servingTiming[i];
        const mealName = schedule.mealNames[i] || 'Meal';
        
        const servingStart = parseTimeToday(timing.start);
        if (!servingStart) continue;

        const diffMinutes = (now - servingStart) / (1000 * 60);

        // If serving time just started (within the last 5 minutes)
        if (diffMinutes >= 0 && diffMinutes < 5) {
          const dateStr = now.toISOString().split('T')[0];

          // Find users who have selected but not eaten
          const records = await MealRecord.find({
            hostelId: schedule.hostelId,
            date: dateStr,
            mealType: mealName,
            'selection.hasSelected': true,
            'attendance.hasEaten': false
          }).populate('studentId');

          for (const record of records) {
            if (record.studentId) {
              await sendNotification(record.studentId, {
                title: 'Meal is Ready!',
                body: `Your ${mealName} is now being served in the dining hall.`,
                icon: '/pwa-192x192.png'
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in serving time cron:', error);
  }
});

console.log('🕒 Notification cron jobs scheduled.');
