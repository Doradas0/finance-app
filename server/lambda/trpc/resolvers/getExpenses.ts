const AWS = require("aws-sdk");
import {
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });

type ExpenseItem = {
  value: number;
  description: string;
  date: string;
};


export const getExpenses = async () => {
  const id = AWS.util.uuid.v4();
  const params = {
    TableName: process.env.TABLE_NAME,
  };

  try {
    const data = await client.send(new ScanCommand(params));
    console.log("Success", data);
    return data.Items;;
  } catch (err) {
    console.log("Error", err);
    return null;
  }
};
