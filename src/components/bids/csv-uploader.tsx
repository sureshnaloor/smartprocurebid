"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BidItem } from "@/types";
import { parseCSV } from "@/lib/utils";

interface CSVUploaderProps {
  onItemsLoaded: (items: BidItem[]) => void;
}

export function CSVUploader({ onItemsLoaded }: CSVUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported");
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 100);

    try {
      // Read the file
      const text = await file.text();
      
      // Parse CSV
      const items = await parseCSV(text);
      
      // Complete the progress simulation
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (items.length === 0) {
        setError("No valid items found in the CSV file");
      } else {
        setSuccess(`Successfully loaded ${items.length} items`);
        onItemsLoaded(items);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError("Failed to process CSV file. Please check the format.");
      console.error("CSV processing error:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (!error) setUploadProgress(0);
      }, 1000);
    }
  };

  const handleReset = () => {
    setFileName(null);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-4">
          {!fileName ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">Upload CSV File</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Upload a CSV file with your bid items. The file should include columns for material code, description, quantity, and unit of measure.
                </p>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label 
                  htmlFor="csv-upload" 
                  className="cursor-pointer flex flex-col items-center gap-1 border-2 border-dashed border-gray-300 rounded-md p-6 hover:border-primary/50 transition-colors"
                >
                  <FileText className="h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium">Click to select a CSV file</span>
                  <span className="text-xs text-muted-foreground">or drag and drop</span>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{fileName}</p>
                    {isLoading && <p className="text-xs text-muted-foreground">Processing file...</p>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} disabled={isLoading}>
                  Change
                </Button>
              </div>

              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="w-full h-2" />
              )}
            </div>
          )}

          {fileName && (
            <div className="text-xs text-muted-foreground">
              {success 
                ? "Upload complete! You can now review the items below."
                : error 
                  ? "Please try with a different file or check the format."
                  : "Processing your file..."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
