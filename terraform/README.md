# CloudplusAI Infrastructure

This directory contains the Infrastructure-as-Code foundation for the CloudplusAI deployment.

## Target AWS architecture

```text
VPC
├── Public/Private networking
├── IAM roles and policies
├── ECR
├── S3
├── EC2 / EKS
└── CloudWatch
```

Terraform is used to keep infrastructure configuration version-controlled and repeatable.

> AWS resources must be provisioned with valid credentials and environment-specific variables. Never commit access keys or secrets.
