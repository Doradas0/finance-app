const AWS = require("aws-sdk");
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ExpenseItem } from "../../../../types";

const client = new DynamoDBClient({ region: "eu-west-1" });

export const createExpense = async (expenseItem: ExpenseItem) => {
  const id = AWS.util.uuid.v4();
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: { S: "User#1234" },
      SK: { S: `Expense#${id}` },
      id: { S: id },
      amount: { N: expenseItem.amount.toString() },
      description: { S: expenseItem.description },
      date: { S: expenseItem.date },
      category: { S: expenseItem.category },
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
