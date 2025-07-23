import express from 'express';
import { 
  getAllAnnouncements, 
  getAnnouncementById, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  getActiveAnnouncements,
  getCategories
} from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/active', getActiveAnnouncements);
router.get('/categories', getCategories);
router.get('/:id', getAnnouncementById);

// Protected routes (authentication required)
router.get('/', authenticate, getAllAnnouncements);
router.post('/', authenticate, createAnnouncement);
router.put('/:id', authenticate, updateAnnouncement);
router.delete('/:id', authenticate, deleteAnnouncement);

export default router; 