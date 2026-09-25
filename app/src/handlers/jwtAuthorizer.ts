import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { jwtVerify } from 'jose';
import { getSecret } from '../utils/secretUtils';

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    if (!event.authorizationToken) {
      throw new Error('Unauthorized');
    }
    
    const token = event.authorizationToken.startsWith("Bearer ") ? event.authorizationToken.replace("Bearer ", ""): event.authorizationToken;

    const secretKey = await getSecret(`/myapp/${process.env.ENVIRONMENT || 'dev'}/JWT_SECRET_KEY`);
    const secret = new TextEncoder().encode(secretKey);
    
    const { payload } = await jwtVerify(token, secret);

    const methodArnTmp = event.methodArn.split(':');
    const apiGatewayArnTmp = methodArnTmp[5].split('/');
    const apiIdAndStage = `${apiGatewayArnTmp[0]}/${apiGatewayArnTmp[1]}`;
    const resourceArn = `${methodArnTmp[0]}:${methodArnTmp[1]}:${methodArnTmp[2]}:${methodArnTmp[3]}:${methodArnTmp[4]}:${apiIdAndStage}/*`;
    
    return {
      principalId: payload.sub || 'anonymous', 
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: resourceArn
          }
        ]
      },
      context: {
        userId: String(payload.sub || ''),
        email: String(payload.email || ''),
        role: String(payload.role || '')
      }
    };

  } catch (error) {
    console.error("Authentication Security Guard Validation Failed:", error);
    throw new Error('Unauthorized'); 
  }
};
