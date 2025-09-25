import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  instansi: defineTable({
    name: v.string(),
    type: v.string(),
  }),
  pks: defineTable({
    name: v.string(),
    no: v.string(),
    description: v.optional(v.string()),
    document: v.optional(v.string()),
    expiry_date_from: v.string(),
    expiry_date_to: v.string(),
    sentra_ki_id: v.id("sentra_ki"),
  }).index("by_custom_id", ["no"]),
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
  }).index("by_custom_id", ["custom_id"]),
});
