"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { ItemTable } from "@/components/bids/item-table";
import { getBidById, extendBidDueDate, sendReminders } from "@/lib/db";
import { Bid } from "@/types";
import { AlertCircle, CheckCircle2, Clock, Calendar, RefreshCw } from "lucide-react";

export default function BidDetailPage({ params }: { params: { bidId: string } }) {
  const { bidId } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [bid, setBid] = useState<Bid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showRemindDialog, setShowRemindDialog] = useState(false);
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBid() {
      try {
        if (user) {
          const bidData = await getBidById(bidId);
          if (bidData) {
            setBid(bidData);
            if (newDueDate === undefined) {
              setNewDueDate(new Date(bidData.dueDate));
            }
          } else {
            router.push("/dashboard/bids");
          }
        }
      } catch (error) {
        console.error("Failed to load bid:", error);
        router.push("/dashboard/bids");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBid();
  }, [bidId, user, router, newDueDate]);

  const handleExtendDueDate = async () => {
    if (!bid || !newDueDate) return;
    
    setIsSubmitting(true);
    
    try {
      await extendBidDueDate(bidId, newDueDate);
      
      // Update local state
      setBid({
        ...bid,
        dueDate: newDueDate,
      });
      
      setShowExtendDialog(false);
      setMessage("Due date extended successfully");
    } catch (error) {
      console.error("Failed to extend due date:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReminders = async () => {
    if (!bid) return;
    
    setIsSubmitting(true);
    
    try {
      await sendReminders(bidId);
      setShowRemindDialog(false);
      setMessage("Reminders sent successfully");
    } catch (error) {
      console.error("Failed to send reminders:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !bid) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <main className="p-6">
          <div className="text-center py-10">Loading bid details...</div>
        </main>
      </div>
    );
  }

  const dueDate = new Date(bid.dueDate);
  const now = new Date();
  const isActive = dueDate > now;
  const respondedVendors = bid.invitedVendors.filter(v => v.hasResponded);
  const pendingVendors = bid.invitedVendors.filter(v => !v.hasResponded);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Bid Details</h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{bid.title}</h1>
            <p className="text-gray-500">Bid ID: {bid.id}</p>
          </div>
          <div className="flex space-x-2">
            <Link href={`/dashboard/comparison/${bidId}`}>
              <Button variant="outline">View Comparison</Button>
            </Link>
            {isActive && (
              <>
                <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Extend Due Date
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Extend Bid Due Date</DialogTitle>
                      <DialogDescription>
                        Set a new due date for this bid. This will notify all vendors.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Current Due Date:</p>
                        <p>{dueDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">New Due Date:</p>
                        <DatePicker 
                          date={newDueDate} 
                          setDate={setNewDueDate}
                          minDate={new Date()}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowExtendDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleExtendDueDate}
                        disabled={isSubmitting || !newDueDate || newDueDate <= new Date()}
                      >
                        {isSubmitting ? "Extending..." : "Extend Due Date"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showRemindDialog} onOpenChange={setShowRemindDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Clock className="mr-2 h-4 w-4" />
                      Send Reminders
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Bid Reminders</DialogTitle>
                      <DialogDescription>
                        Send reminder emails to vendors who have not yet responded.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="mb-2 font-medium">
                        {pendingVendors.length} vendors have not responded yet.
                      </p>
                      {pendingVendors.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {pendingVendors.map((vendor) => (
                            <li key={vendor.vendorId} className="text-sm">
                              {vendor.companyName} ({vendor.email})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">All vendors have responded!</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRemindDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSendReminders}
                        disabled={isSubmitting || pendingVendors.length === 0}
                      >
                        {isSubmitting ? "Sending..." : "Send Reminders"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded mb-6 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-2xl font-bold mt-1">{isActive ? "Active" : "Completed"}</p>
                </div>
                <div className={`p-2 rounded-full ${isActive ? "bg-green-100" : "bg-gray-100"}`}>
                  {isActive ? (
                    <Clock className="h-5 w-5 text-green-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-2xl font-bold mt-1">{dueDate.toLocaleDateString()}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Responses</p>
                  <p className="text-2xl font-bold mt-1">
                    {respondedVendors.length} / {bid.invitedVendors.length}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Bid Details</TabsTrigger>
            <TabsTrigger value="items">Bid Items</TabsTrigger>
            <TabsTrigger value="vendors">Invited Vendors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Bid Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1">{bid.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Company Tier</p>
                        <p className="text-gray-700">{bid.requirements.tier === "all" ? "All tiers" : bid.requirements.tier}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Material Class</p>
                        <p className="text-gray-700">{bid.requirements.materialClass === "all" ? "All classes" : bid.requirements.materialClass}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-gray-700">{bid.requirements.location === "all" ? "All locations" : bid.requirements.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Minimum Bid Amount</p>
                        <p className="text-gray-700">${bid.requirements.minBidAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Bid Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemTable items={bid.items} readOnly />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Invited Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bid.invitedVendors.map((vendor) => (
                      <TableRow key={vendor.vendorId}>
                        <TableCell className="font-medium">{vendor.companyName}</TableCell>
                        <TableCell>{vendor.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            vendor.hasResponded 
                              ? "bg-green-100 text-green-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {vendor.hasResponded ? "Responded" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {vendor.respondedAt 
                            ? new Date(vendor.respondedAt).toLocaleDateString() 
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {vendor.hasResponded && (
                            <Link href={`/dashboard/comparison/${bidId}?vendor=${vendor.vendorId}`}>
                              <Button variant="ghost" size="sm">
                                View Response
                              </Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
