# 📄 Project Charter

## 1. Executive Summary
**FlashTix** solves the critical issue of system downtime during high-traffic ticket sales. By leveraging AWS container services, the platform ensures stability and scalability that traditional VPS setups cannot match.

## 2. Problem Statement
Traditional e-commerce systems hosted on fixed-capacity servers (EC2/VPS) often face:
* **Downtime:** System crashes during traffic spikes due to resource exhaustion.
* **Operational Inefficiency:** Manual scaling is slow and error-prone.

## 3. Project Objectives
* **Scalability:** Handle traffic surges from 100 to 10,000+ concurrent users.
* **Resilience:** Ensure High Availability (HA) using Multi-AZ deployment.
* **Automation:** Establish a CI/CD pipeline for Zero-Downtime Deployment.