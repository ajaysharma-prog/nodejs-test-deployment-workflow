output "table_name" {
  description = "The name of the DynamoDB table"
  value       = aws_dynamodb_table.main_table.name
}

output "table_arn" {
  description = "The ARN of the DynamoDB table"
  value       = aws_dynamodb_table.main_table.arn
}

output "global_secondary_index_arns" {
  description = "Map of GSI names and their corresponding ARNs"
  value = {
    for gsi in var.global_secondary_indexes : gsi.name => "${aws_dynamodb_table.main_table.arn}/index/${gsi.name}"
  }
}
