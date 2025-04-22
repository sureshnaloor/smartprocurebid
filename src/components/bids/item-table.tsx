"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Save, X, FileUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CSVUploader } from "@/components/bids/csv-uploader";
import { BidItem } from "@/types";

interface ItemTableProps {
  items: BidItem[];
  setItems?: React.Dispatch<React.SetStateAction<BidItem[]>>;
  readOnly?: boolean;
}

export function ItemTable({ items, setItems, readOnly = false }: ItemTableProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<BidItem | null>(null);
  const [showCsvUploader, setShowCsvUploader] = useState(false);
  
  const handleEditItem = (item: BidItem) => {
    setEditedItem({ ...item });
    setIsEditing(item.id);
  };
  
  const handleUpdateItem = () => {
    if (!editedItem || !setItems) return;
    
    setItems(prevItems =>
      prevItems.map(item => (item.id === editedItem.id ? editedItem : item))
    );
    
    setIsEditing(null);
    setEditedItem(null);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditedItem(null);
  };
  
  const handleDeleteItem = (id: string) => {
    if (!setItems) return;
    
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const handleAddItem = () => {
    if (!setItems) return;
    
    const newItem: BidItem = {
      id: `item_${Date.now()}`,
      materialCode: "",
      description: "",
      quantity: 1,
      uom: "ea",
      packaging: "",
      remarks: "",
    };
    
    setItems(prevItems => [...prevItems, newItem]);
    setEditedItem(newItem);
    setIsEditing(newItem.id);
  };
  
  const handleItemChange = (field: keyof BidItem, value: string | number) => {
    if (!editedItem) return;
    
    setEditedItem({
      ...editedItem,
      [field]: value,
    });
  };
  
  const handleItemsLoaded = (newItems: BidItem[]) => {
    if (!setItems) return;
    
    // Add IDs to items if they don't have them
    const itemsWithIds = newItems.map(item => ({
      ...item,
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setItems(prevItems => [...prevItems, ...itemsWithIds]);
    setShowCsvUploader(false);
  };

  return (
    <div className="space-y-4">
      {showCsvUploader ? (
        <>
          <CSVUploader onItemsLoaded={handleItemsLoaded} />
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowCsvUploader(false)}
              className="mt-2"
            >
              <X className="mr-2 h-4 w-4" /> Cancel CSV Upload
            </Button>
          </div>
        </>
      ) : (
        <>
          {!readOnly && (
            <div className="flex justify-between mb-4">
              <Button onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
              <Button variant="outline" onClick={() => setShowCsvUploader(true)}>
                <FileUp className="mr-2 h-4 w-4" /> Upload CSV
              </Button>
            </div>
          )}
          
          <Card>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead>Packaging</TableHead>
                    <TableHead>Remarks</TableHead>
                    {!readOnly && <TableHead className="w-24">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={readOnly ? 6 : 7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-sm text-muted-foreground mb-2">No items added yet</p>
                          {!readOnly && (
                            <Button variant="outline" size="sm" onClick={handleAddItem}>
                              <Plus className="mr-2 h-4 w-4" /> Add your first item
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map(item => (
                      <TableRow key={item.id}>
                        {isEditing === item.id ? (
                          // Editing mode
                          <>
                            <TableCell>
                              <Input
                                value={editedItem?.materialCode || ""}
                                onChange={(e) => handleItemChange("materialCode", e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                value={editedItem?.description || ""}
                                onChange={(e) => handleItemChange("description", e.target.value)}
                                className="w-full"
                                rows={2}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={editedItem?.quantity || ""}
                                onChange={(e) => handleItemChange("quantity", Number(e.target.value))}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editedItem?.uom || "ea"}
                                onValueChange={(value) => handleItemChange("uom", value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ea">ea</SelectItem>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="g">g</SelectItem>
                                  <SelectItem value="l">l</SelectItem>
                                  <SelectItem value="ml">ml</SelectItem>
                                  <SelectItem value="m">m</SelectItem>
                                  <SelectItem value="cm">cm</SelectItem>
                                  <SelectItem value="box">box</SelectItem>
                                  <SelectItem value="pcs">pcs</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editedItem?.packaging || ""}
                                onChange={(e) => handleItemChange("packaging", e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editedItem?.remarks || ""}
                                onChange={(e) => handleItemChange("remarks", e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" onClick={handleUpdateItem}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          // View mode
                          <>
                            <TableCell>{item.materialCode}</TableCell>
                            <TableCell>
                              <div className="max-w-xs break-words">{item.description}</div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.uom}</TableCell>
                            <TableCell>{item.packaging}</TableCell>
                            <TableCell>{item.remarks}</TableCell>
                            {!readOnly && (
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditItem(item)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
