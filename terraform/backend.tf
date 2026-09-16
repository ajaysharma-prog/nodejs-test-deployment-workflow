terraform {
  backend "s3" {
    bucket       = "terraform-aws-nodejs-state-bucket"
    key          = "dev/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}
