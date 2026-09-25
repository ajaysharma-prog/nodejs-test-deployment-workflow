output "dynamodb_table_name" {
  description = "The name of the created DynamoDB table"
  value       = module.dynamoDB_tables.table_name
}

output "dynamodb_table_arn" {
  description = "The ARN of the created DynamoDB table"
  value       = module.dynamoDB_tables.table_arn
}

output "dynamodb_gsi_arns" {
  description = "Map of Global Secondary Index names and their corresponding ARNs"
  value       = module.dynamoDB_tables.global_secondary_index_arns
}

output "iam_role_name" {
  description = "The name of the created IAM role"
  value       = module.register_user_iam_role.role_name
}

output "iam_role_arn" {
  description = "The ARN of the created IAM role"
  value       = module.register_user_iam_role.role_arn
}

output "iam_custom_policy_arns" {
  description = "Map of custom inline policy names to their generated AWS ARNs"
  value       = module.register_user_iam_role.custom_policy_arns
}

output "invoke_url" {
  description = "API Gateway invoke URL"
  value       = module.api_gateway.invoke_url
}
