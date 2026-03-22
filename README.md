file # Lendsqr Admin Console — Frontend Assessment

> A pixel-faithful React + TypeScript implementation of the Lendsqr Admin Console, built as part of the Lendsqr Frontend Engineering Assessment.

---

## Live Demo

**App URL:** `https://shittu-qudus-lendsqr-fe-test.vercel.app/`  


---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Mock API](#running-the-mock-api)
- [Running Tests](#running-tests)
- [Pages](#pages)
- [Key Implementation Decisions](#key-implementation-decisions)

---

## Overview

This project implements three core pages of the Lendsqr Admin Console:

- **Login** — authenticated entry point
- **Dashboard** — summary metrics and navigation shell
- **Users** — paginated table of 500 mock users fetched from a local REST API
- **User Details** — tabbed detail view with cached user data via LocalStorage / IndexedDB

---

## Tech Stack

| Technology | Role |
|---|---|
| React + Vite | UI framework with fast HMR dev server |
| TypeScript | Type safety and self-documenting interfaces |
| SCSS Modules | Scoped, component-level styles |
| React Router v6 | Declarative routing with nested layout support |
| JSON Server | Local mock REST API serving 500 user records |
| Axios | HTTP client for API requests |
| LocalStorage / IndexedDB | Client-side caching of user detail records |
| Vitest + React Testing Library | Unit and component testing |

---

## Project Structure

```
lendsqr/
├── api/                 # Vercel serverless functions
│   └── users/           # API endpoints (/api/users)
├── src/
│   ├── components/      # Reusable UI (Header, Sidebar, User)
│   ├── pages/           # Route-level views (Login, Dashboard, UserDetails)
│   ├── context/         # SearchContext.tsx (Global search state)
│   ├── Usercachedb.ts   # IndexedDB 
│   └── App.tsx          # Route definitions
├── server.cjs           # Local API server script
├── db.json              # 500-record mock dataset 
└── vercel.json          # Deployment configuration
```

> Every component and page owns its `.module.scss` for scoped styles and a `.test.tsx` for isolated unit tests.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/shittu-qudus/lendsqr-fe-test.git
cd lendsqr-fe-test

# Install dependencies
npm install
```

### Start the Development Server

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## Running the Mock API

The Users and User Details pages fetch data from a local JSON Server instance.  
Open a **separate terminal** and run:

```bash
node server.cjs
```

Mock API runs at **http://localhost:3001**

| Endpoint | Description |
|---|---|
| `GET /users` | Returns all 500 user records |
| `GET /users/:id` | Returns a single user by ID |

> `db.json` was generated using [json-generator.com](https://json-generator.com) with a custom schema derived from the Figma design fields.

---

## Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage
```

Tests are written with **Vitest** and **React Testing Library**.  
Both positive (happy path) and negative (error/empty) scenarios are covered for the Login and User Details pages.

---

## Pages

### Login `/`
- Controlled form with email and password inputs
- Inline validation — shows error if either field is empty
- Password show/hide toggle with `aria-pressed` accessibility attribute
- Navigates to `/dashboard` on successful submission

### Dashboard `/dashboard`
- Summary metric cards
- Persistent Header and Sidebar via `DashboardLayout`
- Fully responsive — sidebar collapses to off-canvas drawer on mobile

### Users `/users`
- Fetches 500 records from the JSON Server mock API
- Renders a structured, dynamic table
- Clicking a row caches the user object and navigates to the detail page

### User Details `/users/:id`
- Retrieves cached data from LocalStorage / IndexedDB
- Falls back to a direct API call if cache is stale or absent
- Tabbed view: General Details, Documents, Bank Details, Loans, Savings, App & System
- Back to Users button navigates to the previous page

---

## Key Implementation Decisions

**SCSS Modules over global CSS**  
Each component has its own `.module.scss`. Class names are scoped at build time, preventing collisions and making components self-contained.

**DashboardLayout for shared chrome**  
Header and Sidebar are mounted once inside `DashboardLayout` and persist across all protected routes via React Router's `<Outlet />` — no re-mounting on navigation.

**ErrorBoundary for resilience**  
Wraps the entire app to catch uncaught render errors and show a fallback UI instead of a blank screen.

**LocalStorage + IndexedDB caching**  
User objects are written to cache on row click. The detail page reads from cache first, avoiding redundant network requests. `isCacheStale()` enforces a TTL to keep data fresh.

**React Context for search**  
`SearchContext` holds the global search query. It avoids prop-drilling between the Header (input) and Users page (filter logic) without the overhead of a state management library.

**JSON Server for mock API**  
Gives a fully functional REST API from a single JSON file. Reviewers can run the complete stack with two commands — no backend setup required.

---

## Deployment

Deployed on **[Vercel ]** following the required URL format:

```
 https://shittu-qudus-lendsqr-fe-test.vercel.app/
```

---

## Author

**Shittu Qudus Adekunle**  
Frontend Engineer — React + TypeScript