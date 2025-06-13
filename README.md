# 🌍 TravelMate

**TravelMate** is a social travel platform that allows explorers to create a visually engaging travel portfolio, log journeys, write travel blogs, and collaborate with friends on upcoming trips — all in one place.

---

## 📌 Table of Contents
  - [🧭 Overview](#-overview)
  - [❓ Why TravelMate?](#-why-travelmate)
  - [🌟 Key Features](#-key-features)
  - [🛠 Tech Stack](#-tech-stack)
  - [🛠️ Project Structure](#️-project-structure)
    - [Backend (`travelmate-backend`)](#backend-travelmate-backend)
    - [Frontend (`travelmate-frontend`)](#frontend-travelmate-frontend)
  - [💻 Local Setup](#-local-setup)
    - [Prerequisites](#prerequisites)
    - [Clone the Repository](#clone-the-repository)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [Database Setup](#database-setup)
  - [📊 Database Design (Summary)](#-database-design-summary)
  - [🚀 Deployment](#-deployment)
  - [📖 Documentation](#-documentation)
  - [🤝 Contributing](#-contributing)

---

## 🧭 Overview

TravelMate is your digital travel companion. It transforms scattered travel memories into a **data-rich**, **shareable**, and **interactive** experience that others can explore for inspiration.

---

## ❓ Why TravelMate?

- ✨ Travel memories often get buried in phone galleries or cloud folders.
- 🔍 New travelers lack trusted, personalized recommendations.
- 🌐 Influencers and bloggers need a one-link showcase.
- 🤝 Collaborating on itineraries via chats or spreadsheets is inefficient.

---

## 🌟 Key Features

- 📸 **Bento Grid Layout** – Show travel highlights in a card-based visual grid.
- 📝 **Write Blogs** – Share deep insights and travel tips with the community.
- 🗺️ **Interactive World Map** – Auto-update places you've visited.
- 📊 **Travel Stats** – View stats like "12 states visited", "2 countries explored".
- 🤝 **Collaborate** – Co-plan trips with friends in-app.
- 🔗 **Affiliate Support** – Embed links to gear or services you recommend.
- 🔔 **Social Feed** – Follow others to receive real-time updates.

---

## 🛠 Tech Stack

- **Frontend**: React.js
- **Backend**: Spring Boot (Java 24)
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: JPA / Hibernate
- **API**: REST
- **Authentication**: Spring Security with JWT
- **Deployment**: Docker, AWS, Railway (optional)

---

## 🛠️ Project Structure

### Backend (`travelmate-backend`)

- `model/`: JPA entities like `User`, `Journey`, `Trip`, etc.  
- `controller/`: REST API endpoints (Auth, Journey, User).  
- `service/`: Business logic (AuthService, JourneyService).  
- `repository/`: JPA Repositories for database access.  
- `security/`: JWT & OAuth2-based authentication setup.  
- `config/`: Spring configuration (Cloudinary, Security).  

### Frontend (`travelmate-frontend`)

- `components/`: All reusable UI and page components.  
- `services/`: API communication logic.  
- `context/`: Auth context provider.  
- `assets/`: Images and static assets.  
- `App.jsx`: Main app routing and structure.  

---

## 💻 Local Setup

### Prerequisites

- Java 24  
- Node.js 18+  
- PostgreSQL  

### Clone the Repository

```bash
git clone https://gitlab.com/capstone-12/TravelMate.git
cd TravelMate
```

### Backend Setup

```bash
cd backend
./gradlew bootRun
```

- Update `application.properties` with your PostgreSQL credentials.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

```sql
CREATE DATABASE travelmate;
\c travelmate;
```

---

## 📊 Database Design (Summary)

- **User**: id, username, email, password, bio, avatar  
- **BlogPost**: id, user_id, title, content, location, created_at  
- **Collaboration**: id, trip_name, participants  
- **TravelStats**: id, user_id, countries_visited, cities_visited  

*(Detailed schema available in Wiki)*

---

## 📖 Documentation

Full documentation is available in the project Wiki:

- System Architecture  
- API Reference  
- Database Design  
- Frontend/Backend Design 
- Contribution Guidelines  

👉 [Go to Wiki](https://gitlab.com/capstone-12/TravelMate/-/wikis/home)

---

## 🤝 Contributing

We welcome contributions! Please read our [Contribution Guide](https://gitlab.com/capstone-12/TravelMate/-/wikis/contribution_guide) before submitting a pull request.

---
