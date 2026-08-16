import { NextResponse } from "next/server";

const WA_GATEWAY_URL = process.env.WA_GATEWAY_URL || "http://127.0.0.1:3001";

export async function GET() {
  try {
    const res = await fetch(`${WA_GATEWAY_URL}/api/status`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({
        online: false,
        isConnected: false,
        error: `Gateway status error: ${res.statusText}`,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      online: true,
      ...data.data,
    });
  } catch (err: any) {
    return NextResponse.json({
      online: false,
      isConnected: false,
      message: "WA Gateway server belum aktif di background (Port 3001).",
      instruction: "Jalankan 'npm run wa:server' untuk mengaktifkan daemon WhatsApp Web real.",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || "send";

    if (action === "logout") {
      const res = await fetch(`${WA_GATEWAY_URL}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Default: Send message
    const res = await fetch(`${WA_GATEWAY_URL}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal terhubung ke WA Gateway daemon. Pastikan server aktif.",
      },
      { status: 503 }
    );
  }
}
