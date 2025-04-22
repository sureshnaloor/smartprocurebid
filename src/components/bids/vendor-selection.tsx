"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getVendors } from "@/lib/db";
import { Vendor } from "@/types";

interface VendorSelectionProps {
  requirements: {
    tier: string;
    materialClass: string;
    location: string;
    minBidAmount: number;
  };
  selectedVendors: Vendor[];
  setSelectedVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
}

export function VendorSelection({
  requirements,
  selectedVendors,
  setSelectedVendors,
}: VendorSelectionProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load vendors
  useEffect(() => {
    async function loadVendors() {
      try {
        const allVendors = await getVendors();
        setVendors(allVendors);
      } catch (err) {
        setError("Failed to load vendors. Please try again.");
        console.error("Error loading vendors:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadVendors();
  }, []);

  // Filter vendors based on requirements and search query
  useEffect(() => {
    if (vendors.length === 0) return;

    const filtered = vendors.filter(vendor => {
      // Match search query
      const matchesSearch =
        vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.contactName && vendor.contactName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Match requirements
      const matchesTier = requirements.tier === "all" || vendor.tier === requirements.tier;
      const matchesMaterialClass =
        requirements.materialClass === "all" ||
        (vendor.materialClasses && vendor.materialClasses.some(mc => 
          mc.materialClass.toLowerCase().includes(requirements.materialClass.toLowerCase())
        ));
      const matchesLocation =
        requirements.location === "all" ||
        (vendor.location && vendor.location.toLowerCase().includes(requirements.location.toLowerCase()));

      return matchesSearch && matchesTier && matchesMaterialClass && matchesLocation;
    });

    setFilteredVendors(filtered);
  }, [vendors, searchQuery, requirements]);

  const handleVendorToggle = (vendor: Vendor) => {
    setSelectedVendors(prev => {
      const isSelected = prev.some(v => v.id === vendor.id);
      
      if (isSelected) {
        return prev.filter(v => v.id !== vendor.id);
      } else {
        return [...prev, vendor];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      // If all are selected, deselect all
      setSelectedVendors([]);
    } else {
      // Select all filtered vendors
      setSelectedVendors(filteredVendors);
    }
  };

  const isVendorSelected = (id: string) => {
    return selectedVendors.some(vendor => vendor.id === id);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vendor Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors by name, email, or contact person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading vendors...</div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-1">No matching vendors found</p>
                <p className="text-sm text-gray-500 mb-4">
                  {vendors.length === 0
                    ? "No vendors have been added yet."
                    : "Try adjusting your search or requirement filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                      onCheckedChange={handleSelectAll}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm">
                      Select All ({filteredVendors.length})
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendors.length} vendors selected
                  </p>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Material Class</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors.map(vendor => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <Checkbox
                              checked={isVendorSelected(vendor.id)}
                              onCheckedChange={() => handleVendorToggle(vendor)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{vendor.companyName}</div>
                            <div className="text-sm text-muted-foreground">{vendor.email}</div>
                          </TableCell>
                          <TableCell>
                            {vendor.contactName || "-"}
                            {vendor.phone && (
                              <div className="text-sm text-muted-foreground">{vendor.phone}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {vendor.tier === "tier1" ? "Tier 1" : 
                              vendor.tier === "tier2" ? "Tier 2" : "Tier 3"}
                            </span>
                          </TableCell>
                          <TableCell>{vendor.location || "-"}</TableCell>
                          <TableCell>
                            {vendor.materialClasses && vendor.materialClasses.length > 0 
                              ? vendor.materialClasses.map(mc => (
                                <span key={mc.id} className="inline-block px-2 py-1 mr-1 mb-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {mc.materialClass}
                                </span>
                              ))
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
