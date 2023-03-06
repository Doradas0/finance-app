import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { getExpenses } from "./resolvers/getExpenses";
import { createExpense } from "./resolvers/createExpense";
import { z } from "zod";

import {
  CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler,
} from "@trpc/server/adapters/aws-lambda";
import { APIGatewayProxyEvent } from "aws-lambda";

export const t = initTRPC.create();

const appRouter = t.router({
  hello: t.procedure.query((req) => {
    console.log("hello, REQ", req);
    return "Hello World!";
  }),
  createExpense: t.procedure
    .input(
      z.object({
        value: z.number(),
        description: z.string(),
        date: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("createExpense", input);
      return createExpense(input);
    }),
  getExpenses: t.procedure.query(async () => {
    console.log("getExpenses");
    const expenses = await getExpenses();
    console.log("getExpenses", expenses);
    return expenses;
  }),
  // greet: t.procedure
  //   .input(z.object({ name: z.string() }))
  //   .query(({ input }) => {
  //     return `Hello ${input.name}!`;
  //   }),
  // saveNote: t.procedure
  //   .input(z.object({ note: z.string() }))
  //   .mutation(async ({ input }) => {
  //     // save to db
  //     const id = await saveNoteToDB(input.note);
  //     if (!id) {
  //       throw new Error("Failed to save note");
  //     }
  //     return id;
  //   }),
  // listNotes: t.procedure.query(async () => {
  //   return await getAllNotes();
  // }),
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
