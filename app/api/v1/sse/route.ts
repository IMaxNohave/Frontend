// ✅ ใช้ Node runtime และห้าม cache
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { headers as nextHeaders, cookies } from "next/headers";

const API_BASE = process.env.API_BASE ?? "http://localhost:3000";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const upstream = `${API_BASE}/v1/sse?${url.searchParams.toString()}`;

  // ---- เตรียม header ที่จะส่งไป BE (ทำก่อน fetch) ----
  const h = new Headers();
  h.set("Accept", "text/event-stream");
  h.set("Connection", "keep-alive");

  // forward cookie (ถ้ามี)
  const cookie = nextHeaders().get("cookie") ?? cookies().toString();
  if (cookie) h.set("cookie", cookie);

  // ถ้าใช้ bearer ผ่าน query (กรณี EventSource ใส่ header ไม่ได้)
  const token = url.searchParams.get("access_token");
  if (token) h.set("authorization", `Bearer ${token}`);

  // ---- ยิงไป BE และ "pipe" body กลับแบบสตรีม ----
  const resp = await fetch(upstream, {
    headers: h,
    cache: "no-store",
    // @ts-ignore: บาง env ของ undici ต้องการ duplex เพื่อให้สตรีม
    duplex: "half",
  });

  if (!resp.ok || !resp.body) {
    return new Response("Upstream SSE error", { status: resp.status || 502 });
  }

  // สำคัญ: ต้อง pipe สตรีมจริง ๆ เพื่อกันการบัฟเฟอร์ใน dev
  const { readable, writable } = new TransformStream();
  resp.body.pipeTo(writable);

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
