import express from 'express';
import {
  getAllPublicNotices,
  getPublicNoticeById,
  createPublicNotice,
  updatePublicNotice,
  deletePublicNotice,
  getPublicNoticesByCategory
} from '../controllers/public-notice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllPublicNotices);
router.get('/:id', getPublicNoticeById);
router.get('/category/:category', getPublicNoticesByCategory);

// Protected routes (authentication required)
router.post('/', authenticate, createPublicNotice);
router.put('/:id', authenticate, updatePublicNotice);
router.delete('/:id', authenticate, deletePublicNotice);

export default router; 