import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* ======================================================
   🌐 FETCH ALL — Combined Host + Domain + Agent Info
====================================================== */
router.get("/combined", async (req, res) => {
  try {
    const hosts = await prisma.domainHostAccount.findMany({
      include: {
        domains: {
          include: {
            agents: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.json(hosts);
  } catch (err) {
    console.error("Error fetching all info:", err);
    res.status(500).json({ error: "Failed to fetch all data" });
  }
});


// ✅ Get all emails belonging to an agent — checks both agentId and agentEmail
router.get("/emails/by-agent/:id", async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);

    // Fetch the agent first
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { agentEmail: true },
    });

    if (!agent) return res.status(404).json({ error: "Agent not found" });

    // ✅ Find all emails linked to agentId or same email address
    const emails = await prisma.emailAccount.findMany({
      where: {
        OR: [
          { agentId },
          { email: { equals: agent.agentEmail, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        domainId: true,
      },
    });

    res.json(emails);
  } catch (err) {
    console.error("❌ Error fetching emails by agent:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   🧩 CREATE NEW HOST ACCOUNT
====================================================== */
router.post("/hosts", async (req, res) => {
  try {
    const { domainHost, loginId, loginPass, customerId } = req.body;

    if (!domainHost || !loginId)
      return res.status(400).json({ error: "Missing required fields" });

    const newHost = await prisma.domainHostAccount.create({
      data: { domainHost, loginId, loginPass, customerId },
    });

    res.status(201).json({ message: "Host created successfully", host: newHost });
  } catch (err) {
    console.error("Error creating host:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ➕ ADD NEW DOMAIN under a host account
====================================================== */
router.post("/domains", async (req, res) => {
  try {
    const { hostAccountId, domainName, domainPurchaseDate, domainExpiryDate, domainPrice } =
      req.body;

    if (!hostAccountId || !domainName)
      return res.status(400).json({ error: "hostAccountId and domainName required" });

    const newDomain = await prisma.domain.create({
      data: {
        hostAccountId,
        domainName,
        domainPurchaseDate: domainPurchaseDate ? new Date(domainPurchaseDate) : null,
        domainExpiryDate: domainExpiryDate ? new Date(domainExpiryDate) : null,
        domainPrice: domainPrice ? parseInt(domainPrice) : null,
      },
    });

    res.status(201).json({ message: "Domain added successfully", domain: newDomain });
  } catch (err) {
    console.error("Error adding domain:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ✏️ UPDATE HOST ACCOUNT INFO
====================================================== */
router.put("/hosts/:id", async (req, res) => {
  try {
    const hostId = parseInt(req.params.id);
    const { domainHost, loginId, loginPass, customerId } = req.body;

    const updated = await prisma.domainHostAccount.update({
      where: { id: hostId },
      data: {
        domainHost,
        loginId,
        loginPass,
        customerId,
      },
    });

    res.json({ message: "Host updated successfully", host: updated });
  } catch (err) {
    console.error("Error updating host:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ✏️ UPDATE DOMAIN INFO
====================================================== */
router.put("/domains/:id", async (req, res) => {
  try {
    const domainId = parseInt(req.params.id);
    const { domainName, domainPurchaseDate, domainExpiryDate, domainPrice } = req.body;

    const existing = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!existing) return res.status(404).json({ error: "Domain not found" });

    const updatedDomain = await prisma.domain.update({
      where: { id: domainId },
      data: {
        domainName: domainName ?? existing.domainName,
        domainPurchaseDate: domainPurchaseDate
          ? new Date(domainPurchaseDate)
          : existing.domainPurchaseDate,
        domainExpiryDate: domainExpiryDate
          ? new Date(domainExpiryDate)
          : existing.domainExpiryDate,
        domainPrice: domainPrice ? parseInt(domainPrice) : existing.domainPrice,
      },
    });

    res.json({ message: "Domain updated successfully", domain: updatedDomain });
  } catch (err) {
    console.error("Error updating domain:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   🗑️ DELETE DOMAIN
====================================================== */
router.delete("/domains/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.domain.delete({ where: { id } });
    res.json({ message: "Domain deleted successfully" });
  } catch (err) {
    console.error("Error deleting domain:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   👥 ADD / UPDATE AGENT
====================================================== */
router.post("/agents", async (req, res) => {
  try {
    const { domainId, agentName, empId, agentEmail, agentPassword, adminId } = req.body;

    if (!domainId) return res.status(400).json({ error: "Missing domainId" });

    const newAgent = await prisma.agent.create({
      data: {
        domainId,
        agentName,
        empId,
        agentEmail,
        agentPassword,
        adminId: adminId || "normal",
      },
    });

    res.status(201).json({ message: "Agent added successfully", agent: newAgent });
  } catch (err) {
    console.error("Error creating agent:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/agents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { agentName, empId, agentEmail, agentPassword, adminId } = req.body;

    const updated = await prisma.agent.update({
      where: { id },
      data: {
        agentName,
        empId,
        agentEmail,
        agentPassword,
        adminId,
      },
    });

    res.json({ message: "Agent updated successfully", agent: updated });
  } catch (err) {
    console.error("Error updating agent:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   🗑️ DELETE AGENT
====================================================== */
router.delete("/agents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.agent.delete({ where: { id } });
    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    console.error("Error deleting agent:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
