import { type ClassValue, clsx } from "clsx";
import { addYears, subYears } from "date-fns";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const routeSearchSchema = z.object({
  page: z
    .union([z.string(), z.number(), z.undefined()])
    .default(1)
    .transform((val) => {
      if (val === undefined) return 1;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num) ? 1 : num;
    })
    .refine((val) => val > 0, { message: "Page must be greater than 0" }),
  limit: z
    .union([z.string(), z.number(), z.undefined()])
    .default(10)
    .transform((val) => {
      if (val === undefined) return 10;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num) ? 10 : num;
    })
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
  query: z
    .union([z.string(), z.undefined(), z.null()])
    .default("")
    .transform((val) => val ?? ""),
});

export const dashboardSchema = z.object({
  limit: z
    .union([z.string(), z.number(), z.undefined()])
    .default(10)
    .transform((val) => {
      if (val === undefined) return 10;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num) ? 10 : num;
    })
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
  page: z
    .union([z.string(), z.number(), z.undefined()])
    .default(1)
    .transform((val) => {
      if (val === undefined) return 1;
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num) ? 1 : num;
    })
    .refine((val) => val > 0, { message: "Page must be greater than 0" }),
  query: z
    .union([z.string(), z.undefined(), z.null()])
    .default("")
    .transform((val) => val ?? ""),
  year_from: z
    .union([z.string(), z.number(), z.undefined()])
    .default(new Date().getFullYear())
    .transform((val) => {
      if (val === undefined) return new Date().getFullYear();
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num) ? new Date().getFullYear() : num;
    })
    .refine((val) => val > 0, { message: "year_from must be greater than 0" }),
  year_to: z
    .union([z.string(), z.number(), z.undefined()])
    .default(new Date().getFullYear() + 1)
    .transform((val) => {
      if (val === undefined) return new Date().getFullYear();
      const num = typeof val === "string" ? Number(val) : val;
      return isNaN(num) ? new Date().getFullYear() : num;
    }),
});

export const KI_TYPES = [
  "Merek",
  "Paten",
  "Hak Cipta",
  "Indikasi Geografis",
  "DTLST",
  "Rahasia Dagang",
  "KI Komunal",
] as const;

const startYear = subYears(new Date(), 30).getFullYear();
const endYear = addYears(new Date(), 30).getFullYear();

export const years = Array.from(
  {
    length: endYear - startYear,
  },
  (_, i) => startYear + i
).map(String);
