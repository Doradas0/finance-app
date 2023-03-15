import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import {
  CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler,
} from "@trpc/server/adapters/aws-lambda";

import { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";
import { uuid } from "uuidv4";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const database = new DynamoDBClient({ region: "eu-west-1" });
const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: true, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: true, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: true, // false, by default.
};
const client = DynamoDBDocumentClient.from(database, {
  marshallOptions,
  unmarshallOptions,
});

export const t = initTRPC.create();

const transactionRouter = t.router({
  createTransaction: t.procedure
    .input(
      z.object({
        amount: z.string(),
        description: z.string(),
        date: z.string(),
        category: z.string(),
        type: z.string(),
        recurring: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuid();
      const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: "User#1234",
          SK: `Transaction#${id}`,
          id: id,
          amount: input.amount,
          description: input.description,
          date: input.date,
          category: input.category,
          type: input.type,
          recurring: input.recurring,
        },
      };
      try {
        await client.send(new PutCommand(params));
        return id;
      } catch (err) {
        return null;
      }
    }),

  listTransactions: t.procedure
    .input(z.undefined())
    .output(
      z
        .array(
          z.object({
            id: z.string(),
            amount: z.string(),
            description: z.string(),
            date: z.string(),
            category: z.string(),
            type: z.string(),
            recurring: z.boolean(),
          })
        )
        .nullish()
    )
    .query(async () => {
      const params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": "User#1234",
        },
      };
      try {
        const data = await client.send(new QueryCommand(params));
        const items = data.Items?.map((item) => {
          return {
            id: item.id,
            amount: item.amount,
            description: item.description,
            date: item.date,
            category: item.category,
            type: item.type,
            recurring: item.recurring,
          };
        });
        return items;
      } catch (err) {
        return null;
      }
    }),

  deleteTransaction: t.procedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: "User#1234",
          SK: `Transaction#${input}`,
        },
      };
      try {
        await client.send(new DeleteCommand(params));
        return input;
      } catch (err) {
        return null;
      }
    }),
});

const appRouter = t.mergeRouters(transactionRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

// created for each request
const createContext =
  ({}: CreateAWSLambdaContextOptions<APIGatewayProxyEvent>) => {
    return {};
  };

export type Context = inferAsyncReturnType<typeof createContext>;

export const main = async (event: APIGatewayProxyEvent, context: any) => {
  const handler = awsLambdaRequestHandler({
    router: appRouter,
    createContext,
  });
  const result = await handler(event, context);
  result.headers = {
    ...result.headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  return result;
};
