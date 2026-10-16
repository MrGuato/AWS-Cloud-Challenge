# AWS Cloud Resume Challenge - A Security-Focused Approach

[![Made With Love](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20Jonathan-red)](https://github.com/MrGuato/AWS-Cloud-Challenge)
[![Upload Website](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/front-end-cicd.yaml/badge.svg)](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/front-end-cicd.yaml)
[![Website Status](https://img.shields.io/uptimerobot/status/m798619615-533a3f0c1a578cd8e72699f7)](https://stats.uptimerobot.com/tybY8h8NyK)
[![CodeQL](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/github-code-scanning/codeql)
[![Deploy Star Wars API to AWS](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/MrGuato/AWS-Cloud-Challenge/actions/workflows/deploy.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/MrGuato/File-Hash-Generator/badge.svg)](https://app.snyk.io/org/mrguato/AWS-Cloud-Challenge)
[![Language](https://img.shields.io/github/languages/top/MrGuato/AWS-Cloud-Challenge?style=flat)](https://github.com/MrGuato/AWS-Cloud-Challenge)
[![GitHub stars](https://img.shields.io/github/stars/MrGuato/AWS-Cloud-Challenge?style=social)](https://github.com/MrGuato/AWS-Cloud-Challenge)
[![Last Commit](https://img.shields.io/github/last-commit/MrGuato/AWS-Cloud-Challenge)](https://github.com/MrGuato/AWS-Cloud-Challenge)

Hola! This project implements the AWS Cloud Resume Challenge, a hands-on project designed by Forrest Brazeal ([https://cloudresumechallenge.dev/](https://cloudresumechallenge.dev/)), to demonstrate practical cloud skills using AWS. My primary motivation for undertaking this challenge was to gain a deeper understanding of DevOps principles, specifically from a cybersecurity perspective. By building and deploying this online resume website, I aimed to explore how security can be integrated throughout the development and deployment lifecycle. I've added my own personal touches to this project, going beyond the basic requirements, including integrating CodeQL and Snyk for vulnerability monitoring, Uptime Robot via API for continuous uptime and security monitoring with notifications, and a second serverless API that serves Cyber x Star Wars facts.

The site itself is a one-page landing site that shares the design system of my [pi-cluster status page](https://status.deleontech.net) (system fonts, hairline borders, light and dark themes) but reads as a narrative: what the project is, how it is built, why it is boring on purpose, one Star Wars fact at a time, and where to find me. A single live card in the hero reports the visitor count, API health and the latest deploys.

## Project Overview

This project encompasses the core requirements of the Cloud Resume Challenge, but with a strong emphasis on security best practices:

*   **Static Website Hosting:** The website is plain HTML, CSS and JavaScript (no build step) hosted on Amazon S3. Security considerations for S3 include bucket policies, access control lists (ACLs), and enabling versioning.
*   **Content Delivery Network (CDN):** Amazon CloudFront is used to distribute the website globally. Security best practices for CloudFront include using HTTPS, restricting access to the origin S3 bucket, and configuring Web Application Firewall (WAF) rules.
*   **HTTPS:** The website is secured with HTTPS using an SSL certificate provided by AWS Certificate Manager. This ensures encrypted communication and protects against man-in-the-middle attacks.
*   **Custom Domain:** A custom domain (cloud.mrcyberleon.org) is configured to point to the CloudFront distribution. DNS security best practices are considered, such as using DNSSEC.
*   **Visitor Counter:** A dynamic visitor counter is implemented, leveraging serverless technologies (Lambda function URL + DynamoDB).
*   **Star Wars Intel API:** A second Lambda behind API Gateway serves Cyber x Star Wars facts to the site. It is deployed with the Serverless Framework, unit tested in CI, and ships hardened response headers with CORS pinned to the site's origin. See [Star Wars Intel API](#star-wars-intel-api).
*   **Database:** Amazon DynamoDB stores the visitor count. Security best practices include using IAM roles and policies to restrict access to the database.
*   **Infrastructure as Code (IaC):** Terraform is used to define and manage the counter's AWS infrastructure. This allows for consistent and repeatable deployments, reducing the risk of human error and misconfigurations. Security scanning of Terraform code is also considered.
*   **Continuous Integration/Continuous Deployment (CI/CD):** GitHub Actions automates the build, deployment, and testing process. Security is integrated into the CI/CD pipeline, including static code analysis with CodeQL, vulnerability scanning with Snyk and Dependabot, and security testing.

## Architecture

![AWS Cloud Challenge drawio](https://github.com/user-attachments/assets/bca28753-d495-4010-8b0e-672305871861)

The live site draws the same flow as an SVG diagram with a numbered walkthrough underneath.

## Repository Layout

```
assets/                      Website, synced to the S3 bucket as-is
  index.html                 Landing page: hero + live card, project, architecture, security, intel, about, links
  css/site.css               Design tokens shared with status.deleontech.net: light/dark, hairline borders, 2px radius
  js/app.js                  Live card (counter, API health, GitHub Actions runs), intel card, theme toggle
  img/                       Avatar (512 / 180) and favicon
backend/starwars-api/        Serverless Framework service (Node.js 22 on arm64)
  handler.js                 One Lambda, three routes
  starwarsFacts.js           The intel, with categories
  serverless.yml             API Gateway + Lambda definition
  scripts/repair-stack.sh    Unsticks a CloudFormation stack before deploying
  test/handler.test.js       Unit tests (node --test, no dependencies)
infra/                       Terraform for the visitor counter Lambda + DynamoDB
.github/workflows/
  front-end-cicd.yaml        Push to main (assets/**) -> S3 sync -> optional CloudFront invalidation
  deploy.yml                 Push to main (backend/**) -> tests -> stack repair -> serverless deploy -> smoke test
```

## Website

Open `assets/index.html` through any static server to preview it locally, for example:

```bash
python -m http.server 8080 --directory assets
```

Then browse to `http://localhost:8080`. The visitor counter and the intel terminal call the live AWS endpoints, so the counter increments on every local reload too.

What the page does:

*   **Hero** - headline, short pitch, three calls to action and one live card: visitor count from the Lambda URL, intel API health with latency, the latest run of each GitHub Actions workflow (read from the public GitHub API) and the UptimeRobot link. The headline status only counts the two runtime services.
*   **The project** - three short columns: front line, back end, delivery.
*   **Architecture** - SVG diagram of both deploy paths and the two request paths, with a numbered walkthrough.
*   **Security** - eight principles as a definition list.
*   **Intel** - one button, one fact per request. The category chip is colored by Warcraft item rarity, which is about as far as the theme goes.
*   **About and links** - bio, a small facts grid, and link cards.
*   **Theme** - auto, light or dark, remembered in localStorage.

No external fonts, scripts or icon libraries: the page is three files plus three images, about 130 KB in total instead of the 6 MB template it replaced.

## Star Wars Intel API

Base URL: `https://wrnqhuvrp9.execute-api.us-east-1.amazonaws.com/dev`

| Route | Description | Example response |
| --- | --- | --- |
| `GET /starwarsfact` | One random fact | `{"id":4,"category":"ransomware","fact":"...","total":36}` |
| `GET /starwarsfact?id=4` | A specific fact (ids start at 1; anything else is a `400`) | same shape |
| `GET /starwarsfacts` | Every fact plus the list of categories | `{"total":36,"categories":[...],"facts":[...]}` |
| `GET /starwarsfacts?category=zero-trust` | Facts in one category (unknown category is a `400` that lists the valid ones) | `{"total":2,"category":"zero-trust","facts":[...]}` |
| `GET /health` | Liveness, version and fact count | `{"status":"ok","service":"starwars-api","version":"2.0.0","facts":36,...}` |

Every response is JSON with `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Vary: Origin` and an `Access-Control-Allow-Origin` that echoes the caller only when it is on the allow list (`ALLOWED_ORIGINS` in `serverless.yml`); unknown origins get the production origin, so their browsers cannot read the response.

### Local development

```bash
cd backend/starwars-api
npm ci
npm test
```

Deploying from a laptop needs AWS credentials and a `SERVERLESS_ACCESS_KEY` (Serverless Framework v4 requires a free account):

```bash
npm run deploy
```

### How the deploy pipeline works

`.github/workflows/deploy.yml` runs on every push to `main` that touches `backend/starwars-api/**` (and on pull requests, tests only):

1. **Unit tests** with Node's built-in test runner.
2. **Stack repair** - `scripts/repair-stack.sh` checks the `starwars-api-dev` CloudFormation stack. If it is stuck in `UPDATE_ROLLBACK_FAILED` it calls `ContinueUpdateRollback`, retrying with `--resources-to-skip` for resources that cannot roll back. A stack left in `ROLLBACK_COMPLETE` by a failed first create is deleted so it can be created again.
3. **`serverless deploy`** with the framework's own deployment bucket.
4. **Smoke test** - reads the `ServiceEndpoint` stack output and curls `/health` and `/starwarsfact`.

A `concurrency` group guarantees that only one deploy of the stack runs at a time.

### Runbook: "Stack is in UPDATE_ROLLBACK_FAILED state and can not be updated"

**Root cause of the October 2026 outage.** `serverless.yml` used to set `deploymentBucket` to the *website* bucket (`AWS_S3_BUCKET`). The website workflow syncs that bucket with `--delete`, which removed the Lambda deployment zips under `serverless/`. When a later update failed, CloudFormation could not roll back to a zip that no longer existed and parked the stack in `UPDATE_ROLLBACK_FAILED`, where every deploy is rejected. Fix: the API now uses its own deployment bucket, and the deploy pipeline repairs a stuck stack automatically.

**If it happens again**, any of these work:

*   Push to `main` (or run the *Deploy Star Wars API to AWS* workflow manually). The repair step runs before the deploy.
*   From AWS CloudShell or any shell with credentials:

    ```bash
    aws cloudformation continue-update-rollback --stack-name starwars-api-dev --region us-east-1
    ```

    If that fails too, list the resources that could not roll back and skip them:

    ```bash
    aws cloudformation describe-stack-resources --stack-name starwars-api-dev --region us-east-1 \
      --query "StackResources[?ResourceStatus=='UPDATE_FAILED'].LogicalResourceId" --output text
    aws cloudformation continue-update-rollback --stack-name starwars-api-dev --region us-east-1 \
      --resources-to-skip <LogicalId ...>
    ```

*   Last resort: run the workflow manually with `recreate_stack` checked. This deletes and recreates the stack, which gives API Gateway a **new URL**; update `apiBase` in `assets/js/app.js` afterwards.

The IAM user behind `AWS_ACCESS_KEY_ID` needs `cloudformation:ContinueUpdateRollback`, `cloudformation:DescribeStack*` and (for the last resort) `cloudformation:DeleteStack`, plus permission to create the framework's deployment bucket on the first deploy (`s3:CreateBucket`, `s3:PutBucketPolicy`, `s3:PutBucketVersioning`, `s3:PutEncryptionConfiguration`, `s3:PutBucketPublicAccessBlock`). To use a bucket you create yourself instead, add it back under `provider.deploymentBucket.name` in `serverless.yml`, but never point it at the website bucket.

### GitHub secrets used

| Secret | Used by | Purpose |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | both workflows | Deploy identity |
| `AWS_S3_BUCKET` | website workflow | Website bucket (no longer used by the API) |
| `SERVERLESS_ACCESS_KEY` | API workflow | Serverless Framework v4 license/auth |
| `CLOUDFRONT_DISTRIBUTION_ID` | website workflow (optional) | Invalidate the CDN cache after each deploy so changes show up immediately |

## How This Project Benefits a Security Engineer

This project, while seemingly simple, provides valuable experience and demonstrates key skills relevant to a security engineer, especially in the context of DevSecOps. It bridges the gap between development, operations, and security, showcasing an understanding of how to build and deploy secure applications in a cloud environment. I've also added some personal touches to enhance the project's security and operational aspects.

**Key Benefits and DevSecOps Alignment:**

*   **Infrastructure as Code (IaC) with Terraform:** Terraform allows for the automated and consistent provisioning of infrastructure. From a security perspective, this is crucial for ensuring that security configurations are applied consistently across all environments (dev, test, prod). It allows for security hardening to be codified and easily audited. This aligns with the DevSecOps principle of "security as code."

*   **Continuous Integration/Continuous Deployment (CI/CD) with GitHub Actions:** Integrating security into the CI/CD pipeline is a core tenet of DevSecOps. This project demonstrates how to automate security checks (e.g., static code analysis with CodeQL, vulnerability scanning with Snyk) as part of the build and deployment process. This allows for early detection of security vulnerabilities, preventing them from reaching production. Workflows run with read-only `contents` permission, pin third-party actions, filter on paths so a site change cannot trigger an API deploy, and serialize deploys with concurrency groups.

*   **Secure Static Website Hosting with S3 and CloudFront:** Hosting a static website on S3 and distributing it via CloudFront demonstrates an understanding of secure web hosting principles. This includes configuring appropriate bucket policies and ACLs, enabling HTTPS, and protecting against common web vulnerabilities. CloudFront's WAF integration also aligns with DevSecOps best practices.

*   **Serverless Security with Lambda and API Gateway:** The visitor counter and the intel API utilize serverless technologies. Securing serverless applications requires a different approach than traditional applications. This project provides experience with securing Lambda functions (e.g., using least privilege IAM roles, input validation on query parameters, minimal deployment packages) and API Gateway endpoints (strict CORS, hardened response headers).

*   **Database Security with DynamoDB:** Securing data at rest and in transit is essential. This project demonstrates how to use IAM roles and policies to restrict access to the DynamoDB database, ensuring that only authorized services and users can access the data.

*   **HTTPS and Certificate Management:** Using HTTPS is fundamental for secure communication. This project utilizes AWS Certificate Manager (ACM) to provision and manage SSL certificates, ensuring that all traffic to the website is encrypted.

*   **Monitoring and Logging:** CloudWatch log groups for the API are retained for 14 days, and the pipeline smoke-tests the live endpoint after every deploy. To provide real-time insight into the website's availability and security, I've integrated Uptime Robot via its API. This allows for continuous monitoring and notifications to email, text, and phone, enabling quick responses to any issues.

*   **Vulnerability Management:** By building and deploying this application, you gain experience with the process of identifying, assessing, and mitigating vulnerabilities. This is a critical skill for a security engineer. The integration of CodeQL, Snyk and Dependabot directly addresses this by providing automated vulnerability scanning and reporting.

*   **Incident Response, for real:** The stuck CloudFormation stack described in the runbook above was a genuine production incident in this project. Diagnosing it (a shared bucket plus a destructive sync) and automating the recovery is exactly the kind of DevSecOps work the challenge is meant to teach.

*   **DevOps Understanding:** This project provides practical experience with DevOps tools and processes, which is essential for a security engineer working in a DevSecOps environment. Understanding the development and deployment lifecycle is crucial for integrating security effectively.

By completing this project, and with the added integrations of CodeQL, Snyk, and Uptime Robot, a security engineer can demonstrate a practical understanding of cloud security principles, DevSecOps practices, and the tools and technologies used to build and deploy secure and reliable applications in the AWS cloud. It serves as a strong foundation for further learning and specialization in cloud security. I primarily undertook this project to demonstrate competency with AWS Cloud, as I had no prior experience with it, having focused primarily on Azure Cloud. While my background is primarily in Azure, this project provided valuable experience with the AWS ecosystem.

**Future Development Considerations:**

*   **OIDC instead of long-lived keys:** Swap the static `AWS_ACCESS_KEY_ID` secret for GitHub's OpenID Connect federation with a scoped IAM role.
*   **Custom API domain:** Put the intel API behind `api.cloud.mrcyberleon.org` so recreating the stack never changes the URL the site calls.
*   **Automated Security Alerting with Tines:** Integrating Tines to automate security alerts and responses to downtime, security incidents, and other critical events via webhooks. This would enable proactive and automated incident response.

## Live Demo 🔗

[https://cloud.mrcyberleon.org](https://cloud.mrcyberleon.org)

## Credits and Disclaimer

Fan project. Not affiliated with Lucasfilm Ltd., Disney or Blizzard Entertainment. The previous version of the site was based on the "Aerial" template by HTML5 UP (CC BY 3.0, see `LICENSE.txt`).

## Author

*   Hashnode Blog: [@mrcyberleon](https://hashnode.com/@mrcyberleon)
*   LinkedIn: [Jonathan DeLeon](https://www.linkedin.com/in/jonathan-deleon-ccsp-81302a62)
*   TryHackMe: [MrGuato](https://tryhackme.com/p/MrGuato)
