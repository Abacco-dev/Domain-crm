// controllers/domainController.js
import prisma from "../prismaClient.js";

// ➕ Add new Domain with nested Agent(s)
export const addDomain = async (req, res) => {
  try {
    console.log("📩 Incoming body:", req.body);

    const {
      domainHost,
      loginId,
      loginPass,
      customerId,
      domainName,
      domainPurchaseDate,
      domainExpiryDate,
      domainPrice,
      domainEmailHost,
      emailHostPurchase,
      emailHostExpiry,
      emailPrice,
      emailCount,
      emailAddresses,
      agents
    } = req.body;

    // ✅ Validate required fields
    if (
      !domainHost ||
      !loginId ||
      !loginPass ||
      !customerId ||
      !domainName ||
      !agents ||
      !Array.isArray(agents) ||
      agents.length === 0
    ) {
      console.log("❌ Missing domain or agent data");
      return res.status(400).json({ error: "Missing domain or agent data" });
    }

    // ✅ Create domain and nested agents
    const newDomain = await prisma.domain.create({
      data: {
        domainHost,
        loginId,
        loginPass,
        customerId,
        domainName,
        domainPurchaseDate: new Date(domainPurchaseDate),
        domainExpiryDate: new Date(domainExpiryDate),
        domainPrice: Number(domainPrice),
        domainEmailHost,
        emailHostPurchase: new Date(emailHostPurchase),
        emailHostExpiry: new Date(emailHostExpiry),
        emailPrice: Number(emailPrice),
        emailCount: Number(emailCount),
        emailAddresses,
        agents: {
          create: agents.map((a) => ({
            agentName: a.agentName,
            agentEmail: a.agentEmail,
            agentPassword: a.agentPassword,
            adminId: a.adminId,
          })),
        },
      },
      include: { agents: true },
    });

    console.log("✅ Domain created successfully:", newDomain);
    res.status(201).json(newDomain);
  } catch (error) {
    console.error("❌ Error creating domain:", error);
    res.status(500).json({ error: "Failed to create domain", details: error.message });
  }
};

// 📄 Get all domains
export const getAllDomains = async (req, res) => {
  try {
    const domains = await prisma.domain.findMany({
      include: { agents: true },
    });
    res.json(domains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching domains" });
  }
};

// 🔍 Get domain by ID
export const getDomainById = async (req, res) => {
  try {
    const domain = await prisma.domain.findUnique({
      where: { id: Number(req.params.id) },
      include: { agents: true },
    });
    res.json(domain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching domain" });
  }
};

// ✏️ Update domain
export const updateDomain = async (req, res) => {
  try {
    const updatedDomain = await prisma.domain.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(updatedDomain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating domain" });
  }
};

// ❌ Delete domain (and agents)
export const deleteDomain = async (req, res) => {
  try {
    const domainId = Number(req.params.id);
    await prisma.agent.deleteMany({
      where: { domainId },
    });
    await prisma.domain.delete({
      where: { id: domainId },
    });
    res.json({ message: "Domain deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting domain" });
  }
};
