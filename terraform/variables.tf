variable "project_name" {
  type        = string
  description = "Describe the name of the project"
  default     = "ticket-booking-system"
}

variable "environment" {
  type        = string
  description = "Type of eniroment of the project like prod or dev"
  default     = "dev"
}

variable "owner" {
  type        = string
  description = "Describe the owner of the resources"
  default     = "nodejs-dev-team"
}

variable "dynamodb_tables" {
  description = "Map of DynamoDB tables to be created"
  type = map(object({
    hash_key       = string
    hash_key_type  = string
    range_key      = optional(string, null)
    range_key_type = optional(string, null)
    additional_attributes = optional(list(object({
      name = string
      type = string
    })), [])
    local_secondary_indexes = optional(list(any), [])
    global_secondary_indexes = optional(list(object({
      name               = string
      projection_type    = string
      non_key_attributes = list(string)
      key_schema = list(object({
        attribute_name = string
        key_type       = string
      }))
    })), [])
  }))
}
