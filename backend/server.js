const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ─── File paths ───────────────────────────────────────────────────────────────
const USERS_FILE = path.join(__dirname, "users.json");
const CONFIG_FILE = path.join(__dirname, "mail.config.json");

// ─── Read/write helpers ───────────────────────────────────────────────────────
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")); } catch { return []; }
}

function saveUser(entry) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.email === entry.email);
  if (idx !== -1) users[idx] = entry; else users.push(entry);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readMailConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")); } catch { return null; }
}

// ─── OTP store ────────────────────────────────────────────────────────────────
const OTP_STORE = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Build transporter ─────────────────────────────────────────────────────────
// Priority: mail.config.json → Ethereal fallback
async function buildTransporter() {
  const cfg = readMailConfig();
  if (cfg && cfg.user && cfg.pass) {
    console.log(`📧 Using Gmail SMTP: ${cfg.user}`);
    return {
      transport: nodemailer.createTransport({
        service: "gmail",
        auth: { user: cfg.user, pass: cfg.pass },
      }),
      fromAddr: cfg.user,
      isReal: true,
    };
  }
  // Fallback: Ethereal test account (preview URL only — not real inbox)
  console.log("⚠️  No mail.config.json found — using Ethereal test account (preview URL only)");
  const testAccount = await nodemailer.createTestAccount();
  return {
    transport: nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    }),
    fromAddr: testAccount.user,
    isReal: false,
  };
}

// ─── POST /api/setup-mail — saves Gmail credentials to mail.config.json ───────
app.post("/api/setup-mail", (req, res) => {
  const { user, pass } = req.body;
  if (!user || !pass)
    return res.status(400).json({ success: false, message: "Gmail user and app password required." });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ user, pass }, null, 2));
  console.log(`✅ Gmail SMTP configured: ${user}`);
  res.json({ success: true, message: "Mail config saved!" });
});

// ─── GET /api/mail-status ─────────────────────────────────────────────────────
app.get("/api/mail-status", (req, res) => {
  const cfg = readMailConfig();
  res.json({ configured: !!(cfg && cfg.user && cfg.pass), email: cfg?.user || null });
});

// ─── POST /api/send-otp ───────────────────────────────────────────────────────
app.post("/api/send-otp", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, message: "Invalid email address." });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

  const otp = generateOTP();
  OTP_STORE[email.toLowerCase()] = { otp, password, expiresAt: Date.now() + 5 * 60 * 1000 };

  console.log(`\n🔑 OTP for ${email}: ${otp}`);

  try {
    const { transport, fromAddr, isReal } = await buildTransporter();
    const info = await transport.sendMail({
      from: `"MFA System 🔐" <${fromAddr}>`,
      to: email,
      subject: "Your One-Time Password (OTP)",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f0f1a;color:#e0e0ff;border-radius:16px;">
          <h2 style="color:#a78bfa;">🔐 MFA Verification</h2>
          <p style="color:#94a3b8;">Your one-time password to complete login:</p>
          <div style="background:#1e1b4b;border:2px solid #6d28d9;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
            <span style="font-size:42px;font-weight:700;letter-spacing:14px;color:#c4b5fd;">${otp}</span>
          </div>
          <p style="color:#64748b;font-size:13px;">Expires in <strong style="color:#a78bfa;">5 minutes</strong>. Do not share.</p>
        </div>
      `,
    });

    let previewUrl = null;
    if (!isReal) previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      success: true,
      message: isReal
        ? `OTP sent to ${email}. Check your inbox!`
        : `Demo mode: OTP shown below (Ethereal preview — not real inbox)`,
      previewUrl,
      // In demo mode, send OTP to frontend so user can see it
      demoOtp: isReal ? null : otp,
    });
  } catch (err) {
    console.error("Email error:", err.message);
    // Even if email fails, still let them verify via console OTP
    res.json({
      success: true,
      message: "Email failed — check server console for your OTP.",
      previewUrl: null,
      demoOtp: otp, // always show on screen if email fails
    });
  }
});

// ─── POST /api/verify-otp ─────────────────────────────────────────────────────
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = OTP_STORE[email?.toLowerCase()];

  if (!record)
    return res.status(400).json({ success: false, message: "No OTP found. Please start over." });
  if (Date.now() > record.expiresAt) {
    delete OTP_STORE[email.toLowerCase()];
    return res.status(401).json({ success: false, message: "OTP expired. Please try again." });
  }
  if (record.otp !== otp?.trim())
    return res.status(401).json({ success: false, message: "Incorrect OTP. Try again." });

  const entry = {
    email: email.toLowerCase(),
    password: record.password,
    authenticatedAt: new Date().toISOString(),
  };
  saveUser(entry);
  delete OTP_STORE[email.toLowerCase()];

  console.log(`\n✅ Authenticated & saved: ${email}`);
  res.json({ success: true, message: "Authentication successful!", user: { email: entry.email, authenticatedAt: entry.authenticatedAt } });
});

// ─── POST /api/resend-otp ─────────────────────────────────────────────────────
app.post("/api/resend-otp", async (req, res) => {
  const { email } = req.body;
  const existing = OTP_STORE[email?.toLowerCase()];
  if (!existing)
    return res.status(400).json({ success: false, message: "Session expired. Login again." });

  const otp = generateOTP();
  OTP_STORE[email.toLowerCase()] = { ...existing, otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  console.log(`\n🔄 Resent OTP for ${email}: ${otp}`);

  try {
    const { transport, fromAddr, isReal } = await buildTransporter();
    const info = await transport.sendMail({
      from: `"MFA System" <${fromAddr}>`,
      to: email,
      subject: "Your Resent OTP",
      html: `<div style="font-family:sans-serif;padding:24px;background:#0f0f1a;color:#fff;border-radius:12px;"><h2 style="color:#a78bfa;">New OTP: <span style="letter-spacing:10px;">${otp}</span></h2><p style="color:#64748b">Expires in 5 minutes.</p></div>`,
    });
    let previewUrl = isReal ? null : nodemailer.getTestMessageUrl(info);
    res.json({ success: true, message: "OTP resent!", previewUrl, demoOtp: isReal ? null : otp });
  } catch {
    res.json({ success: true, message: "Resent (check console).", previewUrl: null, demoOtp: otp });
  }
});

// ─── GET /api/users ───────────────────────────────────────────────────────────
app.get("/api/users", (req, res) => res.json(readUsers()));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 MFA Backend → http://localhost:${PORT}`);
  console.log(`📁 Users file   → ${USERS_FILE}`);
  const cfg = readMailConfig();
  if (cfg?.user) {
    console.log(`📧 Mail config  → Gmail: ${cfg.user}`);
  } else {
    console.log(`⚠️  Mail config  → NOT SET (demo mode — OTP shown on screen)`);
    console.log(`   To enable real email: open the app and go to ⚙️ Settings\n`);
  }
});
