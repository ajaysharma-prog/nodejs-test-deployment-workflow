import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { ResponseMessage } from "../constants/response-message";
import { ApiError } from "./api-error";

const ssmClient = new SSMClient({});

export async function getSecret(parameterName: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: true,
  });

  const response = await ssmClient.send(command);
  const secret = response.Parameter?.Value;

  if (secret == null) {
    throw new ApiError(404, ResponseMessage.SSM_PARAMETER_NOT_FOUND);
  }
  return secret;
}
