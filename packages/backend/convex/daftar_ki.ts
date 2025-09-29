import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllDaftarKiPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("daftar_ki").paginate(args.paginationOpts);
  },
});

interface KiTypeCounts {
  merek: number;
  paten: number;
  hakCipta: number;
  indikasiGeografis: number;
  dtsl: number;
  rahasiaDagang: number;
  kiKomunal: number;
  total: number;
}

export const getKiTypeCounts = query({
  args: {},
  handler: async (ctx): Promise<KiTypeCounts> => {
    const records = await ctx.db.query("daftar_ki").collect();

    const counts: KiTypeCounts = {
      merek: 0,
      paten: 0,
      hakCipta: 0,
      indikasiGeografis: 0,
      dtsl: 0,
      rahasiaDagang: 0,
      kiKomunal: 0,
      total: 0,
    };

    records.forEach((record) => {
      const recordType = record.type;

      switch (recordType) {
        case "Merek":
          counts.merek += 1;
          break;
        case "Paten":
          counts.paten += 1;
          break;
        case "Hak Cipta":
          counts.hakCipta += 1;
          break;
        case "Indikasi Geografis":
          counts.indikasiGeografis += 1;
          break;
        case "DTSL":
          counts.dtsl += 1;
          break;
        case "Rahasia Dagang":
          counts.rahasiaDagang += 1;
          break;
        case "KI Komunal":
          counts.kiKomunal += 1;
          break;
      }

      counts.total += 1;
    });

    return counts;
  },
});

export const KI_TYPES = [
  "Merek",
  "Paten",
  "Hak Cipta",
  "Indikasi Geografis",
  "DTSL",
  "Rahasia Dagang",
  "KI Komunal",
] as const;

interface ChartDataByType {
  month: string;
  total: number;
  [key: string]: number | string;
}

export const getChartDataByType = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args): Promise<ChartDataByType[]> => {
    const startDate = new Date(args.year, 0, 1).getTime();
    const endDate = new Date(args.year, 11, 31, 23, 59, 59, 999).getTime();

    const records = await ctx.db
      .query("daftar_ki")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startDate),
          q.lte(q.field("_creationTime"), endDate)
        )
      )
      .collect();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyData: ChartDataByType[] = monthNames.map((month) => {
      const monthData: ChartDataByType = { month, total: 0 };

      KI_TYPES.forEach((type) => {
        monthData[type] = 0;
      });

      return monthData;
    });

    records.forEach((record) => {
      const date = new Date(record._creationTime);
      const monthIndex = date.getMonth();
      const recordType = record.type;

      monthlyData[monthIndex].total += 1;

      if (KI_TYPES.includes(recordType as any)) {
        monthlyData[monthIndex][recordType] =
          (monthlyData[monthIndex][recordType] as number) + 1;
      }
    });

    return monthlyData;
  },
});

export const createDaftarKi = mutation({
  args: {
    nomor_permohonan: v.string(),
    name: v.string(),
    type: v.string(),
    sub_type: v.optional(v.string()),
    name_pemilik: v.string(),
    address_pemilik: v.string(),
    pemberi_fasilitas: v.string(),
    document: v.string(),
    pic_name: v.string(),
    pic_phone: v.string(),
    pic_email: v.string(),
    pic_id: v.string(),
    registration_date: v.string(),
  },
  handler: async (ctx, args) => {
    const daftar_kiId = await ctx.db.insert("daftar_ki", args);
    return daftar_kiId;
  },
});

export const updateDaftarKi = mutation({
  args: {
    id: v.id("daftar_ki"),
    nomor_permohonan: v.optional(v.string()),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    sub_type: v.optional(v.string()),
    name_pemilik: v.optional(v.string()),
    address_pemilik: v.optional(v.string()),
    pemberi_fasilitas: v.optional(v.string()),
    document: v.optional(v.string()),
    pic_name: v.optional(v.string()),
    pic_phone: v.optional(v.string()),
    pic_email: v.optional(v.string()),
    pic_id: v.optional(v.string()),
    registration_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

export const deleteDaftarKi = mutation({
  args: {
    id: v.id("daftar_ki"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
