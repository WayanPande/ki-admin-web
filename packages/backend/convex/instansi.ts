import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllInstansiPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    let result;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();

      result = await ctx.db
        .query("instansi")
        .withSearchIndex("instansi_name", (q) => q.search("name", searchLower))
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db.query("instansi").paginate(args.paginationOpts);
    }

    return result;
  },
});

export const getAllInstansi = query({
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
        .query("instansi")
        .withSearchIndex("instansi_name", (q) => q.search("name", searchTerm))
        .collect();
    } else {
      return await ctx.db.query("instansi").collect();
    }
  },
});

export const createInstansi = mutation({
  args: {
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const instansiId = await ctx.db.insert("instansi", {
      name: args.name,
      type: args.type,
    });
    return instansiId;
  },
});

export const updateInstansi = mutation({
  args: {
    id: v.id("instansi"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
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

export const deleteInstansi = mutation({
  args: {
    id: v.id("instansi"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const referencingSentraKi = await ctx.db
      .query("sentra_ki")
      .filter((q) => q.eq(q.field("instansi_id"), args.id))
      .first();

    if (referencingSentraKi) {
      throw new Error("Cannot delete instansi: it has sentra_ki records");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
