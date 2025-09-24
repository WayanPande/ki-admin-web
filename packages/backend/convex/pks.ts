import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllPksPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("pks").paginate(args.paginationOpts);
  },
});

export const getAllPks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pks").collect();
  },
});

export const createPks = mutation({
  args: {
    name_sentra_ki: v.string(),
    name_pks: v.string(),
    no_pks: v.string(),
    description: v.optional(v.string()),
    document: v.optional(v.string()),
    expiry_date_from: v.string(),
    expiry_date_to: v.string(),
    name_instansi: v.string(),
  },
  handler: async (ctx, args) => {
    const newData = await ctx.db.insert("pks", {
      name_sentra_ki: args.name_sentra_ki,
      name_pks: args.name_pks,
      no_pks: args.no_pks,
      description: args.description,
      document: args.document,
      expiry_date_from: args.expiry_date_from,
      expiry_date_to: args.expiry_date_to,
      name_instansi: args.name_instansi,
    });
    return await ctx.db.get(newData);
  },
});

export const updatePks = mutation({
  args: {
    id: v.id("pks"),
    name_sentra_ki: v.optional(v.string()),
    name_pks: v.optional(v.string()),
    no_pks: v.optional(v.string()),
    description: v.optional(v.string()),
    document: v.optional(v.string()),
    expiry_date_from: v.optional(v.string()),
    expiry_date_to: v.optional(v.string()),
    name_instansi: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name_sentra_ki: args.name_sentra_ki,
      name_pks: args.name_pks,
      no_pks: args.no_pks,
      description: args.description,
      document: args.document,
      expiry_date_from: args.expiry_date_from,
      expiry_date_to: args.expiry_date_to,
      name_instansi: args.name_instansi,
    });
    return { success: true };
  },
});

export const deletePks = mutation({
  args: {
    id: v.id("pks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
