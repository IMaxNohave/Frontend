"use client";

import type React from "react";
import { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useOrderChat } from "@/hooks/useOrderChat";

type UiStatus = "sent" | "delivered" | "read";
type UiType = "message" | "system";

type UiMessage = {
  id: string;
  content: string;
  senderId: string; // "system" เมื่อเป็น system message
  senderName: string; // "You" | "System" | "" (หรือจะเติมชื่อคู่สนทนาภายหลัง)
  senderRole: "buyer" | "seller" | "admin";
  timestamp: Date;
  status: UiStatus; // สำหรับ msg ของตัวเอง: delivered/read
  type: UiType;
};

interface TradingChatProps {
  orderId: string;
  currentUserId: string;
  currentUserRole: "buyer" | "seller";
}

export function TradingChat({
  orderId,
  currentUserId,
  currentUserRole,
}: TradingChatProps) {
  const { messages, loading, send, loadMorePrev, markReadIfNeeded } =
    useOrderChat(orderId, currentUserId, { autoMarkRead: true });

  // ---- local UI states
  const [newMessage, setNewMessage] = useState("");
  const [isTyping] = useState(false); // ไว้ต่อยอด typing indicator ภายหลัง
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // บอกบทบาทของอีกฝั่ง สำหรับโชว์ badge สี
  const otherRole: "buyer" | "seller" =
    currentUserRole === "buyer" ? "seller" : "buyer";

  // แมปข้อความจาก store → รูปแบบที่ UI เดิมใช้
  const uiMessages: UiMessage[] = useMemo(() => {
    return messages.map((m) => {
      const isSystem = m.kind === "SYSTEM" || m.senderId === null;
      const mine = m.senderId === currentUserId;

      return {
        id: m.id,
        content: m.body,
        senderId: isSystem ? "system" : m.senderId || "system",
        senderName: isSystem ? "System" : mine ? "You" : "",
        senderRole: isSystem ? "admin" : mine ? currentUserRole : otherRole,
        timestamp: m.createdAt,
        status: mine
          ? (m as any).status ?? ("delivered" as UiStatus)
          : "delivered",
        type: isSystem ? "system" : "message",
      };
    });
  }, [messages, currentUserId, currentUserRole, otherRole]);

  // ส่งข้อความจริง → ใช้ service ผ่าน hook
  const handleSendMessage = useCallback(async () => {
    const text = newMessage.trim();
    if (!text) return;
    await send(text);
    setNewMessage("");
    // ส่งแล้วก็ถือว่าอ่านท้ายห้อง (กรณีอยู่ในห้องเอง)
    markReadIfNeeded();
    // เลื่อนลงล่าง
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newMessage, send, markReadIfNeeded]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  // auto-scroll ลงล่างเมื่อมีข้อความใหม่
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uiMessages.length]);

  // ยิง markRead ถ้าเลื่อนใกล้ท้าย
  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (nearBottom) markReadIfNeeded();
  }, [markReadIfNeeded]);

  // ไอคอนสถานะ (ของข้อความ “ฉัน” เท่านั้น)
  const getMessageStatusIcon = (status: UiStatus) => {
    switch (status) {
      case "sent":
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case "read":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground">In-Order Chat</CardTitle>
          <Badge variant="outline" className="text-xs">
            {currentUserRole === "buyer" ? "Buyer" : "Seller"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* โหลดเพิ่มเติมด้านบน */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMorePrev()}
            disabled={loading}
          >
            Load older messages
          </Button>
        </div>

        {/* กล่องข้อความ */}
        <div
          ref={listRef}
          onScroll={onScroll}
          className="space-y-3 max-h-80 overflow-y-auto pr-2"
        >
          {uiMessages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUserId;
            const isSystemMessage = msg.type === "system";

            if (isSystemMessage) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-muted/50 text-muted-foreground px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[70%] space-y-1">
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          msg.senderRole === "buyer"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {msg.senderRole === "buyer" ? "Buyer" : "Seller"}
                      </Badge>
                      {msg.senderName ? (
                        <span className="text-xs text-muted-foreground">
                          {msg.senderName}
                        </span>
                      ) : null}
                    </div>
                  )}

                  <div
                    className={`px-3 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-accent text-accent-foreground ml-auto"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(msg.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                      {isOwnMessage && getMessageStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* กำลังพิมพ์ (เผื่อเปิดใช้งานในอนาคต) */}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <span>Other party is typing...</span>
          </div>
        )}

        {/* ส่งข้อความ */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-input border-border"
            maxLength={500}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-accent hover:bg-accent/90 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* ข้อแนะนำ */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <p className="font-medium mb-1">Chat Guidelines:</p>
          <ul className="space-y-1">
            <li>• Be respectful and professional with all users</li>
            <li>• Share game coordinates and meeting details clearly</li>
            <li>
              •{" "}
              {currentUserRole === "buyer"
                ? "Confirm item details before meeting"
                : "Verify payment before trading"}
            </li>
            <li>• Report any suspicious behavior to admin</li>
            <li>• Do not share personal information outside the platform</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
