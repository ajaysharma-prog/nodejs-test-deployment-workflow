locals {
  api_paths = {
    for route_key, route_val in var.routes : "/${route_val.resource_path}" => {
      lower(route_val.http_method) = {
        produces = ["application/json"]
        responses = {
          "200" = { description = "Success" }
        }
        
        security = route_val.authorization != "NONE" ? [{ jwtLambdaAuthorizer = [] }] : []

        x-amazon-apigateway-integration = {
          uri                 = var.lambda_functions[route_val.lambda_key].invoke_arn
          responses           = { default = { statusCode = "200" } }
          type                = var.integration_type
          httpMethod          = "POST"
          passthroughBehavior = var.passthrough_behavior
          contentHandling     = var.content_handling
        }
      }
    }
  }
}
