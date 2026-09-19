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
  tags                     = {}
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
  environment         = var.environment
  tags                = {}
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
  environment    = var.environment
  tags           = {}
  lambda_timeout = var.lambda_timeout
}

module "login_user_iam_role" {
  source             = "./modules/iam"
  role_name          = "login-user-lambda-role"
  assume_role_policy = file("${path.root}/policies/trust-policy.json")
  custom_policies = {
    dynamodb-access = templatefile("${path.root}/policies/dynamodb-login-user.json", {
      gsi_arn = module.dynamoDB_tables.global_secondary_index_arns["GSI1"]
    })

    ssm-parameter-access = templatefile("${path.root}/policies/ssm-get-parameter.json", {
      jwt_key_arn = data.aws_ssm_parameter.jwt_secret.arn
    })
  }
  managed_policy_arns = []
  environment         = var.environment
  tags                = {}
}

module "login_user_lambda_function" {
  source            = "./modules/lambda"
  handler_file_name = "loginUser"
  iam_role_arn      = module.login_user_iam_role.role_arn
  function_name     = "login_user_lambda_function"
  environment_variables = {
    USER_TABLE_NAME       = module.dynamoDB_tables.table_name
    USER_EMAIL_INDEX_NAME = "GSI1",
    ENVIRONMENT           = var.environment
  }
  environment    = var.environment
  tags           = {}
  lambda_timeout = var.lambda_timeout

}

module "api_gateway" {
  source     = "./modules/apigatway"
  api_name   = "${var.project_name}-api"
  stage_name = var.environment
  resources  = var.resources
  routes     = var.routes
  integration_type        = "aws_proxy"
  integration_http_method = "POST"
  passthrough_behavior    = "when_no_match"
  content_handling        = "CONVERT_TO_TEXT"
  lambda_functions = {
    "register_user_lambda" = {
      function_name = module.register_user_lambda_function.function_name
      invoke_arn    = module.register_user_lambda_function.invoke_arn
    }

    "login_user_lambda" = {
      function_name = module.login_user_lambda_function.function_name
      invoke_arn    = module.login_user_lambda_function.invoke_arn
    }
  }
  environment = var.environment
  description = var.api_gateway_description
  tags        = {}

}
