variable "aws_region" {
  description = "AWS region for CloudplusAI infrastructure"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for resource naming and tags"
  type        = string
  default     = "cloudplusai"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}
