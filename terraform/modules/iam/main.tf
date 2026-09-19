resource "aws_iam_role" "this" {
  name               = var.role_name
  assume_role_policy = var.assume_role_policy
}

resource "aws_iam_policy" "custom" {
  for_each = var.custom_policies
  name     = "${var.role_name}-${each.key}"
  policy   = each.value
}

resource "aws_iam_role_policy_attachment" "custom" {
  for_each   = aws_iam_policy.custom
  role       = aws_iam_role.this.name
  policy_arn = each.value.arn
}

resource "aws_iam_role_policy_attachment" "managed" {
  for_each   = toset(var.managed_policy_arns)
  role       = aws_iam_role.this.name
  policy_arn = each.value
}
