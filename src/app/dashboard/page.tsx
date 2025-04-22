"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBids } from "@/lib/db";
import { Bid } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBids() {
      try {
        if (user) {
          const allBids = await getBids(user.id);
          
          // Sort bids by due date
          const sortedBids = [...allBids].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // Get active bids (due date is in the future)
          const active = sortedBids.filter(
            (bid) => new Date(bid.dueDate) > new Date()
          );
          
          // Get recent bids (last 5)
          const recent = sortedBids.slice(0, 5);
          
          setActiveBids(active);
          setRecentBids(recent);
        }
      } catch (error) {
        console.error("Failed to load bids:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBids();
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Active Bids" value={activeBids.length.toString()} />
          <StatCard title="Pending Responses" value={getPendingResponsesCount(activeBids).toString()} />
          <StatCard title="Vendors" value="--" />
          <StatCard title="Completed Bids" value="--" />
        </div>

        <Tabs defaultValue="active" className="mb-8">
          <TabsList>
            <TabsTrigger value="active">Active Bids</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <p>Loading bids...</p>
            ) : activeBids.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeBids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No active bids found</p>
                <Link href="/dashboard/create-bid">
                  <Button>Create Your First Bid</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          <TabsContent value="recent" className="space-y-4">
            {isLoading ? (
              <p>Loading recent activity...</p>
            ) : recentBids.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentBids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="text-3xl font-bold mt-2">{value}</div>
      </CardContent>
    </Card>
  );
}

function BidCard({ bid }: { bid: Bid }) {
  const dueDate = new Date(bid.dueDate).toLocaleDateString();
  const respondedCount = bid.invitedVendors.filter(v => v.hasResponded).length;
  const totalCount = bid.invitedVendors.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{bid.title}</CardTitle>
        <CardDescription>
          Due: {dueDate} • ID: {bid.id.substring(0, 8)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">
          <span className="font-medium">Status:</span>{" "}
          <span className="text-green-600 font-medium">Active</span>
        </div>
        <div className="text-sm mb-4">
          <span className="font-medium">Responses:</span>{" "}
          <span>{respondedCount} of {totalCount} vendors</span>
        </div>
        <Link href={`/dashboard/bids/${bid.id}`}>
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function getPendingResponsesCount(bids: Bid[]): number {
  return bids.reduce((total, bid) => {
    const pendingVendors = bid.invitedVendors.filter(v => !v.hasResponded).length;
    return total + pendingVendors;
  }, 0);
}
