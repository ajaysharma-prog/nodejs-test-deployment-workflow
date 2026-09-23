variable "api_name" {
  description = "Name of the API Gateway REST API"
  type        = string
}

variable "description" {
  description = "Description of the API Gateway"
  type        = string
  default     = null
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
}

variable "resources" {
  description = "API Gateway resources"

  type = map(object({
    path_part   = string
    parent_path = string
  }))
}

variable "routes" {
  description = "API Gateway routes"

  type = map(object({
    resource_path = string
    http_method   = string
    lambda_key    = string

    authorization = optional(string, "NONE")
  }))

  validation {
    condition = alltrue([
      for route in values(var.routes) :
      contains(
        ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
        upper(route.http_method)
      )
    ])

    error_message = "Invalid HTTP method."
  }
}

variable "lambda_functions" {
  description = "Lambda functions used by API Gateway"

  type = map(object({
    function_name = string
    invoke_arn    = string
  }))
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "A mapping of resource tags."
}

variable "environment" {
  type        = string
  description = "Type of environment of the project like prod or dev"
  default     = "dev"
}

variable "passthrough_behavior" {
  type        = string
  default     = "when_no_match"
  description = "Fallback data body matching behaviors."
}

variable "content_handling" {
  type        = string
  default     = "CONVERT_TO_TEXT"
  description = "Controls incoming payload data formatting conversions before hit execution."
}

variable "authorizer_lambda_invoke_arn" {
  type        = string
  description = "Authorizer lambda invoke arn"
}

variable "authorizer_lambda_name" {
  type        = string
  description = "Authorizer Lambda name"
}
