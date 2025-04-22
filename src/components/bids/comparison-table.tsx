"use client";

import { useState, useMemo } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bid, VendorResponse } from "@/types";

interface ComparisonTableProps {
  bid: Bid;
  selectedVendorId: string;
}

export function ComparisonTable({ bid, selectedVendorId }: ComparisonTableProps) {
  const [sortField, setSortField] = useState<string>("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterText, setFilterText] = useState("");

  // Get responding vendors with their responses
  const respondingVendors = useMemo(() => {
    return bid.invitedVendors.filter(v => v.hasResponded);
  }, [bid.invitedVendors]);

  // Filter vendors based on selectedVendorId
  const visibleVendors = useMemo(() => {
    if (selectedVendorId === "all") {
      return respondingVendors;
    }
    return respondingVendors.filter(v => v.vendorId === selectedVendorId);
  }, [respondingVendors, selectedVendorId]);

  // Filter items by search text
  const filteredItems = useMemo(() => {
    if (!filterText) return bid.items;
    
    return bid.items.filter(item => 
      item.materialCode.toLowerCase().includes(filterText.toLowerCase()) ||
      item.description.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [bid.items, filterText]);

  // Sort responses for each item
  const getSortedResponses = (itemId: string) => {
    const responses = visibleVendors
      .filter(vendor => vendor.response?.items.some(item => item.itemId === itemId))
      .map(vendor => {
        const itemResponse = vendor.response?.items.find(item => item.itemId === itemId);
        return {
          vendorId: vendor.vendorId,
          companyName: vendor.companyName,
          price: itemResponse?.price || 0,
          leadTime: itemResponse?.leadTime || 0,
          incoterm: itemResponse?.incoterm || "",
          paymentTerms: itemResponse?.paymentTerms || "",
        };
      });

    // Sort responses based on sort field and order
    return responses.sort((a, b) => {
      if (sortField === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortField === "leadTime") {
        return sortOrder === "asc" ? a.leadTime - b.leadTime : b.leadTime - a.leadTime;
      } else {
        // Sort by company name
        return sortOrder === "asc" 
          ? a.companyName.localeCompare(b.companyName) 
          : b.companyName.localeCompare(a.companyName);
      }
    });
  };

  // Get header-level responses
  const getHeaderResponses = () => {
    return visibleVendors
      .filter(vendor => vendor.response?.headerResponse)
      .map(vendor => ({
        vendorId: vendor.vendorId,
        companyName: vendor.companyName,
        incoterm: vendor.response?.headerResponse?.incoterm || "",
        paymentTerms: vendor.response?.headerResponse?.paymentTerms || "",
        additionalNotes: vendor.response?.headerResponse?.additionalNotes || "",
      }));
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (respondingVendors.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No vendor responses received yet for this bid.</AlertDescription>
      </Alert>
    );
  }

  if (visibleVendors.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>The selected vendor has not responded to this bid.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Filter by material code or description"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={sortField}
            onValueChange={setSortField}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="leadTime">Lead Time</SelectItem>
              <SelectItem value="companyName">Company</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList>
          <TabsTrigger value="items">Item Responses</TabsTrigger>
          <TabsTrigger value="header">Header Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Material</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>UoM</TableHead>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center justify-between">
                      <span>Vendor</span>
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort("price")}
                  >
                    <div className="flex items-center justify-between">
                      <span>Price</span>
                      {sortField === "price" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort("leadTime")}
                  >
                    <div className="flex items-center justify-between">
                      <span>Lead Time</span>
                      {sortField === "leadTime" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Incoterm</TableHead>
                  <TableHead>Payment Terms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No items match your filter criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const sortedResponses = getSortedResponses(item.id);
                    
                    // If no responses for this item from visible vendors
                    if (sortedResponses.length === 0) {
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.materialCode}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.uom}</TableCell>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No vendor responses for this item
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    // Display each vendor response as a separate row with item details only shown once
                    return sortedResponses.map((response, index) => (
                      <TableRow key={`${item.id}-${response.vendorId}`}>
                        {index === 0 ? (
                          <>
                            <TableCell className="font-medium">{item.materialCode}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.uom}</TableCell>
                          </>
                        ) : (
                          <TableCell colSpan={4} />
                        )}
                        <TableCell className="font-medium">{response.companyName}</TableCell>
                        <TableCell>${response.price.toFixed(2)}</TableCell>
                        <TableCell>{response.leadTime} days</TableCell>
                        <TableCell>{response.incoterm || "N/A"}</TableCell>
                        <TableCell>{response.paymentTerms || "N/A"}</TableCell>
                      </TableRow>
                    ));
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="header">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort("companyName")}
                  >
                    <div className="flex items-center justify-between">
                      <span>Vendor</span>
                      {sortField === "companyName" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Incoterm</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Additional Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getHeaderResponses().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No header-level responses provided by vendors
                    </TableCell>
                  </TableRow>
                ) : (
                  getHeaderResponses()
                    .sort((a, b) => {
                      if (sortField === "companyName") {
                        return sortOrder === "asc" 
                          ? a.companyName.localeCompare(b.companyName) 
                          : b.companyName.localeCompare(a.companyName);
                      }
                      return 0;
                    })
                    .map((response) => (
                      <TableRow key={response.vendorId}>
                        <TableCell className="font-medium">{response.companyName}</TableCell>
                        <TableCell>{response.incoterm || "N/A"}</TableCell>
                        <TableCell>{response.paymentTerms || "N/A"}</TableCell>
                        <TableCell className="max-w-md whitespace-normal">
                          {response.additionalNotes || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
