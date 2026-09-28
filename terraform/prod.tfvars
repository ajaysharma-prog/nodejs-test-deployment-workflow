project_name            = "ticket-booking-system"
environment             = "prod"
api_gateway_description = "Production REST API Gateway."
hash_key                = "PK"

table_name = "main-table"

hash_key_type = "S"

range_key = "SK"

range_key_type = "S"

additional_attributes = [
  {
    name = "GSI1PK",
    type = "S"
  },
  {
    name = "GSI1SK",
    type = "S"
  },
  {
    name = "GSI2PK",
    type = "S"
  },
  {
    name = "GSI2SK",
    type = "S"
  }
]

global_secondary_indexes = [
  {
    name               = "GSI1"
    projection_type    = "ALL"
    non_key_attributes = []
    key_schema = [
      {
        attribute_name = "GSI1PK"
        key_type       = "HASH"
      },
      {
        attribute_name = "GSI1SK"
        key_type       = "RANGE"
      }
    ]
  },
  {
    name               = "GSI2"
    projection_type    = "ALL"
    non_key_attributes = []
    key_schema = [
      {
        attribute_name = "GSI2PK"
        key_type       = "HASH"
      },
      {
        attribute_name = "GSI2SK"
        key_type       = "RANGE"
      }
    ]
  }
]

lambda_timeout = 30
////////////////////////////////////////APIGATEWAY////////////////////////////////////////////////////////////////

routes = {
  "user_registration" = {
    resource_path = "api/auth/register"
    http_method   = "POST"
    lambda_key    = "register_user_lambda"
    authorization = "NONE"
  }
  "user_login" = {
    resource_path = "api/auth/login"
    http_method   = "POST"
    lambda_key    = "login_user_lambda"
    authorization = "NONE"
  }

  "get_user" = {
    resource_path = "api/users/me"
    http_method   = "GET"
    lambda_key    = "get_user_lambda"
    authorization = "JWT"
  }

  "create_event" = {
    resource_path = "api/events"
    http_method   = "POST"
    lambda_key    = "create_event_lambda"
    authorization = "JWT"
  }

  "create_ticket_tier" = {
    resource_path = "api/events/{eventId}/tiers"
    http_method   = "POST"
    lambda_key    = "create_ticket_tier_lambda"
    authorization = "JWT"
  }

  "get_all_events" = {
    resource_path = "api/events/all"
    http_method   = "GET"
    lambda_key    = "get_all_events_lambda"
    authorization = "NONE"
  }

  "get_event_by_id" = {
    resource_path = "api/events/{eventId}"
    http_method   = "GET"
    lambda_key    = "get_event_by_id_lambda"
    authorization = "NONE"
  }

  "create_booking" = {
    resource_path = "api/bookings"
    http_method   = "POST"
    lambda_key    = "create_booking_lambda"
    authorization = "JWT"
  }

  "get_bookings" = {
    resource_path = "api/bookings/my-bookings"
    http_method   = "GET"
    lambda_key    = "get_booking_lambda"
    authorization = "JWT"
  }
}
