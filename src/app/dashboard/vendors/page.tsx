"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getVendors, addVendor } from "@/lib/db";
import { Vendor } from "@/types";
import { UsersRound, Plus, Search, Filter, X } from "lucide-react";

export default function VendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newVendor, setNewVendor] = useState({
    companyName: "",
    email: "",
    contactName: "",
    phone: "",
    tier: "tier1",
    location: "",
    materialClasses: [] as string[],
  });
  
  const [materialClassInput, setMaterialClassInput] = useState("");

  useEffect(() => {
    async function loadVendors() {
      try {
        if (user) {
          const allVendors = await getVendors();
          setVendors(allVendors);
        }
      } catch (error) {
        console.error("Failed to load vendors:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadVendors();
  }, [user]);

  const filteredVendors = vendors.filter(vendor => {
    // Filter by search query
    const matchesSearch = 
      vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.contactName && vendor.contactName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by tier
    const matchesTier = tierFilter === "all" || vendor.tier === tierFilter;
    
    // Filter by location
    const matchesLocation = locationFilter === "all" || vendor.location === locationFilter;
    
    return matchesSearch && matchesTier && matchesLocation;
  });

  // Get unique locations for the filter
  const locations = [...new Set(vendors.map(v => v.location))].filter((location): location is string => location !== undefined);

  const handleAddMaterialClass = () => {
    if (materialClassInput.trim()) {
      setNewVendor(prev => ({
        ...prev,
        materialClasses: [...prev.materialClasses, materialClassInput.trim()]
      }));
      setMaterialClassInput("");
    }
  };

  const handleRemoveMaterialClass = (indexToRemove: number) => {
    setNewVendor(prev => ({
      ...prev,
      materialClasses: prev.materialClasses.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleAddVendor = async () => {
    try {
      if (!user) return;
      
      const vendor = await addVendor({
        ...newVendor,
        buyerId: user.id,
      });
      
      // Update local state
      setVendors([...vendors, vendor]);
      
      // Reset form
      setNewVendor({
        companyName: "",
        email: "",
        contactName: "",
        phone: "",
        tier: "tier1",
        location: "",
        materialClasses: [],
      });
      setMaterialClassInput("");
      
      setShowAddDialog(false);
    } catch (error) {
      console.error("Failed to add vendor:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVendor(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewVendor(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <UsersRound className="mr-2 h-6 w-6" />
            <h1 className="text-3xl font-bold">Vendors</h1>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Enter the vendor details below
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="companyName" className="text-right text-sm font-medium">
                    Company Name
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={newVendor.companyName}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newVendor.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="contactName" className="text-right text-sm font-medium">
                    Contact Name
                  </label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={newVendor.contactName}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="phone" className="text-right text-sm font-medium">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newVendor.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="tier" className="text-right text-sm font-medium">
                    Tier
                  </label>
                  <Select
                    value={newVendor.tier}
                    onValueChange={(value) => handleSelectChange("tier", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier1">Tier 1</SelectItem>
                      <SelectItem value="tier2">Tier 2</SelectItem>
                      <SelectItem value="tier3">Tier 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="location" className="text-right text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={newVendor.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="materialClass" className="text-right text-sm font-medium">
                    Material Classes
                  </label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="materialClass"
                      value={materialClassInput}
                      onChange={(e) => setMaterialClassInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMaterialClass();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMaterialClass}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                {newVendor.materialClasses.length > 0 && (
                  <div className="col-span-4 flex flex-wrap gap-2">
                    {newVendor.materialClasses.map((materialClass, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                      >
                        <span>{materialClass}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterialClass(index)}
                          className="ml-1 text-primary hover:text-primary/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddVendor}
                  disabled={
                    !newVendor.companyName ||
                    !newVendor.email
                  }
                >
                  Add Vendor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="absolute right-3 top-3"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={tierFilter}
                  onValueChange={setTierFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="tier1">Tier 1</SelectItem>
                    <SelectItem value="tier2">Tier 2</SelectItem>
                    <SelectItem value="tier3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading vendors...</p>
          </div>
        ) : filteredVendors.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Material Class</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        <div>{vendor.companyName}</div>
                        <div className="text-sm text-gray-500">{vendor.email}</div>
                      </TableCell>
                      <TableCell>
                        {vendor.contactName && (
                          <>
                            <div>{vendor.contactName}</div>
                            {vendor.phone && <div className="text-sm text-gray-500">{vendor.phone}</div>}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {vendor.tier === "tier1" ? "Tier 1" : 
                           vendor.tier === "tier2" ? "Tier 2" : "Tier 3"}
                        </span>
                      </TableCell>
                      <TableCell>{vendor.location || "-"}</TableCell>
                      <TableCell>
                        {vendor.materialClasses && vendor.materialClasses.length > 0 
                          ? (
                            <div className="flex flex-wrap gap-1">
                              {vendor.materialClasses.map(mc => (
                                <span 
                                  key={mc.id} 
                                  className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                                >
                                  {mc.materialClass}
                                </span>
                              ))}
                            </div>
                          )
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <UsersRound className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No vendors found</h3>
              <p className="text-gray-500 text-center mb-6">
                {searchQuery || tierFilter !== "all" || locationFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first vendor to get started"}
              </p>
              {searchQuery || tierFilter !== "all" || locationFilter !== "all" ? (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setTierFilter("all");
                  setLocationFilter("all");
                }}>
                  Clear Filters
                </Button>
              ) : (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Vendor</DialogTitle>
                      <DialogDescription>
                        Enter the vendor details below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="companyName" className="text-right text-sm font-medium">
                          Company Name
                        </label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={newVendor.companyName}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="email" className="text-right text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={newVendor.email}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="contactName" className="text-right text-sm font-medium">
                          Contact Name
                        </label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newVendor.contactName}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="phone" className="text-right text-sm font-medium">
                          Phone
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={newVendor.phone}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="tier" className="text-right text-sm font-medium">
                          Tier
                        </label>
                        <Select
                          value={newVendor.tier}
                          onValueChange={(value) => handleSelectChange("tier", value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tier1">Tier 1</SelectItem>
                            <SelectItem value="tier2">Tier 2</SelectItem>
                            <SelectItem value="tier3">Tier 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="location" className="text-right text-sm font-medium">
                          Location
                        </label>
                        <Input
                          id="location"
                          name="location"
                          value={newVendor.location}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="materialClass" className="text-right text-sm font-medium">
                          Material Classes
                        </label>
                        <div className="col-span-3 flex gap-2">
                          <Input
                            id="materialClass"
                            value={materialClassInput}
                            onChange={(e) => setMaterialClassInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddMaterialClass();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddMaterialClass}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      {newVendor.materialClasses.length > 0 && (
                        <div className="col-span-4 flex flex-wrap gap-2">
                          {newVendor.materialClasses.map((materialClass, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                            >
                              <span>{materialClass}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterialClass(index)}
                                className="ml-1 text-primary hover:text-primary/80"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddVendor}
                        disabled={
                          !newVendor.companyName ||
                          !newVendor.email
                        }
                      >
                        Add Vendor
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
