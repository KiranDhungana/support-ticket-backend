import express from 'express';
import { 
  getAllNews, 
  getNewsById, 
  createNews, 
  updateNews, 
  deleteNews,
  getPublishedNews,
  togglePublishStatus
} from '../controllers/news.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/published', getPublishedNews);
router.get('/:id', getNewsById);

// Protected routes (authentication required)
router.get('/', authenticate, getAllNews);
router.post('/', authenticate, createNews);
router.put('/:id', authenticate, updateNews);
router.delete('/:id', authenticate, deleteNews);
router.patch('/:id/publish', authenticate, togglePublishStatus);

export default router; 