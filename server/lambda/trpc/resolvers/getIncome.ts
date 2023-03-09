const AWS = require("aws-sdk");
import {
  DynamoDBClient,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-1" });

export const getIncome = async () => {
  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": { S: "User#1234" },
      ":sk": { S: "Income#" },
    },
  };

  try {
    const data = await client.send(new QueryCommand(params));
    console.log("Success", data);
    if(!data.Items) {
      return [];
    }
    const expenses = data.Items.map((item) => {
      return {
        id: item.id.S,
        amount: item.amount?.N,
        description: item.description?.S,
        date: item.date?.S,
        category: item.category?.S,
      };
    });
    return expenses;
  } catch (err) {
    console.log("Error", err);
    return null;
  }
};

