import { type PaginationResult, paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getAllInformasiKiPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    let result: PaginationResult<Doc<"informasi_ki">>;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();

      result = await ctx.db
        .query("informasi_ki")
        .withSearchIndex("informasi_ki_name", (q) =>
          q.search("name", searchLower)
        )
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db.query("informasi_ki").paginate(args.paginationOpts);
    }

    return result;
  },
});

export const getAllInformasiKi = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();

      return await ctx.db
        .query("informasi_ki")
        .withSearchIndex("informasi_ki_name", (q) =>
          q.search("name", searchLower)
        )
        .collect();
    } else {
      return await ctx.db.query("instansi").collect();
    }
  },
});

export const createInformasiKi = mutation({
  args: {
    name: v.string(),
    date: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const instansiId = await ctx.db.insert("informasi_ki", args);
    return instansiId;
  },
});

export const updateInformasiKi = mutation({
  args: {
    id: v.id("informasi_ki"),
    date: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
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

export const deleteInformasiKi = mutation({
  args: {
    id: v.id("informasi_ki"),
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
