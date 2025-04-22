"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BidResponseForm } from "@/components/vendor/bid-response-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getBidByIdForVendor, submitVendorResponse } from "@/lib/db";
import { validateSubmission } from "@/lib/ai";
import { Bid, VendorSubmission } from "@/types";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function VendorBidPage({ params }: { params: { bidId: string } }) {
  const { bidId } = params;
  const router = useRouter();
  const [bid, setBid] = useState<Bid | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get vendorId from URL search params or localStorage
    const searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get("vendorId");
    
    if (!id) {
      // Try to get from localStorage as fallback
      id = localStorage.getItem(`vendor_${bidId}`) || null;
    } else {
      // Save to localStorage for future use
      localStorage.setItem(`vendor_${bidId}`, id);
    }
    
    setVendorId(id);
  }, [bidId]);

  useEffect(() => {
    async function loadBid() {
      try {
        if (vendorId) {
          const bidData = await getBidByIdForVendor(bidId, vendorId);
          if (bidData) {
            setBid(bidData);
            
            // Check if vendor has already responded
            const vendor = bidData.invitedVendors.find(v => v.vendorId === vendorId);
            if (vendor?.hasResponded) {
              setIsSubmitted(true);
            }
          } else {
            setError("Bid not found or you don't have access to this bid");
          }
        }
      } catch (error) {
        console.error("Failed to load bid:", error);
        setError("Failed to load bid details");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (vendorId) {
      loadBid();
    }
  }, [bidId, vendorId]);

  const handleSubmit = async (submission: VendorSubmission) => {
    if (!bid || !vendorId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate submission with AI
      const validationResult = await validateSubmission(submission);
      if (!validationResult.isValid) {
        setError(`Validation error: ${validationResult.message}`);
        setIsSubmitting(false);
        return;
      }
      
      // Submit response
      await submitVendorResponse(bidId, vendorId, submission);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit response:", err);
      setError("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading bid details...</p>
      </div>
    );
  }

  if (error && !bid) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-gray-500">
              If you believe this is an error, please contact the buyer who invited you.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!bid || !vendorId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Invalid Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              This bid link is invalid or has expired. Please use the link provided in your invitation email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if bid has expired
  const now = new Date();
  const dueDate = new Date(bid.dueDate);
  const isBidExpired = dueDate < now;

  // Get vendor details
  const vendor = bid.invitedVendors.find(v => v.vendorId === vendorId);
  
  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              You are not authorized to view or respond to this bid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Bid Response Form</h1>
          <p className="text-gray-500">Please review the bid details and submit your response below</p>
        </header>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isSubmitted ? (
          <Card className="mb-6">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Response Submitted</h2>
              <p className="text-gray-500 mb-6">
                Thank you for submitting your response. The buyer has been notified.
              </p>
              <p className="text-gray-600">
                Your response was submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        ) : isBidExpired ? (
          <Card className="mb-6">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Clock className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Bid Expired</h2>
              <p className="text-gray-500 mb-6">
                This bid has expired and is no longer accepting responses.
              </p>
              <p className="text-gray-600">
                The bid due date was {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{bid.title}</CardTitle>
                <CardDescription>
                  Requested by: {bid.buyer?.name || "Buyer"} | Due date: {dueDate.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p>{bid.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <BidResponseForm 
              bid={bid} 
              vendorId={vendorId}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </div>
  );
}
