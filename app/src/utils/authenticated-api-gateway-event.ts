import { APIGatewayProxyEvent } from "aws-lambda";

export interface AuthorizerContext {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequestEvent extends APIGatewayProxyEvent {
  requestContext: APIGatewayProxyEvent["requestContext"] & {
    authorizer: AuthorizerContext;
  };
}
