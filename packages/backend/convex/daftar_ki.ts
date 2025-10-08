import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllDaftarKiPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let result;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();

      result = await ctx.db
        .query("daftar_ki")
        .withSearchIndex("name_ki", (q) => q.search("name", searchLower))
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db.query("daftar_ki").paginate(args.paginationOpts);
    }

    const daftarKiWithFullData = await Promise.all(
      result.page.map(async (daftarKi) => {
        const document_url = daftarKi.document
          ? await ctx.storage.getUrl(daftarKi.document)
          : null;

        return {
          ...daftarKi,
          document_url,
        };
      })
    );

    return {
      ...result,
      page: daftarKiWithFullData,
    };
  },
});

export const getAllDaftarKi = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let result;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();

      result = await ctx.db
        .query("daftar_ki")
        .withSearchIndex("name_ki", (q) => q.search("name", searchLower))
        .collect();
    } else {
      result = await ctx.db.query("daftar_ki").collect();
    }

    return result;
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
  args: {
    year: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<KiTypeCounts> => {
    const allRecords = await ctx.db.query("daftar_ki").collect();

    const records = allRecords.filter((record) => {
      if (!record.registration_date) return false;

      const [month, day, year] = record.registration_date
        .split("/")
        .map(Number);
      return year === args.year;
    });

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
    year: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<ChartDataByType[]> => {
    const allRecords = await ctx.db.query("daftar_ki").collect();

    const records = allRecords.filter((record) => {
      if (!record.registration_date) return false;

      const [month, day, year] = record.registration_date
        .split("/")
        .map(Number);
      return year === args.year;
    });

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
      const [month, day, year] = record.registration_date
        .split("/")
        .map(Number);
      const monthIndex = month - 1;

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
    document: v.optional(v.id("_storage")),
    pic_name: v.string(),
    pic_phone: v.string(),
    pic_email: v.string(),
    pic_id: v.string(),
    registration_date: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

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
    document: v.optional(v.id("_storage")),
    pic_name: v.optional(v.string()),
    pic_phone: v.optional(v.string()),
    pic_email: v.optional(v.string()),
    pic_id: v.optional(v.string()),
    registration_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const daftarKi = await ctx.db.get(id);
    if (
      daftarKi &&
      daftarKi.document &&
      updates.document &&
      updates.document !== daftarKi.document
    ) {
      await ctx.storage.delete(daftarKi.document);
    }

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

export const deleteDaftarKi = mutation({
  args: {
    id: v.id("daftar_ki"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const daftarKi = await ctx.db.get(args.id);
    if (daftarKi?.document) {
      await ctx.storage.delete(daftarKi.document);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
