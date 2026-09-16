module "dynamodb_tables" {
  source   = "./modules/dyanmoDB"
  for_each = var.dynamodb_tables

  table_name               = each.key
  environment              = var.environment
  hash_key                 = each.value.hash_key
  hash_key_type            = each.value.hash_key_type
  range_key                = each.value.range_key
  range_key_type           = each.value.range_key_type
  additional_attributes    = each.value.additional_attributes
  local_secondary_indexes  = each.value.local_secondary_indexes
  global_secondary_indexes = each.value.global_secondary_indexes
  aws_encryption_key_arn   = data.aws_kms_alias.dynamodb.arn 
}
