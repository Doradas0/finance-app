import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { getExpenses } from "./resolvers/getExpenses";
import { createExpense } from "./resolvers/createExpense";
import { z } from "zod";
import { incomeRouter } from "./routers/income";

import {
  CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler,
} from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEvent } from "aws-lambda";

export const t = initTRPC.create();

const expenseInput = z.object({
  amount: z.number(),
  description: z.string(),
  date: z.string(),
  category: z.string(),
});

const appRouter = t.router({
  createExpense: t.procedure.input(expenseInput).mutation(async ({ input }) => {
    console.log("createExpense", input);
    return createExpense(input);
  }),
  getExpenses: t.procedure.query(async () => {
    console.log("getExpenses");
    return await getExpenses();
  }),
  income: incomeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

// created for each request
const createContext = ({
  event,
  context,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEvent>) => {
  console.log("createContext", event, context);
  return {};
};

export type Context = inferAsyncReturnType<typeof createContext>;

export const main = async (event: APIGatewayProxyEvent, context: any) => {
  const handler = awsLambdaRequestHandler({
    router: appRouter,
    createContext,
  });
  const result = await handler(event, context);
  console.log("result", result);
  result.headers = {
    ...result.headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  return result;
};
