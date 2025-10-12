// app/services/sse.ts
const API_PREFIX = "/api";

export type SSEHandlers = {
  onOrderUpdate?: (data: any) => void;
  onReady?: (data: any) => void;
  onPing?: (data: any) => void;
  onError?: (err: any) => void;
};

export type OrderUpdatePayload = {
  orderId: string;
  action: string;
  side?: "buyer" | "seller";
};

export function subscribeSSE(topic: string, handlers: SSEHandlers = {}) {
  const es = new EventSource(
    `${API_PREFIX}/v1/sse?${new URLSearchParams({ topic })}`
  );

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
  es.onerror = (err) => handlers.onError?.(err);

  return () => es.close();
}
