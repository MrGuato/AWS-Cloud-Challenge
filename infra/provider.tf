terraform {
  required_providers {
    aws = {
        version = > "4.9.0"
        source = "hashcorp/aws"
    }
  }
}
provider "aws" {
    profile = "default"
    region = "ca-central-1"
}
