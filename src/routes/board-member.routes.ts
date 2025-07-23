import express from 'express';
import { 
  getAllBoardMembers, 
  getBoardMemberById, 
  createBoardMember, 
  updateBoardMember, 
  deleteBoardMember 
} from '../controllers/board-member.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllBoardMembers);
router.get('/:id', getBoardMemberById);

// Protected routes (admin only)
router.post('/', authenticate, createBoardMember);
router.put('/:id', authenticate, updateBoardMember);
router.delete('/:id', authenticate, deleteBoardMember);

export default router; 