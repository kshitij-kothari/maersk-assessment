import express from "express";
import cors from "cors";
import vendorRoutes from "./routes/vendors";

const app = express();
const port = process.env.PORT || 3000;
// Middleware - CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/api/vendors", vendorRoutes);
// Health check endpoint
app.get("/health", (req: any, res: any) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});
// Root endpoint
app.get("/", (req: any, res: any) => {
  res.status(200).json({
    message: "Vendor Onboarding API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      vendors: "/api/vendors",
    },
  });
});
// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({ message: "Route not found" });
});
// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});
app.listen(port, () => {
  console.log(`
    Server is running on port ${port}
    API Base URL: http://localhost:${port}/api
    Health Check: http://localhost:${port}/health
    `);
});
