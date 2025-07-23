import { Router } from "express";
import { getUsers, promoteUserToAdmin } from "../controllers/user.contoller";
import {} from "../controllers/user.contoller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getUsers);
router.post("/promote", promoteUserToAdmin);

export default router;
