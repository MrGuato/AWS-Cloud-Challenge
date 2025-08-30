# AWS Cloud Resume Challenge - A Security-Focused Approach

[![Made With Love](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20Jonathan-red)](https://github.com/MrGuato/AWS-Cloud-Challenge)
[![Upload Website](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/front-end-cicd.yaml/badge.svg)](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/front-end-cicd.yaml)
[![Website Status](https://img.shields.io/uptimerobot/status/m798619615-533a3f0c1a578cd8e72699f7)](https://stats.uptimerobot.com/tybY8h8NyK)
[![CodeQL](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/github-code-scanning/codeql)
[![Deploy Star Wars API to AWS](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/deploy.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/MrGuato/File-Hash-Generator/badge.svg)](https://app.snyk.io/org/mrguato/AWS-Cloud-Challenge)
[![Dependabot Updates](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/MrGuato/AWS-Cloud-Challenge/network/updates)
[![Language](https://img.shields.io/github/languages/top/MrGuato/AWS-Cloud-Challenge?style=flat)](https://github.com/MrGuato/AWS-Cloud-Challenge)
[![GitHub stars](https://img.shields.io/github/stars/MrGuato/AWS-Cloud-Challenge?style=social)](https://github.com/MrGuato/AWS-Cloud-Challenge)
[![Last Commit](https://img.shields.io/github/last-commit/MrGuato/AWS-Cloud-Challenge)](https://github.com/MrGuato/AWS-Cloud-Challenge) 

Hola! This project implements the AWS Cloud Resume Challenge, a hands-on project designed by Forrest Brazeal ([https://cloudresumechallenge.dev/](https://cloudresumechallenge.dev/)), to demonstrate practical cloud skills using AWS. My primary motivation for undertaking this challenge was to gain a deeper understanding of DevOps principles, specifically from a cybersecurity perspective. By building and deploying this online resume website, I aimed to explore how security can be integrated throughout the development and deployment lifecycle.  I've added my own personal touches to this project, going beyond the basic requirements, including integrating CodeQL and Snyk for vulnerability monitoring, and Uptime Robot via API for continuous uptime and security monitoring with notifications.

## Project Overview

This project encompasses the core requirements of the Cloud Resume Challenge, but with a strong emphasis on security best practices:

*   **Static Website Hosting:** The resume website is built using HTML, CSS, and JavaScript, and hosted on Amazon S3. Security considerations for S3 include bucket policies, access control lists (ACLs), and enabling versioning.
*   **Content Delivery Network (CDN):** Amazon CloudFront is used to distribute the website globally. Security best practices for CloudFront include using HTTPS, restricting access to the origin S3 bucket, and configuring Web Application Firewall (WAF) rules.
*   **HTTPS:** The website is secured with HTTPS using an SSL certificate provided by AWS Certificate Manager. This ensures encrypted communication and protects against man-in-the-middle attacks.
*   **Custom Domain:** A custom domain (cloud.mrcyberleon.org) is configured to point to the CloudFront distribution. DNS security best practices are considered, such as using DNSSEC.
*   **Visitor Counter:** A dynamic visitor counter is implemented, leveraging serverless technologies.
*   **Backend API:** An API Gateway endpoint triggers a Lambda function to increment and retrieve the visitor count. Security considerations include input validation, authorization, and protecting against injection attacks.
*   **Database:** Amazon DynamoDB stores the visitor count. Security best practices include using IAM roles and policies to restrict access to the database.
*   **Infrastructure as Code (IaC):** Terraform is used to define and manage the entire AWS infrastructure. This allows for consistent and repeatable deployments, reducing the risk of human error and misconfigurations. Security scanning of Terraform code is also considered.
*   **Continuous Integration/Continuous Deployment (CI/CD):** GitHub Actions automates the build, deployment, and testing process. Security is integrated into the CI/CD pipeline, including static code analysis with CodeQL, vulnerability scanning with Snyk, and security testing.

## Architecture

![AWS Cloud Challenge drawio](https://github.com/user-attachments/assets/bca28753-d495-4010-8b0e-672305871861)

## How This Project Benefits a Security Engineer

This project, while seemingly simple, provides valuable experience and demonstrates key skills relevant to a security engineer, especially in the context of DevSecOps.  It bridges the gap between development, operations, and security, showcasing an understanding of how to build and deploy secure applications in a cloud environment.  I've also added some personal touches to enhance the project's security and operational aspects.

**Key Benefits and DevSecOps Alignment:**

*   **Infrastructure as Code (IaC) with Terraform:**  Terraform allows for the automated and consistent provisioning of infrastructure.  From a security perspective, this is crucial for ensuring that security configurations are applied consistently across all environments (dev, test, prod).  It allows for security hardening to be codified and easily audited.  This aligns with the DevSecOps principle of "security as code."

 **Continuous Integration/Continuous Deployment (CI/CD) with GitHub Actions:** Integrating security into the CI/CD pipeline is a core tenet of DevSecOps. This project demonstrates how to automate security checks (e.g., static code analysis with CodeQL, vulnerability scanning with Snyk) as part of the build and deployment process. This allows for early detection of security vulnerabilities, preventing them from reaching production.

*   **Secure Static Website Hosting with S3 and CloudFront:** Hosting a static website on S3 and distributing it via CloudFront demonstrates an understanding of secure web hosting principles.  This includes configuring appropriate bucket policies and ACLs, enabling HTTPS, and protecting against common web vulnerabilities.  CloudFront's WAF integration also aligns with DevSecOps best practices.

*   **Serverless Security with Lambda and API Gateway:**  The visitor counter functionality utilizes serverless technologies.  Securing serverless applications requires a different approach than traditional applications. This project provides experience with securing Lambda functions (e.g., using least privilege IAM roles, input validation) and API Gateway endpoints (e.g., authentication, authorization).

*   **Database Security with DynamoDB:**  Securing data at rest and in transit is essential.  This project demonstrates how to use IAM roles and policies to restrict access to the DynamoDB database, ensuring that only authorized services and users can access the data.

*   **HTTPS and Certificate Management:**  Using HTTPS is fundamental for secure communication.  This project utilizes AWS Certificate Manager (ACM) to provision and manage SSL certificates, ensuring that all traffic to the website is encrypted.

*   **Monitoring and Logging (Implied):** While not explicitly shown in the basic challenge, this project provides a foundation for integrating monitoring and logging tools. These tools are crucial for security monitoring, incident response, and threat detection. In a real-world scenario, you would integrate CloudWatch to monitor the infrastructure and application for suspicious activity. To provide real-time insight into the website's availability and security, I've integrated Uptime Robot via its API.  This allows for continuous monitoring and notifications to email, text, and phone, enabling quick responses to any issues.

*   **Vulnerability Management:** By building and deploying this application, you gain experience with the process of identifying, assessing, and mitigating vulnerabilities. This is a critical skill for a security engineer. The integration of CodeQL and Snyk directly addresses this by providing automated vulnerability scanning and reporting.

*   **DevOps Understanding:**  This project provides practical experience with DevOps tools and processes, which is essential for a security engineer working in a DevSecOps environment.  Understanding the development and deployment lifecycle is crucial for integrating security effectively.

By completing this project, and with the added integrations of CodeQL, Snyk, and Uptime Robot, a security engineer can demonstrate a practical understanding of cloud security principles, DevSecOps practices, and the tools and technologies used to build and deploy secure and reliable applications in the AWS cloud. It serves as a strong foundation for further learning and specialization in cloud security. I primarily undertook this project to demonstrate competency with AWS Cloud, as I had no prior experience with it, having focused primarily on Azure Cloud.  While my background is primarily in Azure, this project provided valuable experience with the AWS ecosystem.

**Future Development Considerations:**

While this project fulfills the core requirements of the AWS Cloud Resume Challenge and incorporates several security enhancements, future development could include the following:

*   **Expanded Website Content:**  Adding more pages to the website to provide richer content and functionality.
*   **Automated Security Alerting with Tines:** Integrating Tines to automate security alerts and responses to downtime, security incidents, and other critical events via webhooks. This would enable proactive and automated incident response.

## Live Demo 🔗

[https://cloud.mrcyberleon.org](https://cloud.mrcyberleon.org)

## Author

*   Hashnode Blog: [@mrcyberleon](https://hashnode.com/@mrcyberleon)
*   LinkedIn: [Jonathan DeLeon](www.linkedin.com/in/jonathan-deleon-ccsp-81302a62)
*   TryHackMe: [MrGuato](https://tryhackme.com/p/MrGuato)
