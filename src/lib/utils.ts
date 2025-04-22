import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";
import { BidItem } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function parseCSV(csvText: string): Promise<BidItem[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Map CSV rows to BidItem format
          const items: BidItem[] = results.data
            .filter(row => {
              // Basic validation: require at least materialCode and description
              const r = row as Record<string, string>;
              return (
                r.materialCode || r.material_code || r["material code"] || r.code || r.sku
              ) && (
                r.description || r.desc || r.name || r.item || r.product
              );
            })
            .map(row => {
              const r = row as Record<string, string>;
              
              // Try to map CSV columns to BidItem fields
              // Handle different possible CSV header names
              const materialCode = r.materialCode || r.material_code || r["material code"] || r.code || r.sku || "";
              const description = r.description || r.desc || r.name || r.item || r.product || "";
              const quantity = parseInt(r.quantity || r.qty || r.amount || "1", 10);
              const uom = r.uom || r.unit || r["unit of measure"] || r.measure || "ea";
              const packaging = r.packaging || r.package || r.packing || "";
              const remarks = r.remarks || r.notes || r.comment || r.comments || "";
              
              return {
                id: uuidv4(),
                materialCode,
                description,
                quantity: isNaN(quantity) ? 1 : quantity,
                uom,
                packaging,
                remarks,
              };
            });
          
          resolve(items);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function createPaginationArray(
  currentPage: number,
  totalPages: number
): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, -1, totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
}
