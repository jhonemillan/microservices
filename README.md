# Fin-Freelancer

A client and invoice management system designed for freelancers, built on a robust and scalable microservice architecture. This project serves as an advanced case study for software design patterns, inter-service communication, and resilience in a cloud-native environment.

***

## 🏛️ Architectural Overview

This project is built using a **microservice architecture** with principles inspired by **Domain-Driven Design (DDD)**. Each microservice represents a "Bounded Context" with clear, well-defined responsibilities, promoting high cohesion and low coupling.

Inter-service communication is handled via **synchronous (HTTP)** calls, protected by resilience patterns, and is prepared for **asynchronous (event-based)** communication through Apache Kafka.

#### Container Diagram (C4 Model)
*[A C4 Container Diagram generated with PlantUML would go here]*

The general flow is as follows: a client (web/mobile app) communicates with the microservices through a conceptual API Gateway. The services collaborate with each other over an internal Docker network.

### Microservices

* **`identity-ms`**:
    * **Responsibility:** Authentication and Authorization (AuthN/AuthZ).
    * **Functionality:** User registration, login, JSON Web Token (JWT) generation, and logout.
    * **Details:** Implements a secure logout strategy using a token **blocklist in Redis**, ensuring that invalidated tokens cannot be reused.

* **`billing-ms`**:
    * **Responsibility:** Invoice Management.
    * **Functionality:** Full CRUD for invoices, associated with a user and a client.
    * **Details:** Implements a **Circuit Breaker** (using `opossum`) in its communication with the `clients-ms` to ensure resilience and prevent cascading failures.

* **`clients-ms`**:
    * **Responsibility:** Client Management.
    * **Functionality:** Full CRUD for a user's client portfolio.
    * **Details:** Acts as a supporting service for other domains, validating the existence of clients.

### Shared Infrastructure
* **`PostgreSQL`**: Acts as the primary relational database, shared by the microservices (in a real production environment, a database-per-service pattern would be considered).
* **`Redis`**: High-speed in-memory database used to manage the JWT blocklist for the logout flow.
* **`Kafka` & `Zookeeper`**: Event streaming platform, set up for asynchronous communication in future features like payment confirmations.

***

## 🛠️ Technology Stack

* **Backend:** Node.js, TypeScript, NestJS
* **Architecture:** Microservices, DDD, Resilience Patterns (Circuit Breaker)
* **Database:** PostgreSQL (with TypeORM), Redis
* **Messaging:** Apache Kafka
* **Authentication:** JWT (JSON Web Tokens), Passport.js
* **Containerization:** Docker, Docker Compose
* **Key Libraries:** `@nestjs/axios`, `opossum`, `class-validator`

***

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Docker and Docker Compose

### Installation and Execution
1.  Clone the repository.
2.  Create a copy of the environment configuration file (we haven't created this yet, but it's good practice to mention it):
    ```bash
    cp .env.example .env 
    ```
3.  Install Node.js dependencies from the project root:
    ```bash
    npm install
    ```
4.  Launch the entire environment with Docker Compose:
    ```bash
    docker-compose up --build
    ```
The system will be available on the following ports:
- **identity-ms**: `http://localhost:3001`
- **billing-ms**: `http://localhost:3002`
- **clients-ms**: `http://localhost:3003`

***

## 📋 API Endpoints

### Identity Service (`:3001`)
| Method | Route | Protected? | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | Registers a new user. |
| `POST` | `/auth/login` | No | Authenticates a user and returns a JWT. |
| `POST` | `/auth/logout` | Yes | Invalidates the current JWT by adding it to the blocklist. |
| `GET` | `/auth/profile` | Yes | Returns the authenticated user's profile. |

### Billing Service (`:3002`)
| Method | Route | Protected? | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/invoices` | Yes | Creates a new invoice for a client. |
| `GET` | `/invoices` | Yes | Gets all of the user's invoices. |
| `GET` | `/invoices/:id` | Yes | Gets a specific invoice. |
| `PATCH` | `/invoices/:id` | Yes | Updates an invoice. |
| `DELETE`| `/invoices/:id` | Yes | Deletes an invoice. |

### Clients Service (`:3003`)
| Method | Route | Protected? | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/clients` | Yes | Creates a new client. |
| `GET` | `/clients` | Yes | Gets all of the user's clients. |
| `GET` | `/clients/:id` | Yes | Gets a specific client. |
| `PATCH` | `/clients/:id` | Yes | Updates a client. |
| `DELETE`| `/clients/:id` | Yes | Deletes a client. |

***

## 🎨 Implemented Architectural Patterns

* **Monorepo Strategy:** The code is organized in a monorepo managed by the NestJS CLI, allowing for code reuse through shared libraries (`libs/common`) for components like Guards and Strategies.
* **Centralized & Distributed Authentication:** While the `identity-ms` is the sole creator of tokens, each microservice can validate them independently by sharing the `JwtStrategy`.
* **Resilience with Circuit Breaker:** Critical synchronous communication (from `billing-ms` to `clients-ms`) is protected to prevent the unavailability of one service from affecting another.

***

## 🔮 Roadmap (Next Steps)

* **Sprint 4:** Implementation of the `payments-ms` and webhook logic with Kafka.
* **Sprint 5:** Creation of the `analytics-ms` using a CQRS pattern for a high-performance dashboard.
* **Sprint 6:** Deployment of the architecture to AWS using Infrastructure as Code (Terraform/CDK).