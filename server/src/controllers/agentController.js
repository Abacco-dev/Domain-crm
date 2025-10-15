import  {prisma } from "../../prisma/prismaClient.js";

// ➕ Add new Agent
export const addAgent = async (req, res) => {
  try {
    const { domainHost, loginId, loginPass, customerId } = req.body;

    const newAgent = await prisma.agent.create({
      data: { domainHost, loginId, loginPass, customerId },
    });

    res.json(newAgent);
  } catch (error) {
    res.status(500).json({ message: "Error adding agent", error });
  }
};

// 📄 Get all Agents
export const getAgents = async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: { domains: true },
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching agents", error });
  }
};

// 🔍 Get Agent by ID
export const getAgentById = async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { domains: true },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Error fetching agent", error });
  }
};
