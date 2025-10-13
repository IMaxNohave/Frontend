"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // ถ้าโปรเจกต์ยังไม่มี ให้สร้างตาม shadcn หรือใช้ <textarea> ธรรมดาแทน
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  total: number | string; // ยอดรวมในออเดอร์ (R$)
  defaultPct?: number; // ค่าเริ่มต้นฝั่งผู้ขาย (เช่น 50)
  onSubmit: (sellerPct: number, note?: string) => Promise<void> | void;
};

const fmtR = (n?: number | string) => `${Number(n ?? 0).toLocaleString()} R$`;
const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export function ResolveCustom({ total, defaultPct = 50, onSubmit }: Props) {
  const [pct, setPct] = useState<number>(defaultPct);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const totalNum = useMemo(() => Number(total || 0), [total]);

  const sellerAmount = useMemo(
    () => round2((totalNum * clamp(pct, 0, 100)) / 100),
    [pct, totalNum]
  );
  const buyerAmount = useMemo(
    () => round2(totalNum - sellerAmount),
    [sellerAmount, totalNum]
  );

  const quick = [0, 25, 50, 75, 100];

  const handleSubmit = async () => {
    const validPct = clamp(Number.isFinite(pct) ? pct : 0, 0, 100);
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      alert("ยอดรวม (total) ไม่ถูกต้อง");
      return;
    }
    if (!Number.isFinite(validPct)) {
      alert("เปอร์เซ็นต์ไม่ถูกต้อง");
      return;
    }
    if (
      !confirm(
        `ยืนยันตัดสินข้อพิพาท?\nSeller: ${validPct}%  (${fmtR(
          sellerAmount
        )})\nBuyer:  ${fmtR(buyerAmount)}`
      )
    ) {
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(validPct, note?.trim() ? note : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Resolve (Admin)</div>
          <div className="text-sm text-muted-foreground">
            Total: <span className="text-foreground">{fmtR(totalNum)}</span>
          </div>
        </div>

        {/* ปุ่มลัด */}
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <Button
              key={q}
              type="button"
              variant={pct === q ? "default" : "outline"}
              className={pct === q ? "bg-purple-600 hover:bg-purple-700" : ""}
              onClick={() => setPct(q)}
              disabled={submitting}
            >
              Seller {q}%
            </Button>
          ))}
        </div>

        {/* สไลเดอร์ + ช่องกรอกตัวเลข */}
        <div className="grid grid-cols-7 gap-3 items-center">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            disabled={submitting}
            className="col-span-5 w-full"
          />
          <div className="col-span-2 flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              value={pct}
              onChange={(e) => setPct(clamp(Number(e.target.value), 0, 100))}
              disabled={submitting}
            />
            <span className="text-sm">%</span>
          </div>
        </div>

        {/* พรีวิวผลลัพธ์ */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-3">
            <div className="text-sm text-muted-foreground">Seller gets</div>
            <div className="text-lg font-semibold">{fmtR(sellerAmount)}</div>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="text-sm text-muted-foreground">Buyer gets</div>
            <div className="text-lg font-semibold">{fmtR(buyerAmount)}</div>
          </div>
        </div>

        {/* หมายเหตุ */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Note (optional)</div>
          <Textarea
            placeholder="เหตุผล/หมายเหตุการตัดสิน"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* ปุ่มยืนยัน */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !Number.isFinite(totalNum) || totalNum <= 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {submitting ? "Resolving..." : `Resolve: Seller ${pct}%`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
