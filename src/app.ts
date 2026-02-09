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
import settingRoutes from "./routes/setting.routes";

dotenv.config();

const app = express();


// ✅ Allowed origins (NO trailing slash)
const allowedOrigins = [
  "https://82.25.95.230.nip.io",
  "http://localhost:5173",
];


// ✅ Correct CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests like Postman or curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight
app.options("*", cors());


// Body parser
app.use(express.json());


// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});


// Routes
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
app.use("/api/settings", settingRoutes);


export default app;
