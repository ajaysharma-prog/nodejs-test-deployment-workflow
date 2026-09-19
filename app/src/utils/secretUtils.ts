import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { ResponseMessage } from "../constant/ResponseMessage";

const ssmClient = new SSMClient({});
let cachedSecret: string | undefined;

export async function getSecret(parameterName: string) :  Promise<string>{

    if(cachedSecret){
        return cachedSecret;
    }
    const command = new GetParameterCommand({
        Name : parameterName,
        WithDecryption: true
    });

    const response = await ssmClient.send(command);
    const secret = response.Parameter?.Value;

    if(secret == null){
        throw new Error(ResponseMessage.SSM_PARAMETER_NOT_FOUND);
    }
    cachedSecret = secret;
    return secret;
}
