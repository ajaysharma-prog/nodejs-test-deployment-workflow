locals {
  api_paths = {
    for route_key, route_val in var.routes : "/${route_val.resource_path}" => {
      x-amazon-apigateway-any-method = {
        produces = ["application/json"]
        responses = {
          "200" = { description = "Success" }
        }
        x-amazon-apigateway-integration = {
          uri                 = var.lambda_functions[route_val.lambda_key].invoke_arn
          responses           = { default = { statusCode = "200" } }
          type                = var.integration_type
          httpMethod          = var.integration_http_method
          passthroughBehavior = var.passthrough_behavior
          contentHandling     = var.content_handling
        }
      }
    }
  }
}
