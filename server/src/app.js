import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "../../Real projects/JobTrack/server/src/routes/auth.routes.js";
import companyRoutes from "../../Real projects/JobTrack/server/src/routes/company.routes.js";
import jobRoutes from "../../Real projects/JobTrack/server/src/routes/job.routes.js";
import applicationRoutes from "../../Real projects/JobTrack/server/src/routes/application.routes.js";
import savedJobRoutes from "../../Real projects/JobTrack/server/src/routes/savedJob.routes.js";
import profileRoutes from "../../Real projects/JobTrack/server/src/routes/profile.routes.js";
import resumeAnalysisRoutes from "../../Real projects/JobTrack/server/src/routes/resumeAnalysis.routes.js";
import resumeRoutes from "../../Real projects/JobTrack/server/src/routes/resume.routes.js";
import { requestLogger } from "../../Real projects/JobTrack/server/src/middlewares/requestLogger.js";
import { errorHandler } from "../../Real projects/JobTrack/server/src/middlewares/errorHandler.js";
import notificationRoutes from "../../Real projects/JobTrack/server/src/routes/notification.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

app.use(requestLogger);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume-analysis", resumeAnalysisRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/notifications", notificationRoutes);


app.use(errorHandler);

export { app };
