import jwt from 'jsonwebtoken';
import { io } from '../../server.js';
import User from '../auth/auth.model.js';
import Hostel from '../hostel/hostel.model.js';
import MealSchedule from '../meal/meal.model.js';
import Attendance from './attendance.model.js';

class QRService {
  /**
   * Generates a secure QR token for a manager's hostel valid for 1 year.
   */
  generateManagerQRToken(hostelId) {
    const payload = {
      type: 'manager_qr',
      hostelId: hostelId.toString()
    };
    
    // Expires in 1 year
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'messpro-dev-secret', {
      expiresIn: '365d'
    });
    
    return {
      token,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Calculate which meal the current time corresponds to based on the hostel's local timezone.
   */
  async calculateCurrentMeal(hostelId) {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) throw new Error('Hostel not found');

    const schedule = await MealSchedule.findOne({ hostelId, status: 'active' });
    if (!schedule || !schedule.selectionTiming || schedule.selectionTiming.length === 0) {
      throw new Error('Meal schedule timings not configured for this hostel');
    }

    // Get current time in the hostel's timezone
    const timezone = hostel.location || 'Asia/Karachi'; // default fallback
    
    const now = new Date();
    
    // Format the current date in that timezone: YYYY-MM-DD
    const localDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    const localDayName = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long'
    }).format(now);

    // To compare times, we will convert current time to minutes past midnight in local timezone
    const localTimeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now).split(':');
    
    const currentMinutes = parseInt(localTimeParts[0]) * 60 + parseInt(localTimeParts[1]);

    let selectedMealIndex = schedule.selectionTiming.length - 1; // Default to last meal

    for (let i = 0; i < schedule.selectionTiming.length; i++) {
      const timingStr = schedule.selectionTiming[i]; // e.g. "09:00 AM"
      
      // Parse "hh:mm A" into minutes past midnight
      const [time, modifier] = timingStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      
      if (hours === 12 && modifier === 'AM') hours = 0;
      if (hours < 12 && modifier === 'PM') hours += 12;
      
      const thresholdMinutes = hours * 60 + parseInt(minutes, 10);

      // If current time is strictly before this threshold, it belongs to this meal
      if (currentMinutes < thresholdMinutes) {
        selectedMealIndex = i;
        break;
      }
    }

    const mealType = schedule.mealNames[selectedMealIndex];
    
    // Get menu info for this meal
    const todaysMenu = schedule.menu[localDayName] || [];
    const menuItem = todaysMenu[selectedMealIndex];
    
    const mealInfo = {
      name: menuItem?.meal && menuItem.meal !== 'none' ? menuItem.meal : 'Regular Meal',
      price: menuItem?.price || 0
    };

    return {
      date: localDateStr,
      mealType,
      mealInfo
    };
  }

  /**
   * Core logic to mark attendance and emit socket event
   */
  async markAttendance(hostelId, student, isGuest = false) {
    const mealData = await this.calculateCurrentMeal(hostelId);
    
    // Save to DB and get updated document
    const updatedDoc = await Attendance.findOneAndUpdate(
      {
        hostel: hostelId,
        date: mealData.date,
        mealType: mealData.mealType,
        rollNumber: student.id
      },
      {
        $set: {
          hostel: hostelId,
          date: mealData.date,
          mealType: mealData.mealType,
          mealInfo: mealData.mealInfo,
          rollNumber: student.id,
          isGuest,
          userRef: student._id
        },
        $inc: { count: 1 }
      },
      { upsert: true, new: true }
    );

    // Emit live success notification to manager's room
    io.to(hostelId.toString()).emit('attendance_success', {
      rollNumber: student.id,
      name: student.name,
      isGuest,
      mealType: mealData.mealType,
      date: mealData.date,
      count: updatedDoc.count
    });

    return mealData;
  }
}

export default new QRService();
