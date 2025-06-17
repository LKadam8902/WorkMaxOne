# WorkMax

**WorkMax** is a **SAAS platform** that effectively streamlines task assignment to benched employees.

---

## 📌 Table of Contents
- [🧭 Overview](#-overview)
- [❓ Why WorkMax?](#-why-workmax)
- [⭐ Key Features](#-key-features)
- [⚒ Tech Stack](#-tech-stack)
- [🏛 Project Structure](#-project-structure)
  - [Backend (backend/workmax)](#backend-backendworkmax)
  - [Frontend (frontend/workmax)](#frontend-frontendworkmax)
- [⚙ Local Setup](#-local-setup)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
- [🕸 Database Design (Summary)](#-database-design-summary)
- [📄 Documentation](#-documentation)
- [🦾 Contributing](#-contributing)

---

## ⚡ Overview

WorkMax is a SAAS platform that effectively streamlines task assignment to benched employees.

## ❓ Why WorkMax?

It improves resource utilization across the organization and fosters greater transparency in **workload distribution** by efficiently tracking benched employee availability and skills. Ultimately, this leads to a **substantial reduction in benched duration** and a **notable boost in overall productivity**.

## 🔑 Key Features

- **Automatic Task-Benched Employee Matching**: Benched employees get automatically matched with available tasks based on bench duration and skillsets.
- **Scrum board type Task updation**: Benched employees can seamlessly update task progress.
- **Robust Security**: The Admin will be able to approve users.

## 🏹 Tech Stack

- **Frontend**: Angular Js
- **Backend**: Spring Boot (Java 24)
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: JPA / Hibernate
- **API**: REST
- **Authentication**: Spring Security with JWT
- **Deployment**: Docker, AWS, Railway (optional)

---

## 🌳 Project Structure

### Backend (backend/workmax)

- `model/`: JPA entities like `Employee`, `Benched Employee`, `Team Lead`, `Project`, `Task`, etc.
- `controller/`: REST API endpoints (Auth, Admin, Employee).
- `service/`: Business logic (`AuthService`, `BenchedEmployeeService`, `EmployeeRESTService`, etc.).
- `repository/`: JPA Repositories for database access.
- `security/`: JWT & OAuth2-based authentication setup.
- `config/`: Spring configuration (Cloudinary, Security).

### Frontend (frontend/my-angular-app)

- `components/`: All reusable UI and page components.
- `services/`: API communication logic.
- `context/`: Auth context provider.
- `assets/`: Images and static assets.
- `App.jsx`: Main app routing and structure.

---

## ⚙ Local Setup

### Prerequisites

- Java 24
- Angular Js
- PostgreSQL

### Clone the Repository

```bash
git clone [https://github.com/LKadam8902/WorkMaxOne.git](https://github.com/LKadam8902/WorkMaxOne.git)
```

### Backend Setup

Navigate into the backend directory and run the Spring Boot application:

```bash
cd backend/workmaxone/workmaxone
./gradlew bootRun
cd WorkMaxOne
```

### Frontend Setup
Navigate into the frontend directory, install dependencies, and start the development server:

```bash
cd frontend/my-angular-app
npm install
npm run dev
```

###Database Setup
Create the PostgreSQL database for WorkMax:

```SQL

CREATE DATABASE workmax;
\c workmax;
```

## 🕸 Database Design (Summary)

The WorkMax database is designed to efficiently manage employees, tasks, projects, and administrative functions. Below is a summary of the key tables and their primary attributes. For a detailed schema, please refer to the project Wiki.

-   **Admin**:
    -   `adminId` 
    -   `adminEmail` 
    -   `password` 

-   **Employee**:
    -   `employee_id` 
    -   `employeeName`
    -   `email` 
    -   `password` 
    -   `profileUrl` 
    -   `isApproved` 

-   **Team Lead**: 
    -   `teamLeadId` 
    -   `employee_id` 
    -   `project` 

-   **Benched Employee**: 
    -   `benchedEmployeeId` 
    -   `employee_id`
    -   `benchedDate` 
    -   `benchDuration`
    -   `skillSet` 
    -   `isTaskAssigned` 

-   **Task**:
    -   `taskId` 
    -   `name` 
    -   `skillSet` 
    -   `assignedTo` 
    -   `assignedBy` 
    -   `project` 
    -   `status` 
    -   `assignedDate`
      
-   **Project**:
    -   `projectId` 
    -   `projectName`
    -    `manager_id `


## 📄 Documentation

Comprehensive documentation for WorkMax is available in the project Wiki. This resource provides in-depth information about various aspects of the application.

-   **System Architecture**: An overview of how different components of WorkMax interact, including diagrams and explanations of the overall system design.
-   **API Reference**: Detailed documentation of all REST API endpoints, including request/response formats, authentication requirements, and example usage.
-   **Database Design**: The complete database schema, including table structures, relationships, indexes, and data types.
-   **Frontend/Backend Design**: Explanations of the design principles, architectural patterns, and key decisions made in both the frontend and backend development.
-   **Contribution Guidelines**: Essential information for developers who wish to contribute to the project, covering coding standards, commit messages, and the pull request process.

👉 [Go to Wiki]


## 🦾 Contributing

We welcome and appreciate contributions to WorkMax! Whether it's reporting bugs, suggesting new features, improving documentation, or submitting code, your input helps make this project better.

Before you start, please take a moment to read our [Contribution Guide]. This guide outlines:

-   How to set up your development environment.
-   The process for reporting issues.
-   Guidelines for suggesting new features.
-   Our coding standards and best practices.
-   The workflow for submitting pull requests.

We aim to foster a collaborative and respectful community. Thank you for considering contributing to WorkMax!
