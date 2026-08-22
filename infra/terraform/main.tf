terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_ecr_repository" "cloudplusai" {
  name                 = "cloudplusai-backend"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_s3_bucket" "artifacts" {
  bucket_prefix = "cloudplusai-artifacts-"
}

resource "aws_iam_role" "github_actions" {
  name = "cloudplusai-github-actions"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Federated = "REPLACE_WITH_GITHUB_OIDC_PROVIDER_ARN" }
      Action = "sts:AssumeRoleWithWebIdentity"
    }]
  })
}

output "ecr_repository_url" {
  value = aws_ecr_repository.cloudplusai.repository_url
}

output "artifact_bucket" {
  value = aws_s3_bucket.artifacts.id
}
