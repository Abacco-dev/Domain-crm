import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all agents
router.get("/", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({ include: { domain: true } });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agents by domainId
router.get("/domain/:id", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { domainId: Number(req.params.id) },
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an agent
router.delete("/:id", async (req, res) => {
  try {
    await prisma.agent.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
