import express from 'express';
import { 
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  getDepartments
} from '../controllers/staff.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllStaff);
router.get('/departments', getDepartments);
router.get('/:id', getStaffById);

// Protected routes (authentication required)
router.post('/', authenticate, createStaff);
router.put('/:id', authenticate, updateStaff);
router.delete('/:id', authenticate, deleteStaff);

export default router; 