import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1"
});

const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: true, 
    removeUndefinedValues: true,
  },
});

export { dynamoDb };
