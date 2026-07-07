import express from 'express';
import { createHostel, getHostels, updateSettings } from './hostel.controller.js';


const router = express.Router();

// Maps the HTTP methods to the correct controller functions[cite: 21]
router.route('/')
  .get(getHostels)
  .post(createHostel);


router.route('/:id/settings').patch(updateSettings);

export default router;