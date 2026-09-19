output "role_name" {
  value       = aws_iam_role.this.name
  description = "The name of the created IAM role"
}

output "role_arn" {
  value       = aws_iam_role.this.arn
  description = "The ARN of the created IAM role"
}

output "custom_policy_arns" {
  value = {
    for name, policy in aws_iam_policy.custom : name => policy.arn
  }
  description = "Map of custom inline policy names to their generated AWS ARNs"
}
