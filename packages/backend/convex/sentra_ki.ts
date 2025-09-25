import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";

export const getAllSentraKiPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("sentra_ki")
      .paginate(args.paginationOpts);

    const sentraKiWithFullData = await Promise.all(
      result.page.map(async (pks) => {
        const instansi = await ctx.db.get(pks.instansi_id);

        return {
          ...pks,
          instansi: instansi,
        };
      })
    );

    return {
      ...result,
      page: sentraKiWithFullData,
    };
  },
});

export const getAllSentraKi = query({
  args: {},
  handler: async (ctx) => {
    const pksRecords = await ctx.db.query("sentra_ki").collect();

    const sentraKiWithFullData = await Promise.all(
      pksRecords.map(async (pks) => {
        const instansi = await ctx.db.get(pks.instansi_id);

        return {
          ...pks,
          instansi: instansi,
        };
      })
    );

    return sentraKiWithFullData;
  },
});

async function generateCustomId(
  ctx: MutationCtx,
  prefix: string
): Promise<string> {
  // Get the latest record to determine the next number
  const latestRecord = await ctx.db
    .query("sentra_ki")
    .withIndex("by_custom_id") // You'll need to create this index
    .order("desc")
    .first();

  let nextNumber = 1;

  if (latestRecord && latestRecord.custom_id) {
    // Extract number from existing ID (e.g., "PKS-005" -> 5)
    const match = latestRecord.custom_id.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  // Dynamic padding based on current highest number
  const minDigits = Math.max(3, nextNumber.toString().length);
  const formattedNumber = nextNumber.toString().padStart(minDigits, "0");

  return `${prefix}-${formattedNumber}`;
}

export const createSentraKi = mutation({
  args: {
    name: v.string(),
    instansi_id: v.id("instansi"),
    address: v.string(),
    city: v.string(),
    latitude: v.string(),
    longitude: v.string(),
    pic_name: v.string(),
    pic_phone: v.string(),
    pic_email: v.string(),
    pic_id: v.string(),
  },
  handler: async (ctx, args) => {
    const instansi = await ctx.db.get(args.instansi_id);
    if (!instansi) {
      throw new Error("Referenced instansi does not exist");
    }

    const customId = await generateCustomId(ctx, "SKI");

    const sentraKiId = await ctx.db.insert("sentra_ki", {
      ...args,
      custom_id: customId,
    });
    return sentraKiId;
  },
});

export const updateSentraKi = mutation({
  args: {
    id: v.id("sentra_ki"),
    name: v.optional(v.string()),
    instansi_id: v.optional(v.id("instansi")),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    latitude: v.optional(v.string()),
    longitude: v.optional(v.string()),
    pic_name: v.optional(v.string()),
    pic_phone: v.optional(v.string()),
    pic_email: v.optional(v.string()),
    pic_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    if (updates.instansi_id) {
      const instansi = await ctx.db.get(updates.instansi_id);
      if (!instansi) {
        throw new Error("Referenced instansi does not exist");
      }
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

export const deleteSentraKi = mutation({
  args: {
    id: v.id("sentra_ki"),
  },
  handler: async (ctx, args) => {
    const referencingPks = await ctx.db
      .query("pks")
      .filter((q) => q.eq(q.field("sentra_ki_id"), args.id))
      .first();

    if (referencingPks) {
      throw new Error("Cannot delete sentra_ki: it has PKS records");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
