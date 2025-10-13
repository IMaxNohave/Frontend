"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, DollarSign, History } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

type WithdrawRequest = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  amount: string;
  currency: string;
  method: string;
  accountInfo: {
    bank: string;
    accountNo: string;
    accountHolder: string;
  };
  status: string;
  failureReason?: string | null;
  processedBy?: string | null;
  processedByName?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function WithdrawAdmin() {
  const token = useAuthStore((s) => s.token);
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/withdraw/all-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch requests");
      }

      setRequests(data.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch withdraw requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this withdraw request?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/withdraw/${id}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to approve");
      }

      alert("Withdraw request approved successfully!");
      // Refresh list
      fetchRequests();
    } catch (e: any) {
      alert(e?.message || "Failed to approve withdraw request");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`/api/v1/withdraw/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to reject");
      }

      alert("Withdraw request rejected successfully!");
      // Refresh list
      fetchRequests();
    } catch (e: any) {
      alert(e?.message || "Failed to reject withdraw request");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");

  // History: รวม approved + rejected เรียงตาม processedAt หรือ updatedAt ล่าสุดก่อน
  const processedRequests = [...approvedRequests, ...rejectedRequests].sort(
    (a, b) => {
      const dateA = new Date(a.processedAt || a.updatedAt).getTime();
      const dateB = new Date(b.processedAt || b.updatedAt).getTime();
      return dateB - dateA; // ล่าสุดก่อน
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground">
          Withdraw Management
        </h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          Pending: {pendingRequests.length}
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedRequests.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Withdraw Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
              <p className="text-lg">Loading withdraw requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No pending withdraw requests</p>
              <p className="text-sm mt-2">
                All withdraw requests will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account No.</TableHead>
                  <TableHead>Account Holder</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.userName || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.userEmail || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(request.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{request.accountInfo.bank}</TableCell>
                    <TableCell>{request.accountInfo.accountNo}</TableCell>
                    <TableCell>{request.accountInfo.accountHolder}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Withdraw History (Processed Requests)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
              <p className="text-lg">Loading history...</p>
            </div>
          ) : processedRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No processed requests yet</p>
              <p className="text-sm mt-2">
                Approved and rejected requests will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-muted">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* User Info */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          User
                        </p>
                        <p className="font-medium">{request.userName || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.userEmail || ""}
                        </p>
                      </div>

                      {/* Amount & Bank Info */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Amount & Bank
                        </p>
                        <p className="font-bold text-lg">
                          ${parseFloat(request.amount).toFixed(2)}
                        </p>
                        <p className="text-sm">
                          {request.accountInfo.bank} - {request.accountInfo.accountNo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.accountInfo.accountHolder}
                        </p>
                      </div>

                      {/* Status & Date */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Status
                        </p>
                        <Badge
                          className={
                            request.status === "APPROVED"
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }
                        >
                          {request.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Processed by:</span>{" "}
                          {request.processedByName || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Processed:{" "}
                          {request.processedAt
                            ? new Date(request.processedAt).toLocaleString()
                            : new Date(request.updatedAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested:{" "}
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Reason (for rejected) */}
                      <div>
                        {request.status === "REJECTED" &&
                          request.failureReason && (
                            <>
                              <p className="text-sm text-muted-foreground mb-1">
                                Rejection Reason
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {request.failureReason}
                              </p>
                            </>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
