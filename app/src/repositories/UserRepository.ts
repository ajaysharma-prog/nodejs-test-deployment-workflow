import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../config/dynamodb";
import { User } from "../models/User";

export async function findByEmail(email: string): Promise<User | null> {
    const result = await dynamoDb.send(
        new QueryCommand({
            TableName: process.env.USER_TABLE_NAME!,
            IndexName: process.env.USER_EMAIL_INDEX_NAME!,
            KeyConditionExpression: "GSI1PK = :email", 
            ExpressionAttributeValues: {
                ":email": `USER#${email}`
            },
            Limit: 1
        })
    );

    if (!result.Items || result.Items.length === 0) return null;
    return result.Items[0] as User;
}

export async function createUser(user: User): Promise<void> {
    const dbItem = {
      ...user,
      PK: `USER#${user.email}`,
      SK: "METADATA",
      GSI1PK: `USER#${user.email}`,
      GSI1SK: "METADATA"
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: process.env.USER_TABLE_NAME!,
        Item: dbItem,
        ConditionExpression: "attribute_not_exists(PK)" 
      })
    );
}
