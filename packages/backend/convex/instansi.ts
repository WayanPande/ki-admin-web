import { paginationOptsValidator } from "convex/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllInstansi = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("instansi").paginate(args.paginationOpts);
  },
});

export const createInstansi = mutation({
  args: {
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const newData = await ctx.db.insert("instansi", {
      name: args.name,
      type: args.type,
    });
    return await ctx.db.get(newData);
  },
});

export const toggle = mutation({
  args: {
    id: v.id("instansi"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { name: args.name, type: args.type });
    return { success: true };
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id("instansi"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
