"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBidById } from "@/lib/db";
import { Bid, VendorResponse } from "@/types";
import { ArrowLeft, Download, Mail, CheckCircle } from "lucide-react";
import { ComparisonTable } from "@/components/bids/comparison-table";

export default function ComparisonPage({ params }: { params: { bidId: string } }) {
  const { bidId } = params;
  const searchParams = useSearchParams();
  const selectedVendorId = searchParams?.get("vendor") || "all";
  const { user } = useAuth();
  const [bid, setBid] = useState<Bid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<string>("xlsx");

  useEffect(() => {
    // Set the selected vendor from URL param
    if (selectedVendorId) {
      setSelectedVendor(selectedVendorId);
    }
  }, [selectedVendorId]);

  useEffect(() => {
    async function loadBid() {
      try {
        if (user) {
          const bidData = await getBidById(bidId);
          if (bidData) {
            setBid(bidData);
          }
        }
      } catch (error) {
        console.error("Failed to load bid:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBid();
  }, [bidId, user]);
  
  // Get responding vendors with responses
  const respondingVendors = bid?.invitedVendors.filter(v => v.hasResponded) || [];
  
  // Handle export
  const handleExport = () => {
    // In a real application, this would generate and download the file
    console.log(`Exporting comparison in ${exportFormat} format`);
    alert(`Exporting comparison in ${exportFormat} format`);
  };

  if (isLoading || !bid) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <main className="p-6">
          <div className="text-center py-10">Loading comparison data...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Bid Comparison</h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href={`/dashboard/bids/${bidId}`}>
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bid
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{bid.title} - Comparison</h1>
          </div>
          
          <div className="flex space-x-2">
            <div className="flex items-center">
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Export as" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} className="ml-2">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {respondingVendors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <Mail className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No vendor responses yet</h3>
              <p className="text-gray-500 text-center mb-6">
                None of the invited vendors have responded to this bid yet.
              </p>
              <Link href={`/dashboard/bids/${bidId}`}>
                <Button variant="outline">
                  View Bid Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Vendor Responses</h2>
                    <p className="text-gray-500">
                      {respondingVendors.length} of {bid.invitedVendors.length} vendors have responded
                    </p>
                  </div>
                  
                  <div className="w-64">
                    <Select
                      value={selectedVendor}
                      onValueChange={setSelectedVendor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="View vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        {respondingVendors.map(vendor => (
                          <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
                            {vendor.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Comparison Table</CardTitle>
                <CardDescription>
                  {selectedVendor === "all" 
                    ? "Comparing all vendor responses" 
                    : `Viewing response from ${bid.invitedVendors.find(v => v.vendorId === selectedVendor)?.companyName}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonTable 
                  bid={bid} 
                  selectedVendorId={selectedVendor} 
                />
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
