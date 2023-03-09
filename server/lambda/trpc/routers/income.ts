import { t } from "../server";
import { z } from "zod";

import { createIncome } from "../resolvers/createIncome";
import { getIncome } from "../resolvers/getIncome";

export const incomeRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        amount: z.number(),
        description: z.string(),
        date: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("createIncome", input);
      return createIncome(input);
    }),
  get: t.procedure.query(async () => {
    console.log("getIncomes");
    return await getIncome();
  })
});

