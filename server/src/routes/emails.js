// /api/manage/emails.js

import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Get all email accounts with domain + agents
router.get("/", async (req, res) => {
  try {
    const emails = await prisma.emailAccount.findMany({
      include: {
        domain: { select: { id: true, domainName: true } },
        agents: true,
      },
      orderBy: { id: "desc" },
    });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a new email account to a domain
router.post("/:domainId", async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const { email, password } = req.body;

    const newEmail = await prisma.emailAccount.create({
      data: { email, password, domainId },
    });

    res.json({ message: "✅ Email added successfully", data: newEmail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Assign agents to an email
router.post("/:emailId/agents", async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    const { agents } = req.body; // [{ agentName, agentEmail, role }, ...]

    const createdAgents = await prisma.$transaction(
      agents.map((a) =>
        prisma.emailAgent.create({
          data: {
            agentName: a.agentName,
            agentEmail: a.agentEmail,
            role: a.role,
            emailId,
          },
        })
      )
    );

    res.json({ message: "✅ Agents assigned successfully", data: createdAgents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete email + agents
router.delete("/:emailId", async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    await prisma.emailAgent.deleteMany({ where: { emailId } });
    await prisma.emailAccount.delete({ where: { id: emailId } });
    res.json({ message: "🗑️ Email and its agents deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
