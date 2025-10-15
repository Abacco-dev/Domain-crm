import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ---------------- POST - CREATE DOMAIN WITH AGENTS (keep as is) ----------------
router.post("/", async (req, res) => {
  try {
    const { domain, agents } = req.body;

    if (!domain || !agents || agents.length === 0) {
      return res.status(400).json({ error: "Missing domain or agent data" });
    }

    const emails = agents.map(a => a.agentEmail);
    const duplicateEmails = emails.filter((e, i) => emails.indexOf(e) !== i);
    if (duplicateEmails.length > 0) {
      return res.status(400).json({ error: `Duplicate emails in agents: ${[...new Set(duplicateEmails)].join(", ")}` });
    }

    const existingAgents = await prisma.agent.findMany({
      where: { agentEmail: { in: emails } },
      select: { agentEmail: true },
    });
    if (existingAgents.length > 0) {
      return res.status(400).json({ error: `Agent emails already exist: ${existingAgents.map(a => a.agentEmail).join(", ")}` });
    }

    const newDomain = await prisma.domain.create({
      data: {
        domainHost: domain.domainHost,
        loginId: domain.loginId,
        loginPass: domain.loginPass,
        customerId: domain.customerId,
        domainName: domain.domainName,
        domainPurchaseDate: new Date(domain.domainPurchaseDate),
        domainExpiryDate: new Date(domain.domainExpiryDate),
        domainPrice: parseInt(domain.domainPrice),
        emailPrice: parseInt(domain.emailPrice),
        domainEmailHost: domain.domainEmailHost,
        emailHostPurchase: new Date(domain.emailHostPurchase),
        emailHostExpiry: new Date(domain.emailHostExpiry),
        emailCount: parseInt(domain.emailCount),
        emailAddresses: domain.emailAddresses || null,
      },
    });

    const createdAgents = await Promise.all(
      agents.map(agent =>
        prisma.agent.create({
          data: {
            agentName: agent.agentName,
            empId:agent.empId,
            agentEmail: agent.agentEmail,
            agentPassword: agent.agentPassword,
            adminId: agent.adminId,
            domainId: newDomain.id,
          },
        })
      )
    );

    res.status(201).json({
      message: "Domain and agents created successfully",
      domain: newDomain,
      agents: createdAgents,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GET - All Domains with Agents ----------------
router.get("/", async (req, res) => {
  try {
    const domains = await prisma.domain.findMany({
      include: { agents: true },
      orderBy: { id: "desc" },
    });
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GET - Single Domain ----------------
router.get("/:id", async (req, res) => {
  try {
    const domain = await prisma.domain.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { agents: true },
    });
    if (!domain) return res.status(404).json({ error: "Domain not found" });
    res.json(domain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- PUT - Update Domain ----------------
// PUT /api/agents/:id
// ---------------- PUT - Update Agent and Linked Domain ----------------
// ---------------- PUT - Update Agent and Linked Domain ----------------
// router.put("/:id", async (req, res) => {
//   try {
//     const domainId = parseInt(req.params.id, 10);
//     if (isNaN(domainId)) return res.status(400).json({ error: "Invalid domain ID" });

//     const { domain, agents } = req.body;

//     // ✅ Check if domain exists
//     const existingDomain = await prisma.domain.findUnique({
//       where: { id: domainId },
//       include: { agents: true },
//     });

//     if (!existingDomain) {
//       return res.status(404).json({ error: "Domain not found" });
//     }

//     // ✅ Build dynamic domain update object
//     const domainData = {};
//     if (domain) {
//       if (domain.domainHost) domainData.domainHost = domain.domainHost;
//       if (domain.loginId) domainData.loginId = domain.loginId;
//       if (domain.loginPass) domainData.loginPass = domain.loginPass;
//       if (domain.customerId) domainData.customerId = domain.customerId;
//       if (domain.domainName) domainData.domainName = domain.domainName;
//       if (domain.domainPurchaseDate) domainData.domainPurchaseDate = new Date(domain.domainPurchaseDate);
//       if (domain.domainExpiryDate) domainData.domainExpiryDate = new Date(domain.domainExpiryDate);
//       if (domain.domainPrice) domainData.domainPrice = parseInt(domain.domainPrice);
//       if (domain.domainEmailHost) domainData.domainEmailHost = domain.domainEmailHost;
//       if (domain.emailHostPurchase) domainData.emailHostPurchase = new Date(domain.emailHostPurchase);
//       if (domain.emailHostExpiry) domainData.emailHostExpiry = new Date(domain.emailHostExpiry);
//       if (domain.emailPrice) domainData.emailPrice = parseInt(domain.emailPrice);
//       if (domain.emailCount) domainData.emailCount = parseInt(domain.emailCount);
//       if (domain.emailAddresses) domainData.emailAddresses = domain.emailAddresses;
//     }

//     // ✅ Update domain table based on id
//     const updatedDomain = await prisma.domain.update({
//       where: { id: domainId },
//       data: domainData,
//     });

//     // ✅ Update all agents under this domain (by domainId)
//     if (agents && agents.length > 0) {
//       for (const agent of agents) {
//         // Check if the agent exists under this domain
//         const existingAgent = await prisma.agent.findFirst({
//           where: { domainId, id: agent.id },
//         });

//         if (existingAgent) {
//           // --- Update agent record ---
//           await prisma.agent.update({
//             where: { id: existingAgent.id },
//             data: {
//               agentName: agent.agentName ?? existingAgent.agentName,
//               agentEmail: agent.agentEmail ?? existingAgent.agentEmail,
//               agentPassword: agent.agentPassword ?? existingAgent.agentPassword,
//               adminId: agent.adminId ?? existingAgent.adminId,
//             },
//           });
//         } else {
//           // --- Create new agent linked to this domain ---
//           await prisma.agent.create({
//             data: {
//               agentName: agent.agentName,
//               agentEmail: agent.agentEmail,
//               agentPassword: agent.agentPassword,
//               adminId: agent.adminId,
//               domainId, // foreign key link
//             },
//           });
//         }
//       }
//     }

//     // ✅ Fetch latest state after all updates
//     const finalData = await prisma.domain.findUnique({
//       where: { id: domainId },
//       include: { agents: true },
//     });

//     res.json({
//       message: "Domain and linked agents updated successfully",
//       domain: finalData,
//     });
//   } catch (error) {
//     console.error("Error updating domain and linked agents:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
router.put("/:id", async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) return res.status(400).json({ error: "Invalid domain ID" });

    const { domain, agents } = req.body;

    // ✅ Check if domain exists
    const existingDomain = await prisma.domain.findUnique({
      where: { id: domainId },
      include: { agents: true },
    });

    if (!existingDomain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    // ✅ Build dynamic domain update object
    const domainData = {};
    if (domain) {
      if (domain.domainHost) domainData.domainHost = domain.domainHost;
      if (domain.loginId) domainData.loginId = domain.loginId;
      if (domain.loginPass) domainData.loginPass = domain.loginPass;
      if (domain.customerId) domainData.customerId = domain.customerId;
      if (domain.domainName) domainData.domainName = domain.domainName;
      if (domain.domainPurchaseDate)
        domainData.domainPurchaseDate = new Date(domain.domainPurchaseDate);
      if (domain.domainExpiryDate)
        domainData.domainExpiryDate = new Date(domain.domainExpiryDate);
      if (domain.domainPrice)
        domainData.domainPrice = parseInt(domain.domainPrice);
      if (domain.domainEmailHost)
        domainData.domainEmailHost = domain.domainEmailHost;
      if (domain.emailHostPurchase)
        domainData.emailHostPurchase = new Date(domain.emailHostPurchase);
      if (domain.emailHostExpiry)
        domainData.emailHostExpiry = new Date(domain.emailHostExpiry);
      if (domain.emailPrice)
        domainData.emailPrice = parseInt(domain.emailPrice);
      if (domain.emailCount)
        domainData.emailCount = parseInt(domain.emailCount);
      if (domain.emailAddresses)
        domainData.emailAddresses = domain.emailAddresses; // e.g. "a@x.com,b@y.com"
    }

    // ✅ Update the domain record first
    const updatedDomain = await prisma.domain.update({
      where: { id: domainId },
      data: domainData,
    });

    // ✅ Sync agents if provided
    if (agents && agents.length > 0) {
      for (const agent of agents) {
        const existingAgent = await prisma.agent.findFirst({
          where: { domainId, id: agent.id },
        });

        if (existingAgent) {
          // --- Update existing agent ---
          await prisma.agent.update({
            where: { id: existingAgent.id },
            data: {
              agentName: agent.agentName ?? existingAgent.agentName,
              empId: agent.empId ?? existingAgent.empId,
              agentEmail: agent.agentEmail ?? existingAgent.agentEmail,
              agentPassword: agent.agentPassword ?? existingAgent.agentPassword,
              adminId: agent.adminId ?? existingAgent.adminId,
            },
          });
        } else {
          // --- Create new agent ---
          await prisma.agent.create({
            data: {
              agentName: agent.agentName,
              empId: agent.empId,
              agentEmail: agent.agentEmail,
              agentPassword: agent.agentPassword,
              adminId: agent.adminId,
              domainId,
            },
          });
        }
      }
    }

    // ✅ Handle bi-directional sync between domain.emailAddresses and agents.agentEmail
    const updatedAgents = await prisma.agent.findMany({ where: { domainId } });

    // If domain.emailAddresses was changed manually → update agent emails accordingly
    if (domain?.emailAddresses) {
      const domainEmails = domain.emailAddresses
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);

      for (let i = 0; i < domainEmails.length; i++) {
        const email = domainEmails[i];
        const existing = updatedAgents[i];

        if (existing) {
          await prisma.agent.update({
            where: { id: existing.id },
            data: { agentEmail: email },
          });
        } else {
          // create new agent if there are more emails than existing agents
          await prisma.agent.create({
            data: {
              agentName: `Agent${i + 1}`,
              empId,
              agentEmail: email,
              agentPassword: "",
              adminId: "normal",
              domainId,
            },
          });
        }
      }
    }

    // After syncing agents, rebuild domain.emailAddresses from actual agent records
    const syncedAgents = await prisma.agent.findMany({ where: { domainId } });
    const allEmails = syncedAgents.map((a) => a.agentEmail).filter(Boolean).join(", ");

    await prisma.domain.update({
      where: { id: domainId },
      data: { emailAddresses: allEmails },
    });

    // ✅ Fetch final updated data
    const finalData = await prisma.domain.findUnique({
      where: { id: domainId },
      include: { agents: true },
    });

    res.json({
      message: "✅ Domain and linked agents updated & synchronized successfully",
      domain: finalData,
    });
  } catch (error) {
    console.error("Error updating domain and linked agents:", error);
    res.status(500).json({ error: error.message });
  }
});





// ---------------- DELETE - Delete Domain ----------------
router.delete("/:id", async (req, res) => {
  try {
    await prisma.domain.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Domain deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GET - Combined Info ----------------
router.get("/all-info/combined", async (req, res) => {
  try {
    const domains = await prisma.domain.findMany({ include: { agents: true } });
    const agents = await prisma.agent.findMany({ include: { domain: true } });
    res.json({ domains, agents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
