import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import {
  CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler,
} from "@trpc/server/adapters/aws-lambda";
import { Tracer } from "@aws-lambda-powertools/tracer";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from "aws-lambda";
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

const ZTransactionInput = z.object({
  amount: z.string(),
  description: z.string(),
  date: z.string(),
  account: z.string(),
  category: z.string(),
  type: z.string(),
});

const ZTransaction = ZTransactionInput.extend({
  id: z.string(),
});

const ZDB_TransactionItem = ZTransaction.extend({
  PK: z.string(),
  SK: z.string(),
});

const ZDB_TransactionParams = z.object({
  TableName: z.string(),
  Item: ZDB_TransactionItem,
});

type DB_TransactionParams = z.infer<typeof ZDB_TransactionParams>;
type Transaction = z.infer<typeof ZTransaction>;

export const t = initTRPC.create();

const transactionRouter = t.router({
  createTransaction: t.procedure
    .input(ZTransactionInput)
    .mutation(async ({ input }) => {
      const id = uuid();
      const params: DB_TransactionParams = {
        TableName: process.env.TABLE_NAME as string,
        Item: {
          PK: "User#1234",
          SK: `Transaction#${id}`,
          id: id,
          description: input.description,
          category: input.category,
          type: input.type,
          account: input.account,
          amount: input.amount,
          date: input.date,
        },
      };
      try {
        await client.send(new PutCommand(params));
        return id;
      } catch (err) {
        console.error(err);
        throw new Error("Error creating transaction");
      }
    }),

  listTransactions: t.procedure
    .input(z.undefined())
    .output(z.array(ZTransaction).nullish())
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
        tracer.putMetadata("dynamodb response", data);
        const items = data.Items?.map((item): Transaction => {
          return {
            id: item.id,
            amount: item.amount,
            description: item.description,
            date: item.date,
            category: item.category,
            type: item.type,
            account: item.account,
          };
        });
        return items;
      } catch (err) {
        console.error(err);
        throw new Error("Error fetching transactions");
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
        console.error(err);
        throw new Error("Error deleting transaction");
      }
    }),

  updateTransaction: t.procedure
    .input(ZTransaction)
    .mutation(async ({ input }) => {
      const params: DB_TransactionParams = {
        TableName: process.env.TABLE_NAME as string,
        Item: {
          PK: "User#1234",
          SK: `Transaction#${input.id}`,
          id: input.id,
          description: input.description,
          category: input.category,
          type: input.type,
          account: input.account,
          amount: input.amount,
          date: input.date,
        },
      };
      try {
        await client.send(new PutCommand(params));
        return input;
      } catch (err) {
        console.error(err);
        throw new Error("Error updating transaction");
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

const tracer = new Tracer();
tracer.captureAWSv3Client(client);

export const main = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  // Get facade segment created by Lambda
  const segment = tracer.getSegment();
  // Create subsegment for the function and set it as active
  const handlerSegment = segment.addNewSubsegment(`## ${process.env._HANDLER}`);
  tracer.setSegment(handlerSegment);
  tracer.annotateColdStart();
  tracer.addServiceNameAnnotation();

  tracer.putAnnotation("awsRequestId", context.awsRequestId);
  tracer.putAnnotation("path", event.path);

  const handler = awsLambdaRequestHandler({
    router: appRouter,
    createContext,
  });

  let result: APIGatewayProxyResult;
  try {
    result = await handler(event, context);
    result.headers = {
      ...result.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    };

    return result;
  } catch (err) {
    throw err;
  } finally {
    handlerSegment.close();
    tracer.setSegment(segment);
  }
};
