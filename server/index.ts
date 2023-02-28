import * as cdk from "aws-cdk-lib";
import { FinanceAppStack } from "./stacks/finance-app-stack";

const app = new cdk.App();
new FinanceAppStack(app, "FinanceAppStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
