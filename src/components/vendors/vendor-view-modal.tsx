"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VendorViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    business_type: string;
    description: string;
    website: string;
    tax_id: string;
    created_at: string;
  } | null;
}

export function VendorViewModal({ isOpen, onClose, vendor }: VendorViewModalProps) {
  if (!vendor) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Vendor Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
                    <p className="mt-1 text-gray-900">{vendor.company_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Name</h3>
                    <p className="mt-1 text-gray-900">{vendor.contact_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-gray-900">{vendor.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-gray-900">{vendor.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Business Type</h3>
                    <p className="mt-1 text-gray-900">{vendor.business_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tax ID</h3>
                    <p className="mt-1 text-gray-900">{vendor.tax_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Website</h3>
                    <p className="mt-1 text-gray-900">
                      {vendor.website ? (
                        <a 
                          href={vendor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {vendor.website}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-gray-900">
                    {vendor.address}<br />
                    {vendor.city}, {vendor.state} {vendor.zip_code}<br />
                    {vendor.country}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{vendor.description || "No description provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 