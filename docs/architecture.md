# 🏗 Technical Specifications

## 1. Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js | SSR for SEO and optimized UX. |
| **Backend** | Node.js | Non-blocking I/O for high concurrency. |
| **Container** | Docker | Immutable infrastructure. |
| **Orchestration** | AWS ECS (Fargate) | Serverless management, auto-scaling. |
| **Load Balancing**| AWS ALB | Layer 7 routing with health checks. |

## 2. High-Level Architecture Flow
1. **User Traffic:** Enters via **Application Load Balancer (ALB)**.
2. **Routing:** ALB distributes traffic to healthy **ECS Tasks**.
3. **Scaling:** **Auto Scaling Group** monitors CPU. If CPU > 70%, add tasks.
4. **Data:** Persisted in MongoDB Atlas / DynamoDB.