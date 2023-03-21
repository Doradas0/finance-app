import { App, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaRestApi, CfnStage } from "aws-cdk-lib/aws-apigateway";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import path = require("path");
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";

export class FinanceAppStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const DB = new Table(this, "FinanceApp", {
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const Server = new NodejsFunction(this, "FinanceAppServer", {
      entry: path.join(__dirname, "..", "lambda", "trpc", "server.ts"),
      handler: "main",
      runtime: Runtime.NODEJS_18_X,
      logRetention: 1,
      tracing: Tracing.ACTIVE,
      environment: {
        TABLE_NAME: DB.tableName,
        POWERTOOLS_SERVICE_NAME: "FinanceApp",
      },
    });

    DB.grantReadWriteData(Server);

    const endpoint = new LambdaRestApi(this, "FinanceAppGateway", {
      handler: Server,
      proxy: false,
    });

    endpoint.root.addMethod("ANY");

    endpoint.root.addResource("{proxy+}").addMethod("ANY");

    endpoint.root.getResource("{proxy+}")?.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["*"],
    });

    const stage = endpoint.deploymentStage.node.defaultChild as CfnStage;
    stage.tracingEnabled = true;
    stage.accessLogSetting = {
      destinationArn: `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/apigateway/FinanceAppGateway`,
      format: JSON.stringify({
        requestId: "$context.requestId",
        ip: "$context.identity.sourceIp",
        caller: "$context.identity.caller",
        user: "$context.identity.user",
        requestTime: "$context.requestTime",
        httpMethod: "$context.httpMethod",
        resourcePath: "$context.resourcePath",
        status: "$context.status",
        protocol: "$context.protocol",
        responseLength: "$context.responseLength",
      }),
    };
  }
}
