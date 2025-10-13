"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import { subscribeSSE } from "@/app/services/sse";
import { useOrderChatSlice } from "@/stores/orderChatStore";

type UseOrderChatOptions = {
  /** auto mark read เมื่อมีข้อความใหม่ (ของฝั่งตรงข้าม) และผู้ใช้กำลังเปิดหน้าอยู่ */
  autoMarkRead?: boolean;
};

/**
 * ใช้ในหน้า OrderDetail:
 * const { messages, send, loadMorePrev, markReadIfNeeded, readBadge } = useOrderChat(orderId, me.id)
 */
export function useOrderChat(
  orderId: string | undefined,
  meUserId: string | undefined,
  opts: UseOrderChatOptions = {}
) {
  const autoMarkRead = opts.autoMarkRead ?? true;
  const connectedRef = useRef(false);
  const markReadTick = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    ensure,
    fetchInitial,
    fetchMore,
    receiveNewMessage,
    receiveReadReceipt,
    sendMessage,
    markRead,
    slice,
  } = useOrderChatSlice((s) => ({
    ensure: s.ensure,
    fetchInitial: s.fetchInitial,
    fetchMore: s.fetchMore,
    receiveNewMessage: s.receiveNewMessage,
    receiveReadReceipt: s.receiveReadReceipt,
    sendMessage: s.sendMessage,
    markRead: s.markRead,
    slice: orderId ? s.byOrder[orderId] : undefined,
  }));

  // โหลดชุดแรก
  useEffect(() => {
    if (!orderId) return;
    ensure(orderId);
    const c = new AbortController();
    fetchInitial(orderId, c.signal);
    return () => c.abort();
  }, [orderId]);

  // สมัคร SSE per-order (กันซ้ำ StrictMode/HMR)
  useEffect(() => {
    if (!orderId) return;
    const off = subscribeSSE(
      `order:${orderId}`,
      { onError: (e) => console.warn("[SSE order chat] error:", e) },
      [
        [
          "order.message.new",
          (d) => d?.message && receiveNewMessage(orderId, d.message),
        ],
        [
          "order.message.read",
          (d) =>
            d?.userId &&
            d?.lastReadMessageId &&
            receiveReadReceipt(orderId, d.userId, d.lastReadMessageId),
        ],
      ]
    );
    return off;
  }, [orderId, receiveNewMessage, receiveReadReceipt]);

  /** รายการข้อความแบบ “พร้อมแสดงสถานะ read/delivered” */
  const messages = slice?.messages ?? [];
  const readByUser = slice?.readByUser ?? {};

  const messagesWithStatus = useMemo(() => {
    if (!meUserId)
      return messages.map((m) => ({ ...m, status: "delivered" as const }));
    // หา cursor ของ “อีกฝั่ง” (คนที่ไม่ใช่ฉัน) — ในห้องสองคนจะเหลือ 1 id
    // ถ้ามีแอดมิน เราจะโฟกัส read ของ "ฝั่งตรงข้าม" หลัก (buyer<->seller)
    const otherUserReadId =
      Object.entries(readByUser).find(([uid]) => uid !== meUserId)?.[1] ?? null;

    // หา index ของข้อความที่ otherUser อ่านถึง
    const readIdx = otherUserReadId
      ? messages.findIndex((m) => m.id === otherUserReadId)
      : -1;
    const readCutTime =
      readIdx >= 0 ? messages[readIdx].createdAt.getTime() : -1;

    return messages.map((m) => {
      // ของฉัน → read ถ้าอีกฝั่งอ่านถึงหลังเวลาของข้อความนี้
      if (m.senderId === meUserId) {
        const isRead = readCutTime >= 0 && m.createdAt.getTime() <= readCutTime;
        return {
          ...m,
          status: (isRead ? "read" : "delivered") as "read" | "delivered",
        };
      }
      // ของอีกฝั่ง → แสดงเป็น delivered เฉย ๆ
      return { ...m, status: "delivered" as const };
    });
  }, [messages, readByUser, meUserId]);

  /** ส่งข้อความ */
  const send = useCallback(
    (text: string) => {
      if (!orderId || !text.trim()) return Promise.resolve();
      return sendMessage(orderId, text.trim());
    },
    [orderId, sendMessage]
  );

  /** โหลดเพิ่ม */
  const loadMorePrev = useCallback(() => {
    if (!orderId) return;
    return fetchMore(orderId, "prev");
  }, [orderId, fetchMore]);

  /** mark read (debounce) — ใช้ตอน scroll ถึงท้าย หรือมีข้อความใหม่ */
  const markReadIfNeeded = useCallback(() => {
    if (!autoMarkRead || !orderId || !meUserId) return;
    const last = [...messages].reverse().find((m) => m.senderId !== meUserId);
    if (!last) return;
    if (markReadTick.current) clearTimeout(markReadTick.current);
    markReadTick.current = setTimeout(() => {
      // กัน spam: ถ้าเคยยิง id เดิมไปแล้ว store จะทับเฉย ๆ
      markRead(orderId, last.id, meUserId).catch(() => {});
    }, 300);
  }, [autoMarkRead, orderId, meUserId, messages, markRead]);

  // auto mark เมื่อมีข้อความใหม่เข้ามา
  useEffect(() => {
    markReadIfNeeded();
    return () => {
      if (markReadTick.current) clearTimeout(markReadTick.current);
    };
  }, [messages.length, markReadIfNeeded]);

  return {
    loading: slice?.loading ?? true,
    hasLoaded: slice?.hasLoaded ?? false,
    messages: messagesWithStatus, // พร้อม status: delivered|read
    send,
    loadMorePrev,
    markReadIfNeeded,
  };
}
