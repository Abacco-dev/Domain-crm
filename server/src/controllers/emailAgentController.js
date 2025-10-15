import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all agents
export const getAgents = async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({ include: { domain: true } });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single agent
export const getAgentById = async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { domain: true },
    });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create agent
export const createAgent = async (req, res) => {
  try {
    const newAgent = await prisma.agent.create({ data: req.body });
    res.json(newAgent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update agent
export const updateAgent = async (req, res) => {
  try {
    const updatedAgent = await prisma.agent.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updatedAgent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete agent
export const deleteAgent = async (req, res) => {
  try {
    await prisma.agent.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
