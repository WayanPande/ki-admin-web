import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllPksPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("pks").paginate(args.paginationOpts);

    const pksWithFullData = await Promise.all(
      result.page.map(async (pks) => {
        const sentraKi = await ctx.db.get(pks.sentra_ki_id);
        const instansi = sentraKi
          ? await ctx.db.get(sentraKi.instansi_id)
          : null;

        return {
          ...pks,
          sentra_ki: sentraKi,
          instansi: instansi,
        };
      })
    );

    return {
      ...result,
      page: pksWithFullData,
    };
  },
});

export const getAllPks = query({
  args: {},
  handler: async (ctx) => {
    const pksRecords = await ctx.db.query("pks").collect();

    const pksWithFullData = await Promise.all(
      pksRecords.map(async (pks) => {
        const sentraKi = await ctx.db.get(pks.sentra_ki_id);
        const instansi = sentraKi
          ? await ctx.db.get(sentraKi.instansi_id)
          : null;

        return {
          ...pks,
          sentra_ki: sentraKi,
          instansi: instansi,
        };
      })
    );

    return pksWithFullData;
  },
});

export const createPks = mutation({
  args: {
    name: v.string(),
    no: v.string(),
    description: v.optional(v.string()),
    document: v.optional(v.string()),
    expiry_date_from: v.string(),
    expiry_date_to: v.string(),
    sentra_ki_id: v.id("sentra_ki"),
  },
  handler: async (ctx, args) => {
    const sentraKi = await ctx.db.get(args.sentra_ki_id);
    if (!sentraKi) {
      throw new Error("Referenced sentra_ki does not exist");
    }

    const pksId = await ctx.db.insert("pks", args);
    return pksId;
  },
});

export const updatePks = mutation({
  args: {
    id: v.id("pks"),
    name_sentra_ki: v.optional(v.string()),
    name: v.optional(v.string()),
    no: v.optional(v.string()),
    description: v.optional(v.string()),
    document: v.optional(v.string()),
    expiry_date_from: v.optional(v.string()),
    expiry_date_to: v.optional(v.string()),
    sentra_ki_id: v.optional(v.id("sentra_ki")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    if (updates.sentra_ki_id) {
      const sentraKi = await ctx.db.get(updates.sentra_ki_id);
      if (!sentraKi) {
        throw new Error("Referenced sentra_ki does not exist");
      }
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    return id;
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
