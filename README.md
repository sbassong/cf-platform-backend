# Child-Free Platform - Backend

<p align="center">

  <h3 align="center">NestJS Backend for the Child-Free Community Platform</h3>
  <p align="center">
    A modular REST API and WebSocket server built with NestJS. It supports the social features, authentication, and real-time communication for the CF Platform.
    <br />
    <br />
    <a href="https://github.com/sbassong/cf-platform-frontend">View Frontend Repository</a>
  </p>
</p>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#database-seeding">Database Seeding</a></li>
    <li><a href="#running-tests">Running Tests</a></li>
    <li><a href="#architecture-overview">Architecture Overview</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## About The Project

This repository contains the server-side application for the **CF Platform**. It provides a robust API layer handling user identity, content management, social interactions, and real-time events. The architecture is built around Domain-Driven Design principles, separating concerns into distinct modules (Auth, User, Profile, Post, etc.) to ensure maintainability and scalability.

### Key Features

* **Hybrid Authentication**: supports both local strategy (email/password) and OAuth integration via JWTs and secure HTTP-only cookies.
* **Real-Time Messaging**: WebSocket gateway via **Socket.io** for instant private messaging and live notifications.
* **Comprehensive Profile System**: Decoupled User/Auth and Profile entities to allow for rich user expression while ensuring security.
* **Event & Group Management**: Dedicated modules for community building, including creating events and managing group memberships.
* **Security & Performance**:
    * Rate limiting via `@nestjs/throttler`.
    * Redis integration for caching and session management. (In progress)
    * Secure cookie handling with `cookie-parser`.
* **Cloud Storage**: AWS S3 integration for handling user avatar and banner uploads.

### Built With

* [NestJS](https://nestjs.com/)
* [TypeScript](https://www.typescriptlang.org/) 
* [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
* [Socket.io](https://socket.io/) 
* [Redis](https://redis.io/) - for future In-memory data store
* [Passport.js](https://www.passportjs.org/) - auth middleware
* [AWS SDK](https://aws.amazon.com/sdk-for-javascript/)

## Getting Started

To get the backend server running locally, follow these steps.

### Prerequisites

* **Node.js** (v20 or higher)
* **MongoDB** (Local instance or Atlas URI, but set up for Atlas)
* **Redis** (Local instance, not currently implemented)

### Installation

1.  Clone the repo
    ```bash
    git clone https://github.com/sbassong/cf-platform-backend.git
    ```
2.  Navigate into the project directory
    ```bash
    cd cf-platform-backend
    ```
3.  Install dependencies
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory. You can use the following template:

```env
# Application Settings
PORT=3001
FRONTEND_ORIGIN="http://localhost:3000"

# Database (Atlas URI or below local)
MONGO_URI="mongodb://localhost:27017/cf-platform"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Authentication (running `npx auth` generates secret automatically)
JWT_SECRET="your-super-secure-jwt-secret" 
JWT_EXPIRATION="7d"

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=10

# AWS S3 (for file uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="your-bucket-name"
```

## Usage

### Development Mode
Runs the server in watch mode, automatically restarting on file changes.
```bash
npm run start:dev
```

### Production Mode
Builds the application and runs the optimized production build.
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001` (or your configured PORT).

## Database Seeding

This project includes utility scripts to help you populate your local database with test data or clear it entirely.

* **Seed Database**: Populates the database with dummy users, posts, and comments.
    ```bash
    npm run db:seed
    ```

* **Clear Database**: **WARNING** - This will wipe all data from the configured MongoDB instance.
    ```bash
    npm run db:clear
    ```

## Running Tests

We use **Jest** for testing. The project includes both unit tests and end-to-end (e2E) tests.

* **Unit Tests**:
    ```bash
    npm run test
    ```

* **End-to-End Tests**:
    ```bash
    npm run test:e2e
    ```

* **Test Coverage**:
    ```bash
    npm run test:cov
    ```

## Architecture Overview

The backend is organized into **Feature Modules**. Each module typically contains:
* **Controller**: Handles incoming HTTP requests.
* **Service**: Contains the business logic.
* **Schema**: Defines the MongoDB data structure (Mongoose).
* **DTO (Data Transfer Object)**: Defines the shape of data sent over the network.

### Core Modules
* **`src/auth/`**: Authentication strategies (Local, JWT) and guards.
* **`src/user/`**: Manages User accounts (credentials, settings).
* **`src/profile/`**: Manages public user data (bio, interests, avatar).
* **`src/messaging/`**: Handles WebSocket connections for chat.
* **`src/post/`**: Logic for the news feed, posts, and likes.
* **`src/search/`**: Dedicated endpoint for searching users and groups.

---

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

---

## Contact

Samuel Bassong – sam.bassong@gmail.com - [linkedin.com/in/sambassong](https://www.linkedin.com/in/sambassong/)