resource "aws_api_gateway_rest_api" "event_management_system_api_gateway" {
  name        = var.api_name
  description = var.description

  body = jsonencode({
    openapi = "3.0.1"
    info = {
      title   = var.api_name
      version = "1.0.0"
    }
    paths = {
      for route_key, route_val in var.routes : "/${route_val.resource_path}" => {
        x-amazon-apigateway-any-method = {
          produces = ["application/json"]
          responses = {
            "200" = {
              description = "Success"
            }
          }
          x-amazon-apigateway-integration = {
            uri                 = var.lambda_functions[route_val.lambda_key].invoke_arn
            responses           = { default = { statusCode = "200" } }
            passthroughBehavior = "when_no_match"
            httpMethod          = "POST"
            contentHandling     = "CONVERT_TO_TEXT"
            type                = "aws_proxy"
          }
        }
      }
    }
  })

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${var.api_name}-rest-api"
  }
}

resource "aws_lambda_permission" "api_gateway" {
  for_each      = var.routes
  statement_id  = "AllowApiGateway-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_functions[each.value.lambda_key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.event_management_system_api_gateway.execution_arn}/*"
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.event_management_system_api_gateway.id

  triggers = {
    redeployment = sha1(aws_api_gateway_rest_api.event_management_system_api_gateway.body)
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "this" {
  rest_api_id   = aws_api_gateway_rest_api.event_management_system_api_gateway.id
  deployment_id = aws_api_gateway_deployment.this.id
  stage_name    = var.stage_name

  tags = {
    Name = "${var.api_name}-${var.stage_name}-stage"
  }
}
