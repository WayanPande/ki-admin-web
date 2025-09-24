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
    name_sentra_ki: v.string(),
    name_pks: v.string(),
    no_pks: v.string(),
    description: v.optional(v.string()),
    document: v.optional(v.string()),
    expiry_date_from: v.string(),
    expiry_date_to: v.string(),
    name_instansi: v.string(),
  }),
});
