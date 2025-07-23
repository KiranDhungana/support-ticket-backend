import { Router } from "express";

import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  getDashboardStats,
} from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/dashboard-stats", getDashboardStats);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);
router.post("/status/:id", updateTicketStatus);

export default router;
