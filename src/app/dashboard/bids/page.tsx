"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBids } from "@/lib/db";
import { Bid } from "@/types";

export default function BidsPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadBids() {
      try {
        if (user) {
          const allBids = await getBids(user.id);
          setBids(allBids);
        }
      } catch (error) {
        console.error("Failed to load bids:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBids();
  }, [user]);

  const filteredBids = bids.filter(bid => {
    // Filter by search query
    const matchesSearch = 
      bid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const now = new Date();
    const dueDate = new Date(bid.dueDate);
    const isActive = dueDate > now;
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && isActive;
    if (statusFilter === "completed") return matchesSearch && !isActive;
    
    return matchesSearch;
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Bids</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search bids by title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bids</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading bids...</p>
          </div>
        ) : filteredBids.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Bid ID</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Vendors</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBids.map((bid) => {
                    const dueDate = new Date(bid.dueDate);
                    const now = new Date();
                    const isActive = dueDate > now;
                    const respondedCount = bid.invitedVendors.filter(v => v.hasResponded).length;
                    const totalCount = bid.invitedVendors.length;

                    return (
                      <TableRow key={bid.id}>
                        <TableCell className="font-medium">{bid.title}</TableCell>
                        <TableCell>{bid.id.substring(0, 8)}</TableCell>
                        <TableCell>{dueDate.toLocaleDateString()}</TableCell>
                        <TableCell>{respondedCount} / {totalCount}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {isActive ? "Active" : "Completed"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/bids/${bid.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No bids found</p>
            <Link href="/dashboard/create-bid">
              <Button>Create Your First Bid</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
