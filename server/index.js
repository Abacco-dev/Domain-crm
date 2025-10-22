import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import agentRoutes from "./src/routes/agentRoutes.js";
import customerDomainRoutes from "./src/routes/customerDomainRoutes.js";
import manageRoutes from "./src/routes/manageRoutes.js";
import allInfoRoutes from "./src/routes/allInfoRoutes.js";
import domainRoutes from "./src/routes/domainRoutes.js";
import emailRoutes from "./src/routes/emails.js";
import employeesRoutes from "./src/routes/employeesRoutes.js";

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
app.use("/api/manage", manageRoutes);

app.use("/api/all-info", allInfoRoutes);
app.use("/api/domain-manager", domainRoutes);
app.use("/api/manage/emails", emailRoutes);
app.use("/api/employees", employeesRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({ message: "✅ Domain-CRM Backend Running!" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
