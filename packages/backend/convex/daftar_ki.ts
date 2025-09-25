import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllDaftarKiPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("daftar_ki").paginate(args.paginationOpts);
  },
});

export const getAllDaftarKi = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("daftar_ki").collect();
  },
});

export const createDaftarKi = mutation({
  args: {
    nomor_permohonan: v.string(),
    name: v.string(),
    type: v.string(),
    sub_type: v.string(),
    name_pemilik: v.string(),
    address_pemilik: v.string(),
    pemberi_fasilitas: v.string(),
    document: v.string(),
    pic_name: v.string(),
    pic_phone: v.string(),
    pic_email: v.string(),
    pic_id: v.string(),
  },
  handler: async (ctx, args) => {
    const daftar_kiId = await ctx.db.insert("daftar_ki", args);
    return daftar_kiId;
  },
});

export const updateDaftarKi = mutation({
  args: {
    id: v.id("daftar_ki"),
    nomor_permohonan: v.string(),
    name: v.string(),
    type: v.string(),
    sub_type: v.string(),
    name_pemilik: v.string(),
    address_pemilik: v.string(),
    pemberi_fasilitas: v.string(),
    document: v.string(),
    pic_name: v.string(),
    pic_phone: v.string(),
    pic_email: v.string(),
    pic_id: v.string(),
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

export const deleteDaftarKi = mutation({
  args: {
    id: v.id("daftar_ki"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
