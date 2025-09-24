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
  }),
  sentra_ki: defineTable({
    name: v.string(),
    instansi_id: v.id("instansi"),
    address: v.string(),
    city: v.string(),
    latitude: v.string(),
    longitude: v.string(),
  }),
});
