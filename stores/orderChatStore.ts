"use client";

import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import type { ApiMessage } from "@/app/services/chat";
import {
  listMessages,
  sendMessage as apiSendMessage,
  markRead as apiMarkRead,
} from "@/app/services/chat";

/** รูปแบบที่ FE ใช้ (camelCase + Date) */
export type ChatMessage = {
  id: string;
  orderId: string;
  senderId: string | null; // null = SYSTEM
  kind: "TEXT" | "SYSTEM" | "IMAGE" | "VIDEO";
  body: string;
  createdAt: Date;
};

const normalize = (m: ApiMessage): ChatMessage => ({
  id: m.id,
  orderId: m.order_id,
  senderId: m.sender_id,
  kind: m.kind,
  body: m.body ?? "",
  createdAt: new Date(m.created_at),
});

type OrderChatSlice = {
  messages: ChatMessage[]; // เรียงเก่า→ใหม่ เสมอ
  nextCursor: string | null;
  prevCursor: string | null;
  loading: boolean;
  sending: boolean;
  hasLoaded: boolean;

  /** read-cursor ของแต่ละ user ในห้อง (ใช้กับ read receipt) */
  readByUser: Record<string, string /* lastReadMessageId */>;
  /** ของ "ฉัน" ล่าสุดที่ยิงขึ้น BE แล้ว (กันยิงซ้ำ) */
  myLastReadMessageId: string | null;
};

type Store = {
  byOrder: Record<string, OrderChatSlice>;
  ensure(orderId: string): void;

  /** โหลดหน้าแรก */
  fetchInitial(orderId: string, signal?: AbortSignal): Promise<void>;
  /** โหลดเพิ่ม (prev/next) */
  fetchMore(
    orderId: string,
    dir: "prev" | "next",
    signal?: AbortSignal
  ): Promise<void>;

  /** รับข้อความใหม่ผ่าน SSE */
  receiveNewMessage(orderId: string, m: ApiMessage): void;
  /** รับ read-receipt ผ่าน SSE */
  receiveReadReceipt(
    orderId: string,
    userId: string,
    lastReadMessageId: string
  ): void;

  /** ส่งข้อความ */
  sendMessage(
    orderId: string,
    body: string,
    kind?: ChatMessage["kind"]
  ): Promise<ChatMessage>;

  /** ยิง read ไป BE + อัพเดตสถานะใน store */
  markRead(
    orderId: string,
    lastReadMessageId: string,
    meUserId: string
  ): Promise<void>;
};

export const useOrderChatStore = create<Store>()((set, get) => ({
  byOrder: {},

  ensure(orderId) {
    const s = get().byOrder[orderId];
    if (!s) {
      set((prev) => ({
        byOrder: {
          ...prev.byOrder,
          [orderId]: {
            messages: [],
            nextCursor: null,
            prevCursor: null,
            loading: false,
            sending: false,
            hasLoaded: false,
            readByUser: {},
            myLastReadMessageId: null,
          },
        },
      }));
    }
  },

  async fetchInitial(orderId, signal) {
    get().ensure(orderId);
    set((prev) => ({
      byOrder: {
        ...prev.byOrder,
        [orderId]: { ...prev.byOrder[orderId], loading: true },
      },
    }));
    try {
      const data = await listMessages(orderId, {
        limit: 50,
        dir: "next",
        signal,
      });
      const messages = data.messages.map(normalize);
      set((prev) => ({
        byOrder: {
          ...prev.byOrder,
          [orderId]: {
            ...prev.byOrder[orderId],
            messages,
            nextCursor: data.next_cursor,
            prevCursor: data.prev_cursor,
            loading: false,
            hasLoaded: true,
          },
        },
      }));
    } catch (e) {
      set((prev) => ({
        byOrder: {
          ...prev.byOrder,
          [orderId]: { ...prev.byOrder[orderId], loading: false },
        },
      }));
    }
  },

  async fetchMore(orderId, dir, signal) {
    const slice = get().byOrder[orderId];
    if (!slice) return;
    const cursor = dir === "next" ? slice.nextCursor : slice.prevCursor;
    if (!cursor) return; // ไม่มีต่อ

    set((prev) => ({
      byOrder: {
        ...prev.byOrder,
        [orderId]: { ...prev.byOrder[orderId], loading: true },
      },
    }));

    try {
      const data = await listMessages(orderId, {
        limit: 50,
        cursor,
        dir,
        signal,
      });
      const chunk = data.messages.map(normalize);
      set((prev) => {
        const curr = prev.byOrder[orderId];
        const merged =
          dir === "next"
            ? [...curr.messages, ...chunk]
            : [...chunk, ...curr.messages];
        return {
          byOrder: {
            ...prev.byOrder,
            [orderId]: {
              ...curr,
              messages: merged,
              nextCursor: data.next_cursor,
              prevCursor: data.prev_cursor,
              loading: false,
            },
          },
        };
      });
    } catch (e) {
      set((prev) => ({
        byOrder: {
          ...prev.byOrder,
          [orderId]: { ...prev.byOrder[orderId], loading: false },
        },
      }));
    }
  },

  receiveNewMessage(orderId, m) {
    const msg = normalize(m);
    get().ensure(orderId);
    set((prev) => {
      const curr = prev.byOrder[orderId];
      // กันซ้ำ (เช่น รับจาก SSE และจากการส่งเอง)
      if (curr.messages.some((x) => x.id === msg.id)) return prev;
      return {
        byOrder: {
          ...prev.byOrder,
          [orderId]: { ...curr, messages: [...curr.messages, msg] },
        },
      };
    });
  },

  receiveReadReceipt(orderId, userId, lastReadMessageId) {
    get().ensure(orderId);
    set((prev) => {
      const curr = prev.byOrder[orderId];
      const prevId = curr.readByUser[userId];
      // เก็บ id ที่ "ใหม่กว่า" เท่านั้น (ปล่อยโลจิก compare ให้ backend แล้ว; ที่นี่ทับได้เลย)
      return {
        byOrder: {
          ...prev.byOrder,
          [orderId]: {
            ...curr,
            readByUser: { ...curr.readByUser, [userId]: lastReadMessageId },
          },
        },
      };
    });
  },

  async sendMessage(orderId, body, kind = "TEXT") {
    const apiMsg = await apiSendMessage(orderId, body, kind);
    const msg = normalize(apiMsg);
    // push เข้าสตอร์ทันที (กัน latency)
    get().receiveNewMessage(orderId, apiMsg);
    return msg;
  },

  async markRead(orderId, lastReadMessageId, meUserId) {
    // ยิงขึ้น BE (กันยิงถี่ → ให้ caller debounce เอง; hook จะจัดให้)
    await apiMarkRead(orderId, lastReadMessageId);
    // เก็บ cursor ของ "ฉัน"
    set((prev) => {
      const curr = prev.byOrder[orderId];
      return {
        byOrder: {
          ...prev.byOrder,
          [orderId]: {
            ...curr,
            myLastReadMessageId: lastReadMessageId,
            readByUser: {
              ...curr.readByUser,
              [meUserId]: lastReadMessageId,
            },
          },
        },
      };
    });
  },
}));

export const useOrderChatSlice = <T>(sel: (s: Store) => T) =>
  useOrderChatStore(useShallow(sel));
