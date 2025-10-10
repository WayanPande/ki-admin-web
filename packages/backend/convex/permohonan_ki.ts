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
        .withSearchIndex("search_date", (q) => q.search("date", searchLower))
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db
        .query("permohonan_ki")
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

    const instansiId = await ctx.db.insert("permohonan_ki", args);
    return instansiId;
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
