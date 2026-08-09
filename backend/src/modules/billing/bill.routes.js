import express from 'express';
import {
  generateMonthlyBills,
  getBills,
  getMonthlyBill,
  payBill,
  getMealPricesForBilling,
  updateMealPrices,
  getBillingSettings,
  updateBillingSettings
} from './bill.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Admin / Manager fetching aggregated meal records for setting prices
router.route('/meal-prices')
  .get(restrictTo('admin', 'manager'), getMealPricesForBilling)
  .put(restrictTo('admin', 'manager'), updateMealPrices);

// Students can view only their own bills; staff can view bills for their hostel.
router.get('/', getBills);
router.get('/monthly', getMonthlyBill);

// Billing Configuration
router.route('/settings')
  .get(restrictTo('admin', 'manager'), getBillingSettings)
  .put(restrictTo('admin', 'manager'), updateBillingSettings);

// Generating bills and recording payments are staff actions.
router.post('/generate', restrictTo('admin', 'manager'), generateMonthlyBills);
router.post('/:id/pay', restrictTo('admin', 'manager'), payBill);
router.post('/:id/partial-pay', restrictTo('admin', 'manager'), payBill);

export default router;
