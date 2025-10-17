import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  instansi: defineTable({
    name: v.string(),
    type: v.string(),
  }).searchIndex("instansi_name", {
    searchField: "name",
  }),
  pks: defineTable({
    no: v.string(),
    description: v.optional(v.string()),
    document: v.optional(v.id("_storage")),
    expiry_date_from: v.string(),
    expiry_date_to: v.string(),
    sentra_ki_id: v.id("sentra_ki"),
  })
    .index("by_custom_id", ["no"])
    .index("by_sentra_ki_id", ["sentra_ki_id"])
    .searchIndex("pks_number", {
      searchField: "no",
    }),
  sentra_ki: defineTable({
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
    custom_id: v.string(),
  })
    .index("by_custom_id", ["custom_id"])
    .searchIndex("search_name", {
      searchField: "name",
    }),
  daftar_ki: defineTable({
    nomor_permohonan: v.string(),
    name: v.string(),
    type: v.string(),
    sub_type: v.optional(v.string()),
    name_pemilik: v.string(),
    address_pemilik: v.string(),
    pemberi_fasilitas: v.string(),
    document: v.optional(v.id("_storage")),
    pic_name: v.string(),
    pic_phone: v.string(),
    pic_email: v.string(),
    pic_id: v.string(),
    registration_date: v.string(),
  }).searchIndex("name_ki", {
    searchField: "name",
  }),
  permohonan_ki: defineTable({
    date: v.string(),
    merek: v.number(),
    paten: v.number(),
    hak_cipta: v.number(),
    indikasi_geografis: v.number(),
    dtlst: v.number(),
    rahasia_dagang: v.number(),
    desain_industri: v.number(),
    ki_komunal: v.number(),
    userId: v.string(),
  })
    .searchIndex("search_date", {
      searchField: "date",
      filterFields: ["userId"],
    })
    .index("by_date", ["date"])
    .index("by_user", ["userId"]),
  informasi_ki: defineTable({
    name: v.string(),
    date: v.string(),
    description: v.string(),
    userId: v.string(),
  })
    .searchIndex("informasi_ki_name", {
      searchField: "name",
      filterFields: ["userId"],
    })
    .index("by_user", ["userId"]),
});
