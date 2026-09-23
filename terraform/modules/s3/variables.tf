variable "bucket_name" {
  description = "The globally unique name of the S3 bucket."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "force_destroy" {
  description = "Indicates that bucket is deleted when it have objects"
  type        = bool
  default     = false
}

variable "versioning_enabled" {
  description = "Enable versioning of bucket."
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "The ARN of the KMS encryption key."
  type        = string
  default     = null
}

variable "tags" {
  description = "A map of custom additional tags."
  type        = map(string)
  default     = {}
}

variable "enable_lifecycle_archival" {
  description = "Enable or disable automatic cost-saving."
  type        = bool
  default     = true
}

variable "lifecycle_filter_prefix" {
  description = "Object key prefix path pattern to apply the archival lifecycle rules."
  type        = string
  default     = ""
}
