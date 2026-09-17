variable "environment" {
  type        = string
  default     = "dev"
  description = "The target deployment environment name."
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

variable "aws_encryption_key_arn" {
  type = string
  description = "Encryption key to encrypt data"
}

variable "local_secondary_indexes" {
  type = list(object({
    name            = string
    range_key       = string
    projection_type = string
    non_key_attributes  = optional(list(string), null)
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
