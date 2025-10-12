// Frontend/app/api/v1/sse/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE = process.env.API_BASE ?? "http://localhost:3000";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const upstream = `${API_BASE}/v1/sse${u.search}`;

  const ac = new AbortController();

  // เตรียม header ไปหา BE
  const fwd = new Headers();
  fwd.set("accept", "text/event-stream");
  fwd.set("connection", "keep-alive");
  // ถ้ามี token ผ่าน query
  const token = u.searchParams.get("access_token");
  if (token) fwd.set("authorization", `Bearer ${token}`);

  let resp: Response;
  try {
    resp = await fetch(upstream, {
      headers: fwd,
      cache: "no-store",
      signal: ac.signal,
    });
  } catch (e) {
    return new Response("Upstream connect error", { status: 502 });
  }

  if (!resp.ok || !resp.body) {
    return new Response("Upstream error", { status: 502 });
  }

  // pipe: อ่านจาก upstream แล้วส่งต่อให้ client
  const upstreamReader = resp.body.getReader();

  const stream = new ReadableStream({
    start(controller) {
      (async function pump() {
        try {
          while (true) {
            const { done, value } = await upstreamReader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err: any) {
          // ถ้า client ปิด/รีเฟรช จะมาที่นี่ → ไม่ต้องโยน error ออก
          try {
            controller.close();
          } catch {}
        }
      })();
    },
    cancel() {
      // client ปิด → ยกเลิก upstream fetch ด้วย
      try {
        upstreamReader.cancel();
      } catch {}
      try {
        ac.abort();
      } catch {}
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      // ช่วยลดเคสที่ proxy gzip/บัฟเฟอร์
      "Content-Encoding": "identity",
    },
  });
}
