"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bid, VendorSubmission } from "@/types";
import { AlertCircle } from "lucide-react";

interface BidResponseFormProps {
  bid: Bid;
  vendorId: string;
  isSubmitting: boolean;
  onSubmit: (submission: VendorSubmission) => void;
}

export function BidResponseForm({ bid, vendorId, isSubmitting, onSubmit }: BidResponseFormProps) {
  const [activeTab, setActiveTab] = useState<"items" | "header">("items");
  const [itemResponses, setItemResponses] = useState<{ 
    [key: string]: { 
      price: string; 
      leadTime: string; 
      incoterm: string;
      paymentTerms: string;
    } 
  }>({});
  
  const [headerResponse, setHeaderResponse] = useState({
    incoterm: "",
    paymentTerms: "",
    additionalNotes: "",
  });
  
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
  const handleItemChange = (itemId: string, field: string, value: string) => {
    setItemResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId] || { price: "", leadTime: "", incoterm: "", paymentTerms: "" },
        [field]: value,
      }
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[`${itemId}-${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${itemId}-${field}`];
        return newErrors;
      });
    }
  };
  
  const handleHeaderChange = (field: string, value: string) => {
    setHeaderResponse(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[`header-${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`header-${field}`];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;
    
    // Check if at least one item has pricing information
    const hasItemResponses = Object.keys(itemResponses).some(itemId => {
      const response = itemResponses[itemId];
      return !!response.price.trim();
    });
    
    // Check if header has pricing information
    const hasHeaderResponse = !!headerResponse.incoterm || !!headerResponse.paymentTerms;
    
    // If neither item nor header has responses, show error
    if (!hasItemResponses && !hasHeaderResponse) {
      errors["form"] = "Please provide pricing information either at the item level or header level";
      isValid = false;
    }
    
    // Validate each item response that has been started
    Object.entries(itemResponses).forEach(([itemId, response]) => {
      // Only validate if the user has started filling out this item
      if (response.price || response.leadTime || response.incoterm || response.paymentTerms) {
        // Price is required if any field is filled
        if (!response.price) {
          errors[`${itemId}-price`] = "Price is required";
          isValid = false;
        } else if (isNaN(parseFloat(response.price)) || parseFloat(response.price) < 0) {
          errors[`${itemId}-price`] = "Price must be a valid positive number";
          isValid = false;
        }
        
        // Lead time is required if any field is filled
        if (!response.leadTime) {
          errors[`${itemId}-leadTime`] = "Lead time is required";
          isValid = false;
        } else if (isNaN(parseInt(response.leadTime)) || parseInt(response.leadTime) < 1) {
          errors[`${itemId}-leadTime`] = "Lead time must be a valid positive number";
          isValid = false;
        }
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Format the submission data
    const items = Object.keys(itemResponses).map(itemId => {
      const response = itemResponses[itemId];
      // Only include items with at least a price
      if (!response.price) return null;
      
      return {
        itemId,
        price: parseFloat(response.price),
        leadTime: parseInt(response.leadTime) || 0,
        incoterm: response.incoterm,
        paymentTerms: response.paymentTerms,
      };
    }).filter(item => item !== null) as Array<{
      itemId: string;
      price: number;
      leadTime: number;
      incoterm: string;
      paymentTerms: string;
    }>;
    
    const submission: VendorSubmission = {
      vendorId,
      items,
      headerResponse: (
        headerResponse.incoterm || 
        headerResponse.paymentTerms || 
        headerResponse.additionalNotes
      ) ? headerResponse : undefined,
    };
    
    onSubmit(submission);
  };
  
  return (
    <div className="space-y-6">
      {validationErrors["form"] && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationErrors["form"]}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Response Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "items" | "header")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items">Item-Level Response</TabsTrigger>
              <TabsTrigger value="header">Header-Level Response</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      <TabsContent value="items" className={activeTab === "items" ? "block" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Item-Level Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead className="w-28">Price</TableHead>
                    <TableHead className="w-28">Lead Time (days)</TableHead>
                    <TableHead className="w-28">Incoterm</TableHead>
                    <TableHead className="w-28">Payment Terms</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bid.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.materialCode}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                            <Input
                              value={itemResponses[item.id]?.price || ""}
                              onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                              placeholder="0.00"
                              className="pl-7"
                            />
                          </div>
                          {validationErrors[`${item.id}-price`] && (
                            <p className="text-xs text-red-500">{validationErrors[`${item.id}-price`]}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            value={itemResponses[item.id]?.leadTime || ""}
                            onChange={(e) => handleItemChange(item.id, "leadTime", e.target.value)}
                            placeholder="0"
                            type="number"
                            min="1"
                          />
                          {validationErrors[`${item.id}-leadTime`] && (
                            <p className="text-xs text-red-500">{validationErrors[`${item.id}-leadTime`]}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={itemResponses[item.id]?.incoterm || ""}
                          onValueChange={(value) => handleItemChange(item.id, "incoterm", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Select</SelectItem>
                            <SelectItem value="EXW">EXW</SelectItem>
                            <SelectItem value="FCA">FCA</SelectItem>
                            <SelectItem value="FAS">FAS</SelectItem>
                            <SelectItem value="FOB">FOB</SelectItem>
                            <SelectItem value="CFR">CFR</SelectItem>
                            <SelectItem value="CIF">CIF</SelectItem>
                            <SelectItem value="CPT">CPT</SelectItem>
                            <SelectItem value="CIP">CIP</SelectItem>
                            <SelectItem value="DAP">DAP</SelectItem>
                            <SelectItem value="DPU">DPU</SelectItem>
                            <SelectItem value="DDP">DDP</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={itemResponses[item.id]?.paymentTerms || ""}
                          onValueChange={(value) => handleItemChange(item.id, "paymentTerms", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Select</SelectItem>
                            <SelectItem value="Net 30">Net 30</SelectItem>
                            <SelectItem value="Net 45">Net 45</SelectItem>
                            <SelectItem value="Net 60">Net 60</SelectItem>
                            <SelectItem value="Net 90">Net 90</SelectItem>
                            <SelectItem value="Immediate">Immediate</SelectItem>
                            <SelectItem value="50% Advance">50% Advance</SelectItem>
                            <SelectItem value="Letter of Credit">Letter of Credit</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="header" className={activeTab === "header" ? "block" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Header-Level Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incoterm">Incoterm (applies to all items)</Label>
                <Select
                  value={headerResponse.incoterm}
                  onValueChange={(value) => handleHeaderChange("incoterm", value)}
                >
                  <SelectTrigger id="incoterm">
                    <SelectValue placeholder="Select incoterm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select</SelectItem>
                    <SelectItem value="EXW">EXW</SelectItem>
                    <SelectItem value="FCA">FCA</SelectItem>
                    <SelectItem value="FAS">FAS</SelectItem>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CFR">CFR</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="CPT">CPT</SelectItem>
                    <SelectItem value="CIP">CIP</SelectItem>
                    <SelectItem value="DAP">DAP</SelectItem>
                    <SelectItem value="DPU">DPU</SelectItem>
                    <SelectItem value="DDP">DDP</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors["header-incoterm"] && (
                  <p className="text-xs text-red-500">{validationErrors["header-incoterm"]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms (applies to all items)</Label>
                <Select
                  value={headerResponse.paymentTerms}
                  onValueChange={(value) => handleHeaderChange("paymentTerms", value)}
                >
                  <SelectTrigger id="paymentTerms">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Net 90">Net 90</SelectItem>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="50% Advance">50% Advance</SelectItem>
                    <SelectItem value="Letter of Credit">Letter of Credit</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors["header-paymentTerms"] && (
                  <p className="text-xs text-red-500">{validationErrors["header-paymentTerms"]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={headerResponse.additionalNotes}
                  onChange={(e) => handleHeaderChange("additionalNotes", e.target.value)}
                  placeholder="Enter any additional notes or comments about your bid response..."
                  rows={5}
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium mb-2">Note:</h3>
                <p className="text-sm text-gray-600">
                  You must still provide individual pricing for each item in the "Item-Level Response" tab. Header-level information applies to all items unless overridden at the item level.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
      </div>
    </div>
  );
}
