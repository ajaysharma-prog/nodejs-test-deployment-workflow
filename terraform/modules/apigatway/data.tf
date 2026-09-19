data "aws_api_gateway_resource" "root" {
  rest_api_id = aws_api_gateway_rest_api.event_management_system_api_gateway.id
  path        = "/"
}

data "aws_region" "current" {}
