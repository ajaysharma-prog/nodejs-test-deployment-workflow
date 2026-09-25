variable "handler_file_name" {
  type        = string
  description = "Name of the handler file"
}

variable "iam_role_arn" {
  description = " IAM role that the Lambda function assumes when it executes."
  type        = string
}

variable "function_name" {
  description = "The unique name of the AWS Lambda function being deployed."
  type        = string
}


variable "environment_variables" {
  type        = map(string)
  description = "A map of environment variables to pass to the Lambda function"
  default     = {}
}
