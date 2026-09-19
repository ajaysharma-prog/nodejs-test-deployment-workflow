resource "aws_dynamodb_table" "this" {
  name         = "${var.environment}-${var.table_name}-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.hash_key != null ? var.hash_key : null
  range_key    = var.range_key != null ? var.range_key : null

  attribute {
    name = var.hash_key
    type = var.hash_key_type
  }

  dynamic "attribute" {
    for_each = var.range_key != null ? [var.range_key] : []
    content {
      name = attribute.value
      type = var.range_key_type
    }
  }

  dynamic "attribute" {
    for_each = var.additional_attributes
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "local_secondary_index" {
    for_each = var.local_secondary_indexes
    content {
      name                = local_secondary_index.value.name
      range_key           = local_secondary_index.value.range_key
      projection_type     = local_secondary_index.value.projection_type
      non_key_attributes  = local_secondary_index.value.non_key_attributes
    }
  }


  dynamic "global_secondary_index" {
    for_each = var.global_secondary_indexes
    content {
      name               = global_secondary_index.value.name
      projection_type    = global_secondary_index.value.projection_type
      non_key_attributes = global_secondary_index.value.non_key_attributes

      dynamic "key_schema" {
        for_each = global_secondary_index.value.key_schema
        content {
          attribute_name = key_schema.value.attribute_name
          key_type       = key_schema.value.key_type
        }
      }
    }
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.aws_encryption_key_arn
  }



  lifecycle {
    prevent_destroy = false
  }

  tags = {
    Name = "${var.environment}-${var.table_name}-table"
  }
}
