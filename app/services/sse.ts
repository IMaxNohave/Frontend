// app/services/sse.ts
import { api } from "@/app/services/api";

export type SSEHandlers = {
  onOrderUpdate?: (data: any) => void;
  onReady?: (data: any) => void;
  onPing?: (data: any) => void;
  onError?: (err: any) => void;
};
type ExtraEvent = [name: string, handler: (data: any) => void];

export function subscribeSSE(
  topic: string,
  handlers: SSEHandlers = {},
  extra: ExtraEvent[] = []
) {
  const base = (api.defaults.baseURL || "").replace(/\/$/, ""); // <<< ใช้ baseURL ของ axios
  const url = `${base}/v1/sse?${new URLSearchParams({ topic })}`;

  // <<< ให้ส่งคุกกี้/credential ไปด้วย
  const es = new EventSource(url, { withCredentials: true });

  es.addEventListener("ready", (e) => {
    try {
      handlers.onReady?.(JSON.parse((e as MessageEvent).data));
    } catch {}
  });
  es.addEventListener("ping", (e) => {
    try {
      handlers.onPing?.(JSON.parse((e as MessageEvent).data));
    } catch {}
  });
  es.addEventListener("order.update", (e) => {
    try {
      handlers.onOrderUpdate?.(JSON.parse((e as MessageEvent).data));
    } catch {}
  });

  for (const [name, h] of extra) {
    es.addEventListener(name, (e) => {
      try {
        h(JSON.parse((e as MessageEvent).data));
      } catch {}
    });
  }

  es.onerror = (err) => handlers.onError?.(err);
  return () => es.close();
}
