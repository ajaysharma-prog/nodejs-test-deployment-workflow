terraform {
  required_version = "~> 1.15.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Project     = var.project_name
      environment = var.environment
      ManagedBy   = "Terraform"
      owner       = var.owner
    }
  }
}
