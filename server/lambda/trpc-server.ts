import { inferAsyncReturnType, initTRPC } from "@trpc/server";
// import { z } from "zod";

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

////save note to dynamodb using doc client
////table name is in env var
////uuid is generated in the lambda using aws
//const AWS = require("aws-sdk");
//import {
//  DynamoDBClient,
//  PutItemCommand,
//  ScanCommand,
//} from "@aws-sdk/client-dynamodb";

//const client = new DynamoDBClient({ region: "eu-west-1" });

//const saveNoteToDB = async (note: string) => {
//  const id = AWS.util.uuid.v4();
//  const params = {
//    TableName: process.env.TABLE_NAME,
//    Item: {
//      PK: { S: `NOTE#${id}` },
//      SK: { S: `NOTE#${id}` },
//      note: { S: note },
//    },
//  };
//  try {
//    const data = await client.send(new PutItemCommand(params));
//    console.log("Success", data);
//    return id;
//  } catch (err) {
//    console.log("Error", err);
//    return null;
//  }
//};

//const getAllNotes = async () => {
//  const params = {
//    TableName: process.env.TABLE_NAME,
//  };
//  try {
//    const data = await client.send(new ScanCommand(params));
//    console.log("Success", data);
//    return data.Items;
//  } catch (err) {
//    console.log("Error", err);
//    throw new Error("Failed to get notes from DB");
//  }
//};
