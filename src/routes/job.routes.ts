import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getJobCategories,
  getJobTypes
} from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/categories', getJobCategories);
router.get('/types', getJobTypes);
router.get('/:id', getJobById);

// Protected routes (admin only)
router.post('/', authenticate, createJob);
router.put('/:id', authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);
router.patch('/:id/toggle-status', authenticate, toggleJobStatus);

export default router; 