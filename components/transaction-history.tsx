"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useWalletHistorySlice } from "@/stores/walletStore";
import { useAuthStore } from "@/stores/authStore";

const fmtR = (n?: number | string, currency = "R$") =>
  `${Number(n ?? 0).toLocaleString()} ${currency}`;

const statusBadgeCls = (s: string) => {
  const k = (s || "").toUpperCase();
  if (k === "PENDING" || k === "PROCESSING")
    return "bg-yellow-500/20 text-yellow-400";
  if (k === "APPROVED" || k === "PAID" || k === "COMPLETED")
    return "bg-green-500/20 text-green-400";
  if (k === "REJECTED" || k === "FAILED") return "bg-red-500/20 text-red-400";
  return "bg-slate-500/20 text-slate-300";
};

export function TransactionHistory() {
  const {
    deposits,
    withdrawals,
    loading,
    error,
    fetchDeposits,
    fetchWithdrawals,
  } = useWalletHistorySlice((s) => ({
    deposits: s.deposits,
    withdrawals: s.withdrawals,
    loading: s.loading,
    error: s.error,
    fetchDeposits: s.fetchDeposits,
    fetchWithdrawals: s.fetchWithdrawals,
  }));
  const isReady = useAuthStore((s: any) => s.isReady);

  useEffect(() => {
    // load ทั้งสองอย่าง
    if (!isReady) return;
    fetchDeposits({ limit: 100 });
    fetchWithdrawals({ limit: 100 });
  }, [isReady]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Wallet Transactions
        </h1>
        <p className="text-muted-foreground">
          Track your deposits & withdrawals
        </p>
      </div>

      {error ? <p className="text-sm text-red-500 mb-4">{error}</p> : null}

      <Tabs defaultValue="deposits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-card">
          <TabsTrigger
            value="deposits"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Deposits
          </TabsTrigger>
          <TabsTrigger
            value="withdrawals"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Withdrawals
          </TabsTrigger>
        </TabsList>

        {/* Deposits */}
        <TabsContent value="deposits">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5" />
                Deposit History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && deposits.length === 0 ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : deposits.length === 0 ? (
                <p className="text-muted-foreground">No deposits found.</p>
              ) : (
                deposits.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground">
                        {fmtR(d.amount)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Provider: {d.provider} • Ref: {d.slipRef}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={statusBadgeCls(d.status)}>
                        {d.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals */}
        <TabsContent value="withdrawals">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                Withdrawal History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && withdrawals.length === 0 ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : withdrawals.length === 0 ? (
                <p className="text-muted-foreground">No withdrawals found.</p>
              ) : (
                withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground">
                        {fmtR(w.amount)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Method: {w.method}
                        {w.failureReason ? ` • Reason: ${w.failureReason}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(w.createdAt).toLocaleString()}
                        {w.processedAt
                          ? ` • Processed: ${new Date(
                              w.processedAt
                            ).toLocaleString()}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={statusBadgeCls(w.status)}>
                        {w.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
