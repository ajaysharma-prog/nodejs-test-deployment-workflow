data "aws_kms_alias" "dynamodb" {
  name = "alias/aws/dynamodb"
}

data "aws_ssm_parameter" "jwt_secret" {

  name            = "/myapp/${var.environment}/JWT_SECRET_KEY"
  with_decryption = false
}

data "aws_region" "current" {
}
