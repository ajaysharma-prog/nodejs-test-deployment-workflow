terraform {
  backend "s3" {
    bucket       = "terraform-aws-nodejs-state-bucket"
    region       = "us-east-1"
    use_lockfile = true
  }
}
