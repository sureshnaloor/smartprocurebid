"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { BidForm } from "@/components/bids/bid-form";
import { VendorSelection } from "@/components/bids/vendor-selection";
import { ItemTable } from "@/components/bids/item-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createBid } from "@/lib/db";
import { sendBidInvitations } from "@/lib/email";
import { validateBidItems } from "@/lib/ai";
import { BidItem, Vendor } from "@/types";

export default function CreateBidPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [bidDetails, setBidDetails] = useState({
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    requirements: {
      tier: "all",
      materialClass: "all",
      location: "all",
      minBidAmount: 0,
    },
  });
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [bidItems, setBidItems] = useState<BidItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate bid with AI
      if (bidItems.length > 0) {
        const validationResult = await validateBidItems(bidItems);
        if (!validationResult.isValid) {
          setError(`AI validation failed: ${validationResult.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Create the bid
      const newBid = await createBid({
        buyerId: user.id,
        title: bidDetails.title,
        description: bidDetails.description,
        dueDate: bidDetails.dueDate,
        requirements: bidDetails.requirements,
        items: bidItems,
        invitedVendors: selectedVendors.map(vendor => ({
          vendorId: vendor.id,
          email: vendor.email,
          companyName: vendor.companyName,
          hasResponded: false,
        })),
      });

      // Send email invitations to selected vendors
      await sendBidInvitations(newBid, selectedVendors);
      
      router.push(`/dashboard/bids/${newBid.id}`);
    } catch (err) {
      console.error("Failed to create bid:", err);
      setError("Failed to create bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToVendors = bidDetails.title.trim() !== "" && 
    bidDetails.description.trim() !== "";
  
  const canProceedToItems = selectedVendors.length > 0;
  
  const canSubmitBid = bidItems.length > 0;

  const handleNextTab = () => {
    if (activeTab === "details" && canProceedToVendors) {
      setActiveTab("vendors");
    } else if (activeTab === "vendors" && canProceedToItems) {
      setActiveTab("items");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create New Bid</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Bid Details</TabsTrigger>
            <TabsTrigger 
              value="vendors" 
              disabled={!canProceedToVendors}
            >
              Select Vendors
            </TabsTrigger>
            <TabsTrigger 
              value="items" 
              disabled={!canProceedToItems}
            >
              Bid Items
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <BidForm 
              bidDetails={bidDetails} 
              setBidDetails={setBidDetails} 
            />
            <div className="flex justify-end mt-6">
              <Button onClick={handleNextTab} disabled={!canProceedToVendors}>
                Next: Select Vendors
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="vendors" className="mt-6">
            <VendorSelection 
              requirements={bidDetails.requirements}
              selectedVendors={selectedVendors}
              setSelectedVendors={setSelectedVendors}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back
              </Button>
              <Button onClick={handleNextTab} disabled={!canProceedToItems}>
                Next: Add Items
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="items" className="mt-6">
            <ItemTable 
              items={bidItems} 
              setItems={setBidItems} 
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("vendors")}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmitBid || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Bid"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
