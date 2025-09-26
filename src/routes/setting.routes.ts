import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, updateSettings);

export default router;


