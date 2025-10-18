import { type PaginationResult, paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getAllPermohonanKiPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    let result: PaginationResult<Doc<"permohonan_ki">>;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();

      result = await ctx.db
        .query("permohonan_ki")
        .withSearchIndex("search_date", (q) =>
          q.search("date", searchLower).eq("userId", user.subject)
        )
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db
        .query("permohonan_ki")
        .withIndex("by_user", (q) => q.eq("userId", user.subject))
        .paginate(args.paginationOpts);
    }

    return result;
  },
});

export const getAllPermohonanKi = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchTerm = args.searchTerm;

      return await ctx.db
        .query("permohonan_ki")
        .withSearchIndex("search_date", (q) => q.search("date", searchTerm))
        .collect();
    } else {
      return await ctx.db.query("instansi").collect();
    }
  },
});

interface KiTypeCounts {
  merek: number;
  paten: number;
  hakCipta: number;
  indikasiGeografis: number;
  dtlst: number;
  rahasiaDagang: number;
  desainIndustri: number;
  kiKomunal: number;
  total: number;
}

export const getPermohonanKiTypeCounts = query({
  args: {
    year: v.optional(v.number()),
    from: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<KiTypeCounts> => {
    const user = await ctx.auth.getUserIdentity();

    let allRecords: Doc<"permohonan_ki">[];

    if (user && !args.from) {
      allRecords = await ctx.db
        .query("permohonan_ki")
        .withIndex("by_user", (q) => q.eq("userId", user.subject))
        .collect();
    } else {
      allRecords = await ctx.db.query("permohonan_ki").collect();
    }

    const records = allRecords.filter((record) => {
      if (!record.date) return false;

      const year = new Date(record.date).getFullYear();
      return year === args.year;
    });

    const counts: KiTypeCounts = {
      merek: 0,
      paten: 0,
      hakCipta: 0,
      indikasiGeografis: 0,
      dtlst: 0,
      rahasiaDagang: 0,
      desainIndustri: 0,
      kiKomunal: 0,
      total: 0,
    };

    records.forEach((record) => {
      if (record.merek) {
        counts.merek += record.merek;
        counts.total += record.merek;
      }

      if (record.paten) {
        counts.paten += record.paten;
        counts.total += record.paten;
      }

      if (record.hak_cipta) {
        counts.hakCipta += record.hak_cipta;
        counts.total += record.hak_cipta;
      }

      if (record.indikasi_geografis) {
        counts.indikasiGeografis += record.indikasi_geografis;
        counts.total += record.indikasi_geografis;
      }

      if (record.dtlst) {
        counts.dtlst += record.dtlst;
        counts.total += record.dtlst;
      }

      if (record.rahasia_dagang) {
        counts.rahasiaDagang += record.rahasia_dagang;
        counts.total += record.rahasia_dagang;
      }

      if (record.ki_komunal) {
        counts.kiKomunal += record.ki_komunal;
        counts.total += record.ki_komunal;
      }

      if (record.desain_industri) {
        counts.desainIndustri += record.desain_industri;
        counts.total += record.desain_industri;
      }
    });

    return counts;
  },
});

interface ChartDataByType {
  month: string;
  totalYearFrom: number;
  totalYearTo: number;
  [key: string]: number | string;
}

export const getPermohonanKiChartData = query({
  args: {
    year_from: v.optional(v.number()),
    year_to: v.optional(v.number()),
    from: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ChartDataByType[]> => {
    const user = await ctx.auth.getUserIdentity();

    let allRecords: Doc<"permohonan_ki">[];

    if (user && !args.from) {
      allRecords = await ctx.db
        .query("permohonan_ki")
        .withIndex("by_user", (q) => q.eq("userId", user.subject))
        .collect();
    } else {
      allRecords = await ctx.db.query("permohonan_ki").collect();
    }

    const records_year_from = allRecords.filter((record) => {
      if (!record.date) return false;

      const year = new Date(record.date).getFullYear();
      return year === args.year_from;
    });

    const records_year_to = allRecords.filter((record) => {
      if (!record.date) return false;

      const year = new Date(record.date).getFullYear();
      return year === args.year_to;
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
      const monthData: ChartDataByType = {
        month,
        totalYearFrom: 0,
        totalYearTo: 0,
      };
      return monthData;
    });

    records_year_from.forEach((record) => {
      const monthIndex = new Date(record.date).getMonth();

      monthlyData[monthIndex].totalYearFrom +=
        record.desain_industri +
        record.dtlst +
        record.hak_cipta +
        record.indikasi_geografis +
        record.merek +
        record.paten +
        record.rahasia_dagang +
        record.ki_komunal;
    });

    records_year_to.forEach((record) => {
      const monthIndex = new Date(record.date).getMonth() + 1;
      monthlyData[monthIndex].totalYearTo +=
        record.desain_industri +
        record.dtlst +
        record.hak_cipta +
        record.indikasi_geografis +
        record.merek +
        record.paten +
        record.rahasia_dagang +
        record.ki_komunal;
    });

    return monthlyData;
  },
});

export const createPermohonanKi = mutation({
  args: {
    date: v.string(),
    merek: v.number(),
    paten: v.number(),
    hak_cipta: v.number(),
    indikasi_geografis: v.number(),
    dtlst: v.number(),
    rahasia_dagang: v.number(),
    desain_industri: v.number(),
    ki_komunal: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const similarRecordDate = await ctx.db
      .query("permohonan_ki")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (similarRecordDate) {
      throw new Error("Cannot create permohonan_ki: duplicate date");
    }

    const permohonanKi = await ctx.db.insert("permohonan_ki", {
      ...args,
      userId: user.subject,
    });
    return permohonanKi;
  },
});

export const updatePermohonanKi = mutation({
  args: {
    id: v.id("permohonan_ki"),
    date: v.optional(v.string()),
    merek: v.optional(v.number()),
    paten: v.optional(v.number()),
    hak_cipta: v.optional(v.number()),
    indikasi_geografis: v.optional(v.number()),
    dtlst: v.optional(v.number()),
    rahasia_dagang: v.optional(v.number()),
    desain_industri: v.optional(v.number()),
    ki_komunal: v.optional(v.number()),
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

    if (cleanUpdates.date) {
      const similarRecordDate = await ctx.db
        .query("permohonan_ki")
        .withIndex("by_date", (q) => q.eq("date", cleanUpdates.date as string))
        .first();

      const selectedData = await ctx.db
        .query("permohonan_ki")
        .withIndex("by_id", (q) => q.eq("_id", id))
        .first();

      if (similarRecordDate?._id !== selectedData?._id) {
        throw new Error("Cannot create permohonan_ki: duplicate date");
      }
    }

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

export const deletePermohonanKi = mutation({
  args: {
    id: v.id("permohonan_ki"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
