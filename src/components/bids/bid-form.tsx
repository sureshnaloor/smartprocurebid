"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BidFormProps {
  bidDetails: {
    title: string;
    description: string;
    dueDate: Date;
    requirements: {
      tier: string;
      materialClass: string;
      location: string;
      minBidAmount: number;
    };
  };
  setBidDetails: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    dueDate: Date;
    requirements: {
      tier: string;
      materialClass: string;
      location: string;
      minBidAmount: number;
    };
  }>>;
}

export function BidForm({ bidDetails, setBidDetails }: BidFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBidDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementChange = (name: string, value: string | number) => {
    setBidDetails(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [name]: value
      }
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue) || value === "") {
      handleRequirementChange(name, value === "" ? 0 : numValue);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Bid Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Supply of Raw Materials Q2 2023"
                value={bidDetails.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide detailed information about this bid request..."
                value={bidDetails.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker
                date={bidDetails.dueDate}
                setDate={(date) => {
                  if (date) {
                    setBidDetails(prev => ({ ...prev, dueDate: date }));
                  }
                }}
                minDate={new Date()}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vendor Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tier">Company Tier</Label>
              <Select
                value={bidDetails.requirements.tier}
                onValueChange={(value) => handleRequirementChange("tier", value)}
              >
                <SelectTrigger id="tier">
                  <SelectValue placeholder="Select tier requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="tier1">Tier 1 Only</SelectItem>
                  <SelectItem value="tier2">Tier 2 or Above</SelectItem>
                  <SelectItem value="tier3">Tier 3 or Above</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="materialClass">Material Class</Label>
              <Select
                value={bidDetails.requirements.materialClass}
                onValueChange={(value) => handleRequirementChange("materialClass", value)}
              >
                <SelectTrigger id="materialClass">
                  <SelectValue placeholder="Select material class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="raw">Raw Materials</SelectItem>
                  <SelectItem value="components">Components</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="chemicals">Chemicals</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={bidDetails.requirements.location}
                onValueChange={(value) => handleRequirementChange("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="domestic">Domestic Only</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="minBidAmount">Minimum Bid Amount ($)</Label>
              <Input
                id="minBidAmount"
                name="minBidAmount"
                type="number"
                min="0"
                placeholder="0.00"
                value={bidDetails.requirements.minBidAmount.toString()}
                onChange={handleNumberChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
