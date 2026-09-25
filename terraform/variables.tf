///////////////////////////////////// DynamoDB //////////////////////////////////////////////////////

variable "project_name" {
  type        = string
  description = "Describe the name of the project"
  default     = "ticket-booking-system"
}

variable "environment" {
  type        = string
  description = "Type of environment of the project like prod or dev"
  default     = "dev"
}

variable "owner" {
  type        = string
  description = "Describe the owner of the resources"
  default     = "nodejs-dev-team"
}

variable "table_name" {
  type        = string
  description = "The base name of the DynamoDB table."
}

variable "hash_key" {
  type        = string
  default     = "id"
  description = "The name of the partition key."
}

variable "hash_key_type" {
  type        = string
  default     = "S"
  description = "The data type for the partition key."
}

variable "range_key" {
  type        = string
  default     = null
  description = "The name of the sort key for the main table, if applicable."
}

variable "range_key_type" {
  type        = string
  default     = null
  description = "The data type for the table sort key"
}

variable "local_secondary_indexes" {
  type = list(object({
    name               = string
    range_key          = string
    projection_type    = string
    non_key_attributes = optional(list(string), null)
  }))
  default     = []
  description = "A list of Local Secondary Indexes."
}

variable "global_secondary_indexes" {
  type = list(object({
    name               = string
    projection_type    = string
    non_key_attributes = optional(list(string), null)
    key_schema = list(object({
      attribute_name = string
      key_type       = string
    }))
  }))
  default     = []
  description = "A list of Global Secondary Indexes"
}

variable "additional_attributes" {
  description = "List of extra attributes required for indexes"
  type = list(object({
    name = string
    type = string
  }))
  default = []
}

variable "lambda_timeout" {
  type        = number
  default     = 30
  description = "The maximum amount of time (in seconds) that the Lambda function can run."
}

/////////////////////////////////////////////////////APIGATEWAY/////////////////////////////////////////////
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
}

variable "api_gateway_description" {
  description = "Description of the API Gateway"
  type        = string
  default     = null
}
