import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* ========================================================
   🌍 DOMAIN HOSTING MANAGEMENT
======================================================== */

// ✅ Get all hosting accounts with domains, agents & emails
router.get("/hosts", async (req, res) => {
  try {
    const hosts = await prisma.domainHostAccount.findMany({
      include: {
        domains: {
          include: {
            agents: true,
            emailAccounts: { include: { agent: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    });
    res.json(hosts);
  } catch (err) {
    console.error("❌ Error fetching hosts:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update hosting account info
router.put("/hosts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { domainHost, loginId, loginPass, customerId, isActive } = req.body;

    const updated = await prisma.domainHostAccount.update({
      where: { id },
      data: {
        domainHost,
        loginId,
        loginPass,
        customerId: customerId || null,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    res.json({ message: "✅ Hosting account updated", data: updated });
  } catch (err) {
    console.error("❌ Error updating host:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ========================================================
   🌐 DOMAIN MANAGEMENT
======================================================== */

// ✅ Add domain to a hosting account
router.post("/hosts/:hostAccountId/domains", async (req, res) => {
  try {
    const hostAccountId = parseInt(req.params.hostAccountId);
    const {
      domainName,
      domainPurchaseDate,
      domainExpiryDate,
      domainPrice,
      domainEmailHost,
    } = req.body;

    if (!domainName)
      return res.status(400).json({ error: "Domain name required" });

    const domain = await prisma.domain.create({
      data: {
        domainName,
        domainPurchaseDate: domainPurchaseDate
          ? new Date(domainPurchaseDate)
          : null,
        domainExpiryDate: domainExpiryDate
          ? new Date(domainExpiryDate)
          : null,
        domainPrice: domainPrice ? parseFloat(domainPrice) : null,
        domainEmailHost: domainEmailHost || null,
        hostAccountId,
      },
    });

    res.json(domain);
  } catch (err) {
    console.error("❌ Error creating domain:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update domain details
router.put("/emails/:emailId", async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    const { email, password, emailPurchaseDate, emailExpiryDate, agent } = req.body;

    const existing = await prisma.emailAccount.findUnique({
      where: { id: emailId },
      include: { agent: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Email not found" });
    }

    let linkedAgentId = existing.agentId;

    // ✅ Handle agent logic safely
    if (agent) {
      const normalizedEmail = agent.agentEmail?.trim() || email?.trim() || existing.email;

      // Check if agent with same email already exists
      const foundAgent = await prisma.agent.findUnique({
        where: { agentEmail: normalizedEmail },
      });

      if (foundAgent) {
        // ✅ Update existing agent
        await prisma.agent.update({
          where: { id: foundAgent.id },
          data: {
            agentName: agent.agentName?.trim() || foundAgent.agentName,
            empId: agent.empId?.trim() || foundAgent.empId,
            agentPassword: password ?? foundAgent.agentPassword,
          },
        });
        linkedAgentId = foundAgent.id;
      } else if (linkedAgentId) {
        // ✅ Update currently linked agent
        await prisma.agent.update({
          where: { id: linkedAgentId },
          data: {
            agentName: agent.agentName?.trim() || existing.agent?.agentName,
            empId: agent.empId?.trim() || existing.agent?.empId,
            agentEmail: normalizedEmail,
            agentPassword: password ?? existing.agent?.agentPassword,
          },
        });
      } else {
        // ✅ Create a new agent (first time link)
        const newAgent = await prisma.agent.create({
          data: {
            agentName: agent.agentName?.trim() || "Unnamed",
            empId: agent.empId?.trim() || "N/A",
            agentEmail: normalizedEmail,
            agentPassword: password ?? null,
            domainId: existing.domainId,
          },
        });
        linkedAgentId = newAgent.id;
      }
    }

    // ✅ Update EmailAccount (reflect latest credentials)
    const updatedEmail = await prisma.emailAccount.update({
      where: { id: emailId },
      data: {
        email: email?.trim() || existing.email,
        password: password ?? existing.password,
        emailPurchaseDate: emailPurchaseDate
          ? new Date(emailPurchaseDate)
          : existing.emailPurchaseDate,
        emailExpiryDate: emailExpiryDate
          ? new Date(emailExpiryDate)
          : existing.emailExpiryDate,
        agentId: linkedAgentId,
      },
      include: { agent: true },
    });

    // ✅ Make sure Agent table email matches EmailAccount
    if (updatedEmail.agent && updatedEmail.agent.agentEmail !== updatedEmail.email) {
      await prisma.agent.update({
        where: { id: updatedEmail.agent.id },
        data: { agentEmail: updatedEmail.email },
      });
    }

    res.json({
      message: "✅ Email & Agent updated successfully",
      data: updatedEmail,
    });
  } catch (err) {
    console.error("❌ Error updating email:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Toggle domain active status
router.patch("/domains/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.domain.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Domain not found" });

    const updated = await prisma.domain.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    res.json({ message: "✅ Domain status toggled", data: updated });
  } catch (err) {
    console.error("❌ Error toggling domain:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete domain and related records
router.delete("/domains/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.emailAccount.deleteMany({ where: { domainId: id } });
    await prisma.agent.deleteMany({ where: { domainId: id } });
    await prisma.domain.delete({ where: { id } });

    res.json({ message: "✅ Domain and related data deleted" });
  } catch (err) {
    console.error("❌ Error deleting domain:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ========================================================
   📧 EMAIL & AGENT MANAGEMENT
======================================================== */

// ✅ Add emails + agents to a domain
router.post("/domains/:domainId/emails", async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const { emails } = req.body;
    if (!emails || !emails.length)
      return res.status(400).json({ error: "No email entries" });

    const created = [];

    for (const e of emails) {
      // Avoid duplicates
      const exists = await prisma.emailAccount.findUnique({
        where: { email: e.email },
      });
      if (exists) continue;

      // Create agent
      const agent = await prisma.agent.create({
        data: {
          agentName: e.agentName?.trim() || "Unnamed",
          empId: e.empId?.trim() || "N/A",
          agentEmail: e.email,
          agentPassword: e.password || null,
          domainId,
        },
      });

      // Create email linked to agent
      const email = await prisma.emailAccount.create({
        data: {
          email: e.email,
          password: e.password || null,
          emailPurchaseDate: e.purchaseDate ? new Date(e.purchaseDate) : null,
          emailExpiryDate: e.expiryDate ? new Date(e.expiryDate) : null,
          domainId,
          agentId: agent.id,
        },
      });

      created.push({ email, agent });
    }

    res.json({ message: "✅ Emails added successfully", data: created });
  } catch (err) {
    console.error("❌ Error adding emails:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch all emails for a domain (with agent info)
router.get("/domains/:domainId/emails", async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const emails = await prisma.emailAccount.findMany({
      where: { domainId },
      include: { agent: true },
      orderBy: { id: "asc" },
    });
    res.json(emails);
  } catch (err) {
    console.error("❌ Error fetching emails:", err);
    res.status(500).json({ error: err.message });
  }
});


// domin updating
router.put("/domains/:id", async (req, res) => {
  try {
    const domainId = parseInt(req.params.id);
    const { domainName, domainPurchaseDate, domainExpiryDate, domainPrice, emailPrice, domainEmailHost } = req.body;

    const updatedDomain = await prisma.domain.update({
      where: { id: domainId },
      data: {
        domainName,
        domainPurchaseDate: domainPurchaseDate ? new Date(domainPurchaseDate) : null,
        domainExpiryDate: domainExpiryDate ? new Date(domainExpiryDate) : null,
        domainPrice: domainPrice ? parseInt(domainPrice) : null,
        emailPrice: emailPrice ? parseInt(emailPrice) : null,
        domainEmailHost,
      },
    });

    res.json({ message: "Domain updated successfully", domain: updatedDomain });
  } catch (err) {
    console.error("Error updating domain:", err);
    res.status(500).json({ error: err.message });
  }
});



// ✅ Toggle Email active/inactive
router.patch("/emails/:emailId/toggle", async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    const email = await prisma.emailAccount.findUnique({
      where: { id: emailId },
    });
    if (!email) return res.status(404).json({ error: "Email not found" });

    const updated = await prisma.emailAccount.update({
      where: { id: emailId },
      data: { isActive: !email.isActive },
    });
    res.json({ message: "✅ Email status toggled", data: updated });
  } catch (err) {
    console.error("❌ Error toggling email:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Toggle Agent active/inactive
router.patch("/agents/:agentId/toggle", async (req, res) => {
  try {
    const agentId = parseInt(req.params.agentId);
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const updated = await prisma.agent.update({
      where: { id: agentId },
      data: { isActive: !agent.isActive },
    });
    res.json({ message: "✅ Agent status toggled", data: updated });
  } catch (err) {
    console.error("❌ Error toggling agent:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
