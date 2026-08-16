import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import QRCode from "qrcode";

const PORT = process.env.WA_GATEWAY_PORT || 3001;
const SESSION_PATH = path.resolve("./.wwebjs_auth");

process.on("uncaughtException", (err) => {
  console.error("[WA-GATEWAY UNCAUGHT EXCEPTION]", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[WA-GATEWAY UNHANDLED REJECTION]", reason?.message || reason);
});

function getExecutablePath() {
  const possiblePaths = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

let latestQrRaw = null;
let latestQrDataUrl = null;
let connectionState = {
  isConnected: false,
  phoneNumber: null,
  pushname: null,
  lastUpdated: new Date().toISOString(),
};

const executablePath = getExecutablePath();
console.log(`[WA-GATEWAY] Executable Path: ${executablePath || "Default Puppeteer"}`);

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: SESSION_PATH,
  }),
  puppeteer: {
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-extensions",
    ],
  },
  takeoverOnConflict: true,
  takeoverTimeoutMs: 0,
});

client.on("qr", async (qr) => {
  latestQrRaw = qr;
  try {
    latestQrDataUrl = await QRCode.toDataURL(qr);
  } catch {
    latestQrDataUrl = null;
  }
  connectionState.isConnected = false;
  connectionState.lastUpdated = new Date().toISOString();
  console.log("\n=======================================================");
  console.log("[WA-GATEWAY] QR Code Baru Siap di-Scan dari HP Anda!");
  console.log("=======================================================\n");
});

// Event saat HP berhasil scan QR
client.on("authenticated", () => {
  console.log("[WA-GATEWAY] ✅ Sesi Terotentikasi (QR Berhasil di-Scan)!");
  connectionState.isConnected = true;
  latestQrRaw = null;
  latestQrDataUrl = null;
  connectionState.lastUpdated = new Date().toISOString();
  
  if (client.info?.wid?.user) {
    connectionState.phoneNumber = client.info.wid.user;
    connectionState.pushname = client.info.pushname || "DCN Operations";
  }
});

client.on("ready", () => {
  connectionState.isConnected = true;
  connectionState.phoneNumber = client.info?.wid?.user || connectionState.phoneNumber;
  connectionState.pushname = client.info?.pushname || connectionState.pushname || "DCN Operations";
  connectionState.lastUpdated = new Date().toISOString();
  latestQrRaw = null;
  latestQrDataUrl = null;

  console.log(`\n[WA-GATEWAY] 🚀 WHATSAPP READY & ONLINE!`);
  console.log(`Nomor WA: ${connectionState.phoneNumber}`);
  console.log(`Nama: ${connectionState.pushname}\n`);
});

client.on("change_state", (state) => {
  console.log(`[WA-GATEWAY] State Changed: ${state}`);
  if (state === "CONNECTED") {
    connectionState.isConnected = true;
    latestQrDataUrl = null;
  } else if (state === "DISCONNECTED" || state === "CONFLICT") {
    connectionState.isConnected = false;
  }
});

client.on("auth_failure", (msg) => {
  console.error("[WA-GATEWAY] Gagal Otentikasi:", msg);
  connectionState.isConnected = false;
});

client.on("disconnected", (reason) => {
  console.warn("[WA-GATEWAY] WhatsApp Terputus:", reason);
  connectionState.isConnected = false;
  connectionState.phoneNumber = null;
  latestQrRaw = null;
  latestQrDataUrl = null;
});

client.initialize().catch((err) => {
  console.error("[WA-GATEWAY] Inisialisasi awal:", err.message);
});

// ── HTTP API Server (Non-blocking & Fast) ──
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. GET /api/status (Instant response without blocking evaluate)
  if (req.method === "GET" && url.pathname === "/api/status") {
    // Sinkronkan nomor jika client.info sudah terisi
    if (client?.info?.wid?.user && !connectionState.phoneNumber) {
      connectionState.phoneNumber = client.info.wid.user;
      connectionState.pushname = client.info.pushname || "DCN Operations";
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        data: {
          ...connectionState,
          qrCodeDataUrl: connectionState.isConnected ? null : latestQrDataUrl,
        },
      })
    );
    return;
  }

  // 2. POST /api/send
  if (req.method === "POST" && url.pathname === "/api/send") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { phone, message } = JSON.parse(body || "{}");
        if (!phone || !message) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Phone dan message wajib diisi." }));
          return;
        }

        if (!connectionState.isConnected || !client) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: "WhatsApp Gateway belum terhubung. Silakan scan QR code terlebih dahulu.",
            })
          );
          return;
        }

        let cleanPhone = String(phone).replace(/\D/g, "");
        if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.substring(1);
        if (cleanPhone.startsWith("8")) cleanPhone = "62" + cleanPhone;
        const chatId = `${cleanPhone}@c.us`;

        console.log(`[WA-GATEWAY] Mengirim pesan ke ${cleanPhone}...`);
        const sendResult = await client.sendMessage(chatId, message);
        console.log(`[WA-GATEWAY] ✅ Pesan berhasil dikirim ke ${cleanPhone}!`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            messageId: sendResult?.id?._serialized || "sent",
            recipient: cleanPhone,
          })
        );
      } catch (err) {
        console.error(`[WA-GATEWAY ERROR SEND]:`, err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 3. POST /api/logout
  if (req.method === "POST" && url.pathname === "/api/logout") {
    try {
      if (client) {
        await client.logout().catch(() => {});
      }
      connectionState.isConnected = false;
      connectionState.phoneNumber = null;
      latestQrRaw = null;
      latestQrDataUrl = null;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Sesi berhasil diputuskan." }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 WA Gateway Server berjalan di http://localhost:${PORT}`);
  console.log(`Status API: http://localhost:${PORT}/api/status`);
  console.log(`======================================================\n`);
});
