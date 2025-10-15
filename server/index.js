import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import agentRoutes from "./src/routes/agentRoutes.js";
import customerDomainRoutes from "./src/routes/customerDomainRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/domains", customerDomainRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "✅ Domain-CRM Backend Running!" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
