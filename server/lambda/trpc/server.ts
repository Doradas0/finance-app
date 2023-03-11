import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import {
  CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler,
} from "@trpc/server/adapters/aws-lambda";

import { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";

const AWS = require("aws-sdk");
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });

export const t = initTRPC.create();

const helloRouter = t.router({
  hello: t.procedure.query(() => {
    return "Hello World";
  }),
});

const transactionRouter = t.router({
  createTransaction: t.procedure
    .input(
      z.object({
        amount: z.number(),
        description: z.string(),
        date: z.string(),
        category: z.string(),
        type: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const id = AWS.util.uuid.v4();
      const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: { S: "User#1234" },
          SK: { S: `Transaction#{id}` },
          id: { S: id },
          amount: { N: input.amount.toString() },
          description: { S: input.description },
          date: { S: input.date },
          category: { S: input.category },
          type: { S: input.type },
        },
      };
      try {
        const data = await client.send(new PutItemCommand(params));
        console.log("Success", data);
        return id;
      } catch (err) {
        console.log("Error", err);
        return null;
      }
    }),
  listTransactions: t.procedure.query(async () => {
    const params = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: "User#1234" },
      },
    };
    try {
      const data = await client.send(new QueryCommand(params));
      console.log("Success", data);
      return data;
    } catch (err) {
      console.log("Error", err);
      return null;
    }
  }),
});

const appRouter = t.mergeRouters(helloRouter, transactionRouter);

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
