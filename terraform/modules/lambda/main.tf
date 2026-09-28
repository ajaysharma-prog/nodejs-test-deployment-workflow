data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "${path.root}/zip/bundles/${var.handler_file_name}.zip"
  source_file = "${path.root}/../app/dist/bundles/${var.handler_file_name}.js"

}

resource "aws_lambda_function" "this" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-${var.function_name}"
  role             = var.iam_role_arn
  handler          = "${var.handler_file_name}.handler"
  runtime          = "nodejs24.x"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = var.lambda_timeout

  environment {
    variables = var.environment_variables
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-${var.function_name}"
    }
  )
}
