"use client";

import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { api } from "@/app/services/api";

/** ---------- Types (API snake_case) ---------- **/
type ApiDeposit = {
  id: string;
  amount: string | number;
  currency: string;
  provider: string;
  slip_url: string;
  slip_ref: string;
  status: string;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
};

type ApiWithdrawal = {
  id: string;
  amount: string | number;
  currency: string;
  method: string; // "BANK" | "PROMPTPAY" ...
  account_info: any; // JSON stored
  status: string; // "PENDING" | "PROCESSING" | "PAID" | "REJECTED" | "FAILED"
  failure_code?: string | null;
  failure_reason?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
};

type DepositsResp = { success: boolean; data: ApiDeposit[]; error?: string };
type WithdrawalsResp = {
  success: boolean;
  data: ApiWithdrawal[];
  error?: string;
};

/** ---------- FE Types (camelCase) ---------- **/
export type DepositRow = {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  slipUrl: string;
  slipRef: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type WithdrawalRow = {
  id: string;
  amount: number;
  currency: string;
  method: string;
  accountInfo: any;
  status: string;
  failureCode?: string | null;
  failureReason?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const toDepositRow = (d: ApiDeposit): DepositRow => ({
  id: d.id,
  amount: Number(d.amount),
  currency: d.currency,
  provider: d.provider,
  slipUrl: d.slip_url,
  slipRef: d.slip_ref,
  status: d.status,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

const toWithdrawalRow = (w: ApiWithdrawal): WithdrawalRow => ({
  id: w.id,
  amount: Number(w.amount),
  currency: w.currency,
  method: w.method,
  accountInfo: w.account_info,
  status: w.status,
  failureCode: w.failure_code ?? null,
  failureReason: w.failure_reason ?? null,
  processedAt: w.processed_at ?? null,
  createdAt: w.created_at,
  updatedAt: w.updated_at,
});

/** ---------- Zustand ---------- **/
type WalletHistoryState = {
  loading: boolean;
  error: string | null;
  deposits: DepositRow[];
  withdrawals: WithdrawalRow[];

  fetchDeposits: (opts?: { status?: string; limit?: number }) => Promise<void>;
  fetchWithdrawals: (opts?: {
    status?: string;
    limit?: number;
  }) => Promise<void>;
};

export const useWalletHistoryStore = create<WalletHistoryState>()(
  (set, get) => ({
    loading: false,
    error: null,
    deposits: [],
    withdrawals: [],

    fetchDeposits: async (opts) => {
      set({ loading: true, error: null });
      try {
        const q = new URLSearchParams();
        if (opts?.status) q.set("status", opts.status);
        if (opts?.limit) q.set("limit", String(opts.limit));
        const res = await api.get<DepositsResp>(
          `/v1/wallet/deposits?${q.toString()}`
        );
        if (!res.data?.success)
          throw new Error(res.data?.error || "Failed to load deposits");
        set({ deposits: res.data.data.map(toDepositRow) });
      } catch (e: any) {
        set({ error: e?.message || "Failed to load deposits" });
      } finally {
        set({ loading: false });
      }
    },

    fetchWithdrawals: async (opts) => {
      set({ loading: true, error: null });
      try {
        const q = new URLSearchParams();
        if (opts?.status) q.set("status", opts.status);
        if (opts?.limit) q.set("limit", String(opts.limit));
        const res = await api.get<WithdrawalsResp>(
          `/v1/wallet/withdrawals?${q.toString()}`
        );
        if (!res.data?.success)
          throw new Error(res.data?.error || "Failed to load withdrawals");
        set({ withdrawals: res.data.data.map(toWithdrawalRow) });
      } catch (e: any) {
        set({ error: e?.message || "Failed to load withdrawals" });
      } finally {
        set({ loading: false });
      }
    },
  })
);

export const useWalletHistorySlice = <T>(
  selector: (s: WalletHistoryState) => T
) => useWalletHistoryStore(useShallow(selector));
