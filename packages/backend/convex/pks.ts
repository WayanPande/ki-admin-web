import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";

export const getAllPksPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let result;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase();

      result = await ctx.db
        .query("pks")
        .withSearchIndex("pks_number", (q) => q.search("no", searchLower))
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db.query("pks").paginate(args.paginationOpts);
    }

    const pksWithFullData = await Promise.all(
      result.page.map(async (pks) => {
        const sentraKi = await ctx.db.get(pks.sentra_ki_id);
        const instansi = sentraKi
          ? await ctx.db.get(sentraKi.instansi_id)
          : null;

        const document_url = pks.document
          ? await ctx.storage.getUrl(pks.document)
          : null;

        return {
          ...pks,
          sentra_ki: sentraKi,
          instansi: instansi,
          document_url,
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
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let result;

    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchTerm = args.searchTerm;

      result = await ctx.db
        .query("pks")
        .withSearchIndex("pks_number", (q) => q.search("no", searchTerm))
        .collect();
    } else {
      result = await ctx.db.query("pks").collect();
    }

    return result;
  },
});

async function generateCustomId(
  ctx: MutationCtx,
  prefix: string
): Promise<string> {
  const user = await ctx.auth.getUserIdentity();
  if (user === null) {
    throw new Error("Unauthorized");
  }

  // Get the latest record to determine the next number
  const latestRecord = await ctx.db
    .query("pks")
    .withIndex("by_custom_id") // You'll need to create this index
    .order("desc")
    .first();

  let nextNumber = 1;

  if (latestRecord && latestRecord.no) {
    // Extract number from existing ID (e.g., "PKS-005" -> 5)
    const match = latestRecord.no.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  // Dynamic padding based on current highest number
  const minDigits = Math.max(3, nextNumber.toString().length);
  const formattedNumber = nextNumber.toString().padStart(minDigits, "0");

  return `${prefix}-${formattedNumber}`;
}

export const createPks = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    document: v.optional(v.id("_storage")),
    expiry_date_from: v.string(),
    expiry_date_to: v.string(),
    sentra_ki_id: v.id("sentra_ki"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const sentraKi = await ctx.db.get(args.sentra_ki_id);
    if (!sentraKi) {
      throw new Error("Referenced sentra_ki does not exist");
    }

    const customId = await generateCustomId(ctx, "PKS");

    const pksId = await ctx.db.insert("pks", {
      ...args,
      no: customId,
    });
    return pksId;
  },
});

export const updatePks = mutation({
  args: {
    id: v.id("pks"),
    name_sentra_ki: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    document: v.optional(v.id("_storage")),
    expiry_date_from: v.optional(v.string()),
    expiry_date_to: v.optional(v.string()),
    sentra_ki_id: v.optional(v.id("sentra_ki")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

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

    const pks = await ctx.db.get(id);
    if (
      pks &&
      pks.document &&
      updates.document &&
      updates.document !== pks.document
    ) {
      await ctx.storage.delete(pks.document);
    }

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

export const deletePks = mutation({
  args: {
    id: v.id("pks"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }

    const pks = await ctx.db.get(args.id);
    if (pks?.document) {
      await ctx.storage.delete(pks.document);
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
