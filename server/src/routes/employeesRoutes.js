import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* ===========================================================
   👥 EMPLOYEE MANAGEMENT ROUTES
   Used in: EmployeesManager.jsx
=========================================================== */

// ✅ GET — Fetch all employees (inactive first)
router.get("/", async (req, res) => {
  try {
    const employees = await prisma.agent.findMany({
      select: {
        id: true,
        agentName: true,
        empId: true,
        isActive: true,
      },
      orderBy: [
        { isActive: "asc" }, // Inactive first
        { id: "desc" }, // Newest last
      ],
    });

    res.status(200).json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// ✅ PATCH — Toggle employee active/inactive
router.patch("/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const employee = await prisma.agent.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const updated = await prisma.agent.update({
      where: { id },
      data: { isActive: !employee.isActive },
    });

    res.status(200).json({
      message: `✅ Employee ${updated.isActive ? "activated" : "deactivated"} successfully`,
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error toggling employee status:", err);
    res.status(500).json({ error: "Failed to toggle employee status" });
  }
});

export default router;
