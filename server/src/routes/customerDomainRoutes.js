import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { domain, agents } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Missing domain data" });
    }

    // ✅ Create domain first (even without agents)
    const newDomain = await prisma.domain.create({
      data: {
        domainHost: domain.domainHost,
        loginId: domain.loginId || null,
        loginPass: domain.loginPass || null,
        customerId: domain.customerId || null,
        domainName: domain.domainName || null,
        domainPurchaseDate: domain.domainPurchaseDate
          ? new Date(domain.domainPurchaseDate)
          : null,
        domainExpiryDate: domain.domainExpiryDate
          ? new Date(domain.domainExpiryDate)
          : null,
        domainPrice: domain.domainPrice ? parseInt(domain.domainPrice) : null,
        domainEmailHost: domain.domainEmailHost || null,
        emailHostPurchase: domain.emailHostPurchase
          ? new Date(domain.emailHostPurchase)
          : null,
        emailHostExpiry: domain.emailHostExpiry
          ? new Date(domain.emailHostExpiry)
          : null,
        emailPrice: domain.emailPrice ? parseInt(domain.emailPrice) : null,
        emailCount: domain.emailCount ? parseInt(domain.emailCount) : 0,
        emailAddresses: domain.emailAddresses || null,
      },
    });

    // ✅ Optionally create agents later (only if provided)
    let createdAgents = [];
    if (agents && agents.length > 0) {
      createdAgents = await Promise.all(
        agents.map((agent, index) =>
          prisma.agent.create({
            data: {
              agentName:
                agent.agentName && agent.agentName.trim() !== ""
                  ? agent.agentName
                  : `Agent_${index + 1}`,
              empId: agent.empId || "",
              agentEmail: agent.agentEmail || "",
              agentPassword: agent.agentPassword || "",
              adminId: agent.adminId || "normal",
              domainId: newDomain.id,
            },
          })
        )
      );
    }

    res.status(201).json({
      message: "Domain created successfully",
      domain: newDomain,
      agents: createdAgents,
    });
  } catch (err) {
    console.error("Error creating domain:", err);
    res.status(500).json({ error: err.message });
  }
});



// ---------------- GET - All Domains with Agents ----------------
// router.get("/", async (req, res) => {
//   try {
//     const domains = await prisma.domain.findMany({
//       include: {
//         agents: {
//           select: {
//             id: true,
//             agentName: true,
//             empId: true,
//             agentEmail: true,
//             agentPassword: true,
//             adminId: true,
//           },
//         },
//       },
//       orderBy: { id: "desc" },
//     });

//     // Return all domains, even if no agents exist
//     res.status(200).json(domains || []);
//   } catch (err) {
//     console.error("Error fetching domains:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
// router.get("/", async (req, res) => {
//   try {
//     const domains = await prisma.domain.findMany({
//       include: {
//         agents: {
//           select: {
//             id: true,
//             agentName: true,
//             empId: true,
//             agentEmail: true,
//             agentPassword: true,
//             adminId: true,
//           },
//         },
//         hostAccount: {
//           select: {
//             id: true,
//             domainHost: true,
//             customerId: true,
//           },
//         },
//       },
//       orderBy: { id: "desc" },
//     });

//     // Combine host info into each domain record for easier frontend use
//     const enrichedDomains = domains.map((d) => ({
//       ...d,
//       domainHost: d.hostAccount?.domainHost || "—",
//       customerId: d.hostAccount?.customerId || "—",
//     }));

//     res.status(200).json(enrichedDomains);
//   } catch (err) {
//     console.error("❌ Error fetching domains:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
// ✅ Updated GET /api/domains
router.get("/", async (req, res) => {
  try {
    const domains = await prisma.domain.findMany({
      include: {
        // Include assigned agents
        agents: {
          select: {
            id: true,
            agentName: true,
            empId: true,
            agentEmail: true,
            agentPassword: true,
            adminId: true,
          },
        },
        // Include host account info
        hostAccount: {
          select: {
            id: true,
            domainHost: true,
            customerId: true,
          },
        },
        // ✅ Include related email accounts
        emailAccounts: {
          select: {
            id: true,
            email: true,
            password: true,
            emailPurchaseDate: true,
            emailExpiryDate: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    // ✅ Combine host info and flatten for frontend
    const enrichedDomains = domains.map((d) => ({
      ...d,
      domainHost: d.hostAccount?.domainHost || "—",
      customerId: d.hostAccount?.customerId || "—",
    }));

    res.status(200).json(enrichedDomains);
  } catch (err) {
    console.error("❌ Error fetching domains:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ server/src/routes/manageRoutes.js
router.get("/expiring-emails", async (req, res) => {
  try {
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);

    const expiringEmails = await prisma.emailAccount.findMany({
      where: {
        emailExpiryDate: {
          gte: today,
          lte: oneMonthLater,
        },
      },
      include: {
        domain: {
          select: {
            id: true,
            domainName: true,
            domainEmailHost: true,
            emailPrice: true,
            hostAccount: {
              select: {
                customerId: true,
                domainHost: true,
              },
            },
          },
        },
      },
      orderBy: { emailExpiryDate: "asc" },
    });

    const result = expiringEmails.map((e) => ({
      id: e.id,
      email: e.email,
      emailExpiryDate: e.emailExpiryDate,
      daysRemaining: e.emailExpiryDate
        ? Math.ceil(
            (new Date(e.emailExpiryDate) - today) / (1000 * 60 * 60 * 24)
          )
        : null,
      domainName: e.domain?.domainName || "—",
      domainEmailHost: e.domain?.domainEmailHost || "—",
      emailPrice: e.domain?.emailPrice || 0,
      customerId: e.domain?.hostAccount?.customerId || "—",
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error fetching expiring emails:", err);
    res.status(500).json({ error: err.message });
  }
});


// ---------------- GET - Single Domain ----------------
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const domain = await prisma.domain.findUnique({
      where: { id },
      include: {
        agents: {
          select: {
            id: true,
            agentName: true,
            empId: true,
            agentEmail: true,
            agentPassword: true,
            adminId: true,
          },
        },
      },
    });

    if (!domain) return res.status(404).json({ error: "Domain not found" });
    res.json(domain);
  } catch (err) {
    console.error("Error fetching domain by ID:", err);
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
// router.put("/:id", async (req, res) => {
//   try {
//     const domainId = parseInt(req.params.id);
//     console.log("🟢 PUT /domains/:id called with ID:", domainId);
//     console.log("📦 Request Body:", req.body);

//     const { domain, agents } = req.body;

//     if (!domain) {
//       console.warn("⚠️ Missing 'domain' field in request body");
//       return res.status(400).json({ error: "Domain data required" });
//     }

//     // Validate required fields
//     if (!domain.domainHost || !domain.domainName) {
//       console.warn("⚠️ Missing required domain fields:", domain);
//       return res.status(400).json({ error: "Missing domainHost or domainName" });
//     }

//     const updatedDomain = await prisma.domain.update({
//       where: { id: domainId },
//       data: {
//         domainHost: domain.domainHost,
//         domainName: domain.domainName,
//         domainPurchaseDate: domain.domainPurchaseDate
//           ? new Date(domain.domainPurchaseDate)
//           : undefined,
//         domainExpiryDate: domain.domainExpiryDate
//           ? new Date(domain.domainExpiryDate)
//           : undefined,
//         domainEmailHost: domain.domainEmailHost,
//         emailHostPurchase: domain.emailHostPurchase
//           ? new Date(domain.emailHostPurchase)
//           : undefined,
//         emailHostExpiry: domain.emailHostExpiry
//           ? new Date(domain.emailHostExpiry)
//           : undefined,
//         emailCount: domain.emailCount ? parseInt(domain.emailCount, 10) : undefined,
//         emailAddresses: domain.emailAddresses,
//         customerId: domain.customerId,
//         agents: agents && agents.length > 0
//           ? {
//               updateMany: agents.map((a) => ({
//                 where: { id: a.id },
//                 data: {
//                   agentName: a.agentName,
//                   agentEmail: a.agentEmail,
//                   agentPassword: a.agentPassword,
//                   adminId: a.adminId,
//                 },
//               })),
//             }
//           : undefined,
//       },
//       include: { agents: true },
//     });

//     console.log("✅ Domain updated successfully:", updatedDomain.id);
//     res.json(updatedDomain);
//   } catch (error) {
//     console.error("🔥 Error updating domain:", error);
//     res.status(500).json({
//       error: "Failed to update domain",
//       details: error.message,
//     });
//   }
// });
router.put("/:id", async (req, res) => {
  try {
    const domainId = parseInt(req.params.id);
    const { domain, agents } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Domain data required" });
    }

    // Fetch existing domain first 🧠
    const existingDomain = await prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!existingDomain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    // Merge old + new values
    const updatedData = {
      domainHost: domain.domainHost ?? existingDomain.domainHost,
      loginId: domain.loginId ?? existingDomain.loginId,
      loginPass: domain.loginPass ?? existingDomain.loginPass,
      customerId: domain.customerId ?? existingDomain.customerId,
      domainName: domain.domainName ?? existingDomain.domainName,
      domainPurchaseDate: domain.domainPurchaseDate
        ? new Date(domain.domainPurchaseDate)
        : existingDomain.domainPurchaseDate,
      domainExpiryDate: domain.domainExpiryDate
        ? new Date(domain.domainExpiryDate)
        : existingDomain.domainExpiryDate,
      domainPrice:
        domain.domainPrice !== undefined
          ? Number(domain.domainPrice)
          : existingDomain.domainPrice,
      domainEmailHost: domain.domainEmailHost ?? existingDomain.domainEmailHost,
      emailHostPurchase: domain.emailHostPurchase
        ? new Date(domain.emailHostPurchase)
        : existingDomain.emailHostPurchase,
      emailHostExpiry: domain.emailHostExpiry
        ? new Date(domain.emailHostExpiry)
        : existingDomain.emailHostExpiry,
      emailPrice:
        domain.emailPrice !== undefined
          ? Number(domain.emailPrice)
          : existingDomain.emailPrice,
      emailCount:
        domain.emailCount !== undefined
          ? Number(domain.emailCount)
          : existingDomain.emailCount,
      emailAddresses: domain.emailAddresses ?? existingDomain.emailAddresses,
      isActive:
        domain.isActive !== undefined
          ? domain.isActive
          : existingDomain.isActive,
    };

    // Update in Prisma
    const updatedDomain = await prisma.domain.update({
      where: { id: domainId },
      data: {
        ...updatedData,
        // Optional: update agents if provided
        ...(agents && agents.length > 0
          ? {
              agents: {
                updateMany: agents.map((a) => ({
                  where: { id: a.id },
                  data: {
                    agentName: a.agentName ?? undefined,
                    agentEmail: a.agentEmail ?? undefined,
                    agentPassword: a.agentPassword ?? undefined,
                    adminId: a.adminId ?? undefined,
                  },
                })),
              },
            }
          : {}),
      },
      include: { agents: true },
    });

    console.log("✅ Domain updated successfully:", updatedDomain.id);
    res.json(updatedDomain);
  } catch (error) {
    console.error("🔥 Error updating domain:", error);
    res.status(500).json({
      error: "Failed to update domain",
      details: error.message,
    });
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
