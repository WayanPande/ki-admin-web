import { query } from "./_generated/server";

export const getAllUser = query({
  handler: async (ctx) => {
    return await ctx.db.query("user").collect();
  },
});
