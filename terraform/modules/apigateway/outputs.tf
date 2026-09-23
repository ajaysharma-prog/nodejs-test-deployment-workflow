output "rest_api_id" {
  description = "The ID of the REST API"
  value       = aws_api_gateway_rest_api.event_management_system_api_gateway.id
}

output "invoke_url" {
  description = "The URL to invoke the API endpoints"
  value       = "https://${aws_api_gateway_rest_api.event_management_system_api_gateway.id}.execute-api.${var.aws_region}://${aws_api_gateway_stage.this.stage_name}"
}
