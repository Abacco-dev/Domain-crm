import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ---------------- POST - CREATE AGENT (keep as is) ----------------
router.post("/", async (req, res) => {
  try {
    const { agentName, agentEmail, agentPassword, adminId, domainId } = req.body;
    const newAgent = await prisma.agent.create({
      data: { agentName, agentEmail, agentPassword, adminId, domainId },
    });
    res.json(newAgent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------- PUT - Update Domain ----------------
// ---------------- PUT - Update Agent and Linked Domain ----------------
router.put("/agents/:id", async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    if (isNaN(agentId)) return res.status(400).json({ error: "Invalid agent ID" });

    const { agentName, agentEmail, agentPassword, adminId, domain } = req.body;

    // ✅ Ensure agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { domain: true },
    });
    if (!existingAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // ✅ Build dynamic update data
    const updateData = {
      agentName,
      agentEmail,
      agentPassword,
      adminId,
    };

    // ✅ Update the agent (and optionally its linked domain)
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        ...updateData,
        domain: domain
          ? {
              update: {
                where: { id: existingAgent.domainId }, // crucial fix
                data: {
                  domainHost: domain.domainHost,
                  loginId: domain.loginId,
                  loginPass: domain.loginPass,
                  customerId: domain.customerId,
                  domainName: domain.domainName,
                  domainPurchaseDate: domain.domainPurchaseDate
                    ? new Date(domain.domainPurchaseDate)
                    : existingAgent.domain.domainPurchaseDate,
                  domainExpiryDate: domain.domainExpiryDate
                    ? new Date(domain.domainExpiryDate)
                    : existingAgent.domain.domainExpiryDate,
                  domainEmailHost: domain.domainEmailHost,
                  emailHostPurchase: domain.emailHostPurchase
                    ? new Date(domain.emailHostPurchase)
                    : existingAgent.domain.emailHostPurchase,
                  emailHostExpiry: domain.emailHostExpiry
                    ? new Date(domain.emailHostExpiry)
                    : existingAgent.domain.emailHostExpiry,
                  emailCount: parseInt(domain.emailCount || existingAgent.domain.emailCount),
                  emailAddresses: domain.emailAddresses,
                },
              },
            }
          : undefined,
      },
      include: { domain: true },
    });

    res.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent and domain:", error);
    res.status(500).json({ error: "Failed to update agent and domain" });
  }
});


// PUT /api/agents/:id
// router.put("/agents/:id", async (req, res) => {
//   try {
//     const agentId = parseInt(req.params.id);
//     if (isNaN(agentId)) return res.status(400).json({ error: "Invalid agent ID" });

//     const { agentName, agentEmail, agentPassword, adminId, domain } = req.body;

//     // Update only fields that are provided
//     const updateData = {};
//     if (agentName) updateData.agentName = agentName;
//     if (agentEmail) updateData.agentEmail = agentEmail;
//     if (agentPassword) updateData.agentPassword = agentPassword;
//     if (adminId) updateData.adminId = adminId;

//     const updatedAgent = await prisma.agent.update({
//       where: { id: agentId },
//       data: {
//         ...updateData,
//         domain: domain
//           ? {
//               update: Object.fromEntries(
//                 Object.entries(domain).filter(([_, value]) => value !== undefined && value !== "")
//               ),
//             }
//           : undefined,
//       },
//       include: { domain: true },
//     });

//     res.json(updatedAgent);
//   } catch (error) {
//     console.error("Error updating agent:", error);
//     res.status(500).json({ error: "Failed to save agent changes" });
//   }
// });


// ---------------- GET - All Agents ----------------
router.get("/", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: { domain: true },
      orderBy: { id: "desc" },
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GET - Agent by ID ----------------
router.get("/:id", async (req, res) => {
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
});

// ---------------- GET - Agents by domainId ----------------
router.get("/domain/:id", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { domainId: Number(req.params.id) },
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- PUT - Update Agent ----------------
// PUT /api/agents/:id
// router.put("/agents/:id", async (req, res) => {
//   try {
//     const id = parseInt(req.params.id); // convert string to Int
//     if (isNaN(id)) {
//       return res.status(400).json({ error: "Invalid agent ID" });
//     }

//     const { domainHost, loginId, loginPass, customerId } = req.body;

//     const updatedAgent = await prisma.agent.update({
//       where: { id: id },
//       data: {
//         domain: {
//           update: {
//             domainHost,
//             loginId,
//             loginPass,
//             customerId,
//           }
//         }
//       },
//       include: { domain: true },
//     });

//     res.json(updatedAgent);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });


// ---------------- DELETE - Delete Agent ----------------
router.delete("/:id", async (req, res) => {
  try {
    await prisma.agent.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
