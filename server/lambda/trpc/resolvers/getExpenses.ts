const AWS = require("aws-sdk");
import {
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });

export const getExpenses = async () => {
  const params = {
    TableName: process.env.TABLE_NAME,
  };

  try {
    const data = await client.send(new ScanCommand(params));
    console.log("Success", data);
    if(!data.Items) {
      return [];
    }
    const expenses = data.Items.map((item) => {
      return {
        id: item.id.S,
        amount: item.amount.N,
        description: item.description.S,
        date: item.date.S,
      };
    });
    return expenses;
  } catch (err) {
    console.log("Error", err);
    return null;
  }
};
