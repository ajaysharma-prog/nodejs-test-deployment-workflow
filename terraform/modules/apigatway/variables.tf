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
