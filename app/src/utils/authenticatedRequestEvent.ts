import { APIGatewayProxyEvent } from "aws-lambda";
import { AuthorizerContext } from "../dto/request/AuthorizerContextDTO";

export interface AuthenticatedRequestEvent extends APIGatewayProxyEvent {
  requestContext: APIGatewayProxyEvent['requestContext'] & {authorizer: AuthorizerContext;  };
}
