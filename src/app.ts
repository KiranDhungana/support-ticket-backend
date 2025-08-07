import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import userRoutes from "./routes/user.routes";
import publicNoticeRoutes from "./routes/public-notice.routes";
import uploadRoutes from "./routes/upload.routes";
import staffRoutes from "./routes/staff.routes";
import announcementRoutes from "./routes/announcement.routes";
import newsRoutes from "./routes/news.routes";
import jobRoutes from "./routes/job.routes";
import boardMemberRoutes from "./routes/board-member.routes";
import calendarRoutes from "./routes/calendar.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://82.25.95.230.nip.io', 'http://82.25.95.230.nip.io/', 'http://localhost:5173'],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/public-notices", publicNoticeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/board-members", boardMemberRoutes);
app.use("/api/calendar", calendarRoutes);

export default app;
