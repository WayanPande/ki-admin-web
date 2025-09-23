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
});
