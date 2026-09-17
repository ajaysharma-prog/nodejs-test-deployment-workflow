output "dynamodb_table_names" {
  description = "Map of all created DynamoDB table names"
  value       = { for k, v in module.dynamoDB_tables : k => v.table_name }
}

output "dynamodb_table_arns" {
  description = "Map of all created DynamoDB table ARNs"
  value       = { for k, v in module.dynamoDB_tables : k => v.table_arn }
}
