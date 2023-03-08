const AWS = require("aws-sdk");
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { IncomeItem } from "../../../../types";

const client = new DynamoDBClient({ region: "eu-west-1" });

export const createIncome = async (income: IncomeItem) => {
  const id = AWS.util.uuid.v4();
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: { S: `Income#${id}` },
      SK: { S: `Income#${id}` },
      id: { S: id },
      amount: { N: income.amount.toString() },
      description: { S: income.description },
      date: { S: income.date },
      category: { S: income.category },
    },
  };
  try {
    const data = await client.send(new PutItemCommand(params));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.log("Error", err);
    return null;
  }
};
