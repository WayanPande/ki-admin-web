import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllInstansiPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("instansi").paginate(args.paginationOpts);
  },
});

export const getAllInstansi = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("instansi").collect();
  },
});

export const createInstansi = mutation({
  args: {
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
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
