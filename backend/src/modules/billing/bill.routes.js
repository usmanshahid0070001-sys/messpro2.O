import express from 'express';
import {
  generateMonthlyBills,
  getBills,
  getMonthlyBill,
  payBill,
} from './bill.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Students can view only their own bills; staff can view bills for their hostel.
router.get('/', getBills);
router.get('/monthly', getMonthlyBill);

// Generating bills and recording payments are staff actions.
router.post('/generate', restrictTo('admin', 'manager'), generateMonthlyBills);
router.post('/:id/pay', restrictTo('admin', 'manager'), payBill);
router.post('/:id/partial-pay', restrictTo('admin', 'manager'), payBill);

export default router;
