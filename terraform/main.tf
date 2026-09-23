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
  handler_file_name = "register-user"
  iam_role_arn      = module.register_user_iam_role.role_arn
  function_name     = "register-user-lambda-function"
  environment_variables = {
    TABLE_NAME       = module.dynamoDB_tables.table_name
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
  handler_file_name = "login-user"
  iam_role_arn      = module.login_user_iam_role.role_arn
  function_name     = "login-user-lambda-function"
  environment_variables = {
    TABLE_NAME       = module.dynamoDB_tables.table_name
    USER_EMAIL_INDEX_NAME = "GSI1",
    ENVIRONMENT           = var.environment
  }
  environment    = var.environment
  tags           = {}
  lambda_timeout = var.lambda_timeout

}

module "authorizer_iam_role" {
  source             = "./modules/iam"
  role_name          = "authorizer-lambda-role"
  assume_role_policy = file("${path.root}/policies/trust-policy.json")
  custom_policies = {
    ssm-parameter-access = templatefile("${path.root}/policies/ssm-get-parameter.json", {
      jwt_key_arn = data.aws_ssm_parameter.jwt_secret.arn
    })
  }
  managed_policy_arns = []
  environment         = var.environment
  tags                = {}
}


module "authorizer_lambda_function" {
  source            = "./modules/lambda"
  handler_file_name = "jwt-authorizer"
  iam_role_arn      = module.authorizer_iam_role.role_arn
  function_name     = "jwt-autorizer-lambda-function"

  environment_variables = {
    ENVIRONMENT = var.environment
  }
  environment    = var.environment
  tags           = {}
  lambda_timeout = var.lambda_timeout
}

module "get_user_iam_role" {
  source             = "./modules/iam"
  role_name          = "get-user-lambda-role"
  assume_role_policy = file("${path.root}/policies/trust-policy.json")
  custom_policies = {
    dynamodb-access = templatefile("${path.root}/policies/dynamodb-login-user.json", {
      gsi_arn = module.dynamoDB_tables.global_secondary_index_arns["GSI1"]
    })
  }
  managed_policy_arns = []
  environment         = var.environment
  tags                = {}
}

module "get_user_lambda_function" {
  source            = "./modules/lambda"
  handler_file_name = "get-user"
  iam_role_arn      = module.get_user_iam_role.role_arn
  function_name     = "get-user-lambda-function"
  environment_variables = {
    TABLE_NAME       = module.dynamoDB_tables.table_name
    USER_EMAIL_INDEX_NAME = "GSI1",
    ENVIRONMENT           = var.environment
  }
  environment    = var.environment
  tags           = {}
  lambda_timeout = var.lambda_timeout
}

module "create_event_iam_role" {
  source             = "./modules/iam"
  role_name          = "create-event-lambda-role"
  assume_role_policy = file("${path.root}/policies/trust-policy.json")
  custom_policies = {
    create_event = templatefile("${path.root}/policies/create-event.json", {
      table_arn = module.dynamoDB_tables.table_arn,
      gsi_arn   = module.dynamoDB_tables.global_secondary_index_arns["GSI2"],
      bucket_arn = module.event_banner_s3_bucket.bucket_arn
    })
  }
  managed_policy_arns = []
  environment         = var.environment
  tags                = {}
}

module "create_event_lambda_function" {
  source            = "./modules/lambda"
  handler_file_name = "create-event"
  iam_role_arn      = module.create_event_iam_role.role_arn
  function_name     = "create-event-lambda-function"
  environment_variables = {
    TABLE_NAME = module.dynamoDB_tables.table_name,
    ENVIRONMENT     = var.environment
    BUCKET_REGION   = data.aws_region.current.region
    BUCKET_NAME     = module.event_banner_s3_bucket.bucket_id
  }
  environment    = var.environment
  tags           = {}
  lambda_timeout = var.lambda_timeout
}

module "create_ticket_tier_iam_role" {
  source             = "./modules/iam"
  role_name          = "create-ticket-tier-lambda-role"
  assume_role_policy = file("${path.root}/policies/trust-policy.json")
  custom_policies = {
    create_ticket_tier_event = templatefile("${path.root}/policies/create-ticket-tier.json", {
      table_arn = module.dynamoDB_tables.table_arn,
    })
  }
  managed_policy_arns = []
  environment         = var.environment
  tags                = {}
}

module "create_ticket_tier_lambda_function" {
  source            = "./modules/lambda"
  handler_file_name = "create-ticket-tier"
  iam_role_arn      = module.create_ticket_tier_iam_role.role_arn
  function_name     = "create-ticket-tier-lambda-function"
  environment_variables = {
    TABLE_NAME      = module.dynamoDB_tables.table_name,
  }
  environment    = var.environment
  tags           = {}
  lambda_timeout = var.lambda_timeout
}

module "api_gateway" {
  source               = "./modules/apigateway"
  api_name             = "${var.project_name}-api"
  stage_name           = var.environment
  routes               = var.routes
  passthrough_behavior = "when_no_match"
  content_handling     = "CONVERT_TO_TEXT"
  aws_region           = data.aws_region.current.region
  authorizer_lambda_invoke_arn = module.authorizer_lambda_function.invoke_arn
  authorizer_lambda_name       = module.authorizer_lambda_function.function_name
  lambda_functions = {
    "register_user_lambda" = {
      function_name = module.register_user_lambda_function.function_name
      invoke_arn    = module.register_user_lambda_function.invoke_arn
    }

    "login_user_lambda" = {
      function_name = module.login_user_lambda_function.function_name
      invoke_arn    = module.login_user_lambda_function.invoke_arn
    }

    "get_user_lambda" = {
      function_name = module.get_user_lambda_function.function_name
      invoke_arn    = module.get_user_lambda_function.invoke_arn
    }

    "create_event_lambda" = {
      function_name = module.create_event_lambda_function.function_name
      invoke_arn    = module.create_event_lambda_function.invoke_arn
    }

    "create_ticket_tier_lambda" = {
      function_name = module.create_ticket_tier_lambda_function.function_name
      invoke_arn    = module.create_ticket_tier_lambda_function.invoke_arn
    }

  }
  environment = var.environment
  description = var.api_gateway_description
  tags        = {}
}

module "event_banner_s3_bucket" {
  source = "./modules/s3"

  environment = "dev"
  bucket_name = "event-banner"

  versioning_enabled        = true
  enable_lifecycle_archival = true
  lifecycle_filter_prefix   = "${var.environment}/"
  force_destroy             = false

  tags = {}
}
