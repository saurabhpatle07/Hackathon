# Logistics Predictive Maintenance App

This is a full-stack application with an Angular frontend and a FastAPI backend. It features JWT authentication, Role-Based Access Control (RBAC), real-time data visualization using WebSockets, and a maintenance calendar.

## Prerequisites

- Node.js & npm
- Python 3.x

## Project Structure

```
Hackathon/
├── package.json                 # Root configuration for unified startup
├── backend/                     # FastAPI Backend
│   ├── main.py                  # Main application logic (API, Auth, WebSocket)
│   └── requirements.txt         # Python dependencies
└── logistics-maintenance-app/   # Angular Frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── login/           # Login page
    │   │   │   ├── dashboard/       # Main dashboard (container)
    │   │   │   ├── maintenance-input/ # Input form (User & Admin)
    │   │   │   ├── temperature-graph/ # Real-time graph (Admin only)
    │   │   │   └── calendar/        # Maintenance calendar (Admin only)
    │   │   ├── guards/
    │   │   │   └── auth.guard.ts    # Route protection
    │   │   ├── interceptors/
    │   │   │   └── auth.interceptor.ts # Attaches JWT to requests
    │   │   └── services/
    │   │       ├── api.service.ts   # General API calls
    │   │       └── auth.service.ts  # Auth logic (Login, Token, Roles)
    │   └── ...
    └── ...
```

## Logic Flow & Key Files

### 1. Authentication (JWT & RBAC)

**Backend (`backend/main.py`):**
- **Endpoint:** `POST /token`
- **Logic:** Validates credentials (hardcoded `admin`/`admin` or `user`/`user`).
- **Token:** Generates a JWT containing the `sub` (username) and `role` (`admin` or `user`).
- **Protection:** `get_current_user` dependency validates the token on protected routes.

**Frontend:**
- **`auth.service.ts`:**
    - `login()`: Posts to `/token` and saves `access_token` in `localStorage`.
    - `getRole()`: Decodes the JWT to extract the user role.
    - `isAdmin()` / `isUser()`: Helper methods for permission checks.
- **`auth.guard.ts`:** Prevents access to the dashboard if no token is present.
- **`auth.interceptor.ts`:** Automatically adds `Authorization: Bearer <token>` header to all HTTP requests.

### 2. Dashboard & Authorization

**Frontend (`dashboard.component.html`):**
- Uses `*ngIf="authService.isAdmin()"` to conditionally render the **Temperature Graph** and **Calendar**.
- **Users** only see the Maintenance Input form.
- **Admins** see all three components.

### 3. Real-time Temperature Graph (WebSocket)

**Backend (`backend/main.py`):**
- **Endpoint:** `WebSocket /ws/temperature`
- **Security:** Expects a `token` query parameter. Decodes it and **rejects** the connection (Close Code 1008) if the role is not `admin`.
- **Logic:** Fetches data from Open-Meteo API every 2 seconds and streams it to the client.

**Frontend (`temperature-graph.component.ts`):**
- **Connection:** `new WebSocket('ws://localhost:8000/ws/temperature?token=' + token)`
- **Security:** Checks for `1008` close code. If received (meaning unauthorized), it **stops reconnecting** to prevent infinite loops.

### 4. Maintenance Calendar

**Backend (`backend/main.py`):**
- **Endpoint:** `GET /api/maintenance/events`
- **Logic:** Returns a list of dummy maintenance events. Protected by `get_current_user`.

**Frontend (`calendar.component.ts`):**
- Uses `FullCalendar` library.
- Fetches events from `ApiService` (which calls the backend).

## Setup & Running

1.  **Install Dependencies:**
    ```bash
    # Root
    npm install

    # Backend
    cd backend
    pip install -r requirements.txt
    
    # Frontend
    cd logistics-maintenance-app
    npm install
    ```

2.  **Run the Application:**
    From the root `Hackathon` directory:
    ```bash
    npm start
    ```
    This command uses `concurrently` to start both the FastAPI server (port 8000) and Angular app (port 4200).

3.  **Access:**
    - Open `http://localhost:4200`
    - **Admin:** `admin` / `admin`
    - **User:** `user` / `user`
