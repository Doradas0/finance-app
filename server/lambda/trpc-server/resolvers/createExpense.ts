const AWS = require("aws-sdk");
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });

type ExpenseItem = {
  value: number;
  description: string;
  date: string;
};


export const saveNoteToDB = async (expenseItem: ExpenseItem) => {
  const id = AWS.util.uuid.v4();
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: { S: `Expense#${id}` },
      SK: { S: `Expense#${id}` },
      value: { N: expenseItem.value.toString() },
      description: { S: expenseItem.description },
      date: { S: expenseItem.date },
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
};
