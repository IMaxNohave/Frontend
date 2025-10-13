"use client";
import { api } from "@/app/services/api";

/** รูปแบบจาก Backend (snake_case) */
export type ApiMessage = {
  id: string;
  order_id: string;
  sender_id: string | null; // null = SYSTEM
  kind: "TEXT" | "SYSTEM" | "IMAGE" | "VIDEO";
  body?: string | null;
  created_at: string; // ISO
  role?: "buyer" | "seller" | "admin";
  user_name?: string | null;
};

type ListResp = {
  success: boolean;
  data: {
    messages: ApiMessage[];
    next_cursor: string | null;
    prev_cursor: string | null;
  };
  error?: string;
};

type CreateResp = { success: boolean; data: ApiMessage; error?: string };
type OkResp = { success: boolean; error?: string };

export async function listMessages(
  orderId: string,
  opts?: {
    limit?: number;
    cursor?: string | null;
    dir?: "next" | "prev";
    signal?: AbortSignal;
  }
) {
  const p = new URLSearchParams();
  if (opts?.limit) p.set("limit", String(opts.limit));
  if (opts?.cursor) p.set("cursor", opts.cursor);
  if (opts?.dir) p.set("dir", opts.dir);
  const { data } = await api.get<ListResp>(
    `/v1/orders/${orderId}/messages?${p}`,
    {
      signal: opts?.signal,
    }
  );
  if (!data.success) throw new Error(data.error || "Failed to load messages");
  return data.data;
}

export async function sendMessage(
  orderId: string,
  body: string,
  kind: "TEXT" | "SYSTEM" | "IMAGE" | "VIDEO" = "TEXT"
) {
  const { data } = await api.post<CreateResp>(
    `/v1/orders/${orderId}/messages`,
    { kind, body }
  );
  if (!data.success) throw new Error(data.error || "Failed to send message");
  return data.data;
}

export async function markRead(orderId: string, lastReadMessageId: string) {
  const { data } = await api.post<OkResp>(`/v1/orders/${orderId}/read`, {
    lastReadMessageId,
  });
  if (!data.success) throw new Error(data.error || "Failed to mark read");
  return true;
}
