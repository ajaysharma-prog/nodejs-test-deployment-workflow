variable "role_name" {
  type        = string
  description = "The unique string identity identifier name of the IAM target role."
}

variable "assume_role_policy" {
  type        = string
  description = "The computed execution trust relationship policy configuration passed as a string text stream."
}

variable "custom_policies" {
  type        = map(string)
  default     = {}
  description = "A standard key-value map linking inline resource profile identity policies directly to their JSON body text strings."
}

variable "managed_policy_arns" {
  type        = list(string)
  default     = []
  description = "An array collection listing specific static standard AWS managed policies ARNs."
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
