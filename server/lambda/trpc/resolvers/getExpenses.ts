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

  const exampleData = {
    Items: [
      {
        PK: { S: "Expense#1" },
        SK: { S: "Expense#1" },
        value: { N: "1" },
        description: { S: "test" },
        date: { S: "2023-03-10" },
      },
      {
        PK: { S: "Expense#2" },
        SK: { S: "Expense#2" },
        value: { N: "2" },
        description: { S: "test2" },
        date: { S: "2023-03-10" },
      }
    ]
  };
  try {
    const data = await client.send(new ScanCommand(params));
    console.log("Success", data);
    if(!data.Items) {
      return exampleData.Items;
    }
    return data.Items;;
  } catch (err) {
    console.log("Error", err);
    return null;
  }
};
