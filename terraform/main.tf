module "dynamoDB_tables" {
  source                   = "./modules/dynamoDB"
  table_name               = var.table_name
  environment              = var.environment
  hash_key                 = var.hash_key
  hash_key_type            = var.hash_key_type
  range_key                = var.range_key
  range_key_type           = var.range_key_type
  additional_attributes    = var.additional_attributes
  local_secondary_indexes  = var.local_secondary_indexes
  global_secondary_indexes = var.global_secondary_indexes
  aws_encryption_key_arn   = data.aws_kms_alias.dynamodb.arn
}

module "register_user_iam_role" {
  source             = "./modules/iam"
  role_name          = "register-user-lambda-role"
  assume_role_policy = file("${path.root}/policies/trust-policy.json")
  custom_policies = {
    dynamodb-access = templatefile("${path.root}/policies/dynamodb-register-user.json", {
      table_arn = module.dynamoDB_tables.table_arn
      gsi_arn   = module.dynamoDB_tables.global_secondary_index_arns["GSI1"]
    })
  }
  managed_policy_arns = []
}

module "register_user_lambda_function" {
  source            = "./modules/lambda"
  handler_file_name = "registerUser"
  iam_role_arn      = module.register_user_iam_role.role_arn
  function_name     = "register_user_lambda_function"
  environment_variables = {
    USER_TABLE_NAME       = module.dynamoDB_tables.table_name
    USER_EMAIL_INDEX_NAME = "GSI1"
  }

}

module "api_gateway" {
  source     = "./modules/apigatway"
  api_name   = "${var.project_name}-api"
  stage_name = var.environment
  resources  = var.resources
  routes     = var.routes
  lambda_functions = {
    "register_user_lambda" = {
      function_name = module.register_user_lambda_function.function_name
      invoke_arn    = module.register_user_lambda_function.invoke_arn
    }
  }
}
