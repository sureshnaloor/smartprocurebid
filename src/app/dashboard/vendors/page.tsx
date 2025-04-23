"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { VendorModal } from "@/components/vendors/vendor-modal";
import { Search, Plus } from "lucide-react";
import { VendorViewModal } from "@/components/vendors/vendor-view-modal";

interface Vendor {
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
}

export default function VendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVendorForView, setSelectedVendorForView] = useState<Vendor | null>(null);

  useEffect(() => {
    async function loadVendors() {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVendors(data || []);
      } catch (error) {
        console.error("Failed to load vendors:", error);
        setError("Failed to load vendors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadVendors();

    // Set up real-time subscription
    const channel = supabase
      .channel('vendors_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVendors(prev => [payload.new as Vendor, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setVendors(prev => 
              prev.map(vendor => 
                vendor.id === payload.new.id ? payload.new as Vendor : vendor
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setVendors(prev => 
              prev.filter(vendor => vendor.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vendor.company_name.toLowerCase().includes(searchLower) ||
      vendor.contact_name.toLowerCase().includes(searchLower) ||
      vendor.email.toLowerCase().includes(searchLower) ||
      vendor.phone.toLowerCase().includes(searchLower) ||
      vendor.business_type.toLowerCase().includes(searchLower)
    );
  });

  const handleEditVendor = async (vendor: Vendor) => {
    try {
      // Fetch the complete vendor details
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendor.id)
        .single();

      if (error) throw error;
      
      setSelectedVendor(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch vendor details:", error);
      setError("Failed to load vendor details. Please try again.");
    }
  };

  const handleViewVendor = async (vendor: Vendor) => {
    try {
      // Fetch the complete vendor details
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendor.id)
        .single();

      if (error) throw error;
      
      setSelectedVendorForView(data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch vendor details:", error);
      setError("Failed to load vendor details. Please try again.");
    }
  };

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <Button onClick={handleAddVendor} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        <Card className="mb-6 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors..."
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading vendors...</p>
          </div>
        ) : filteredVendors.length > 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-900">Company</TableHead>
                    <TableHead className="text-gray-900">Contact</TableHead>
                    <TableHead className="text-gray-900">Email</TableHead>
                    <TableHead className="text-gray-900">Phone</TableHead>
                    <TableHead className="text-gray-900">Business Type</TableHead>
                    <TableHead className="text-right text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="text-gray-900">{vendor.company_name}</div>
                        <div className="text-sm text-gray-500">
                          {vendor.city}, {vendor.state}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{vendor.contact_name}</TableCell>
                      <TableCell className="text-gray-700">{vendor.email}</TableCell>
                      <TableCell className="text-gray-700">{vendor.phone}</TableCell>
                      <TableCell className="text-gray-700">{vendor.business_type}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewVendor(vendor)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditVendor(vendor)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-10">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-500 text-center mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Add your first vendor to get started"}
              </p>
              {searchQuery ? (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Clear Search
                </Button>
              ) : (
                <Button 
                  onClick={handleAddVendor}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <VendorViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedVendorForView(null);
          }}
          vendor={selectedVendorForView}
        />

        <VendorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVendor(null);
          }}
          vendor={selectedVendor || undefined}
        />
      </main>
    </div>
  );
}
