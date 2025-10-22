import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* ===========================================================
   🟢 BASIC SETUP — Only hosting and domain info (with email price & dates)
=========================================================== */
router.post("/basic-setup", async (req, res) => {
  try {
    const { domainHost, loginId, loginPass, customerId, domains } = req.body;

    if (!domainHost || !loginId || !loginPass) {
      return res
        .status(400)
        .json({ error: "Hosting provider details are required" });
    }

    const newHost = await prisma.domainHostAccount.create({
      data: {
        domainHost,
        loginId,
        loginPass,
        customerId,
        domains: {
          create: domains.map((d) => ({
            domainName: d.domainName,
            domainPurchaseDate: d.domainPurchaseDate
              ? new Date(d.domainPurchaseDate)
              : null,
            domainExpiryDate: d.domainExpiryDate
              ? new Date(d.domainExpiryDate)
              : null,
            domainPrice: d.domainPrice ? parseFloat(d.domainPrice) : null,
            domainEmailHost: d.domainEmailHost || null,

            // ✅ Added fields
            emailHostPurchase: d.emailHostPurchase
              ? new Date(d.emailHostPurchase)
              : null,
            emailHostExpiry: d.emailHostExpiry
              ? new Date(d.emailHostExpiry)
              : null,
            emailPrice: d.emailPrice ? parseFloat(d.emailPrice) : null,
            emailCount: d.emailCount ? parseInt(d.emailCount) : null,
          })),
        },
      },
      include: { domains: true },
    });

    res
      .status(201)
      .json({ message: "✅ Basic setup saved successfully!", data: newHost });
  } catch (error) {
    console.error("❌ Basic setup error:", error);
    res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

/* ===========================================================
   🔵 COMPLETE SETUP — Hosting + Domains + Agents + EmailAccounts
=========================================================== */
router.post("/complete-setup", async (req, res) => {
  try {
    const { domainHost, loginId, loginPass, customerId, domains } = req.body;

    if (!domainHost || !loginId || !loginPass) {
      return res
        .status(400)
        .json({ error: "Hosting provider details are required" });
    }

    const createdHost = await prisma.domainHostAccount.create({
      data: {
        domainHost,
        loginId,
        loginPass,
        customerId,

        // === Nested Domain Creation ===
        domains: {
          create: domains.map((d) => ({
            domainName: d.domainName,
            domainPurchaseDate: d.domainPurchaseDate
              ? new Date(d.domainPurchaseDate)
              : null,
            domainExpiryDate: d.domainExpiryDate
              ? new Date(d.domainExpiryDate)
              : null,
            domainPrice: d.domainPrice ? parseFloat(d.domainPrice) : null,
            domainEmailHost: d.domainEmailHost || null,

            // ✅ Added Email Hosting fields
            emailHostPurchase: d.emailHostPurchase
              ? new Date(d.emailHostPurchase)
              : null,
            emailHostExpiry: d.emailHostExpiry
              ? new Date(d.emailHostExpiry)
              : null,
            emailPrice: d.emailPrice ? parseFloat(d.emailPrice) : null,
            emailCount: d.emailCount ? parseInt(d.emailCount) : null,

            // === Nested Agents ===
            agents: {
              create:
                d.agents?.map((a) => ({
                  agentName: a.agentName || null,
                  empId: a.empId || null,
                  agentEmail: a.agentEmail,
                  agentPassword: a.agentPassword || null,
                  adminId: a.adminId || null,
                })) || [],
            },

            // === Nested Email Accounts ===
            emailAccounts: {
              create:
                d.emailAccounts?.map((ea) => ({
                  email: ea.email,
                  password: ea.password || null,
                  emailPurchaseDate: ea.emailPurchaseDate
                    ? new Date(ea.emailPurchaseDate)
                    : null,
                  emailExpiryDate: ea.emailExpiryDate
                    ? new Date(ea.emailExpiryDate)
                    : null,
                })) || [],
            },
          })),
        },
      },
      include: {
        domains: {
          include: {
            agents: true,
            emailAccounts: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "✅ Complete setup saved successfully!",
      data: createdHost,
    });
  } catch (error) {
    console.error("❌ Complete setup error:", error);
    res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

/* ===========================================================
   🧩 FETCH ALL DOMAINS + RELATIONS (for dashboard)
=========================================================== */
router.get("/all", async (req, res) => {
  try {
    const data = await prisma.domainHostAccount.findMany({
      include: {
        domains: {
          include: {
            agents: true,
            emailAccounts: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });
    res.json(data);
  } catch (error) {
    console.error("❌ Fetch error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

export default router;
