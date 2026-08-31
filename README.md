# ModernTech Solutions HR System

ModernTech Solutions is a growing company expanding into European and Asian
markets. This system gives their HR staff a single place to manage employee
records, run payroll calculations, and process time-off requests, with all
data persisted in a MySQL database and protected behind secure login.

## Tech Stack

- **Node.js** — JavaScript runtime powering the backend server
- **Express** — web framework used to build the REST API
- **MySQL** — relational database storing employees, departments, users, and time-off requests
- **mysql2** — Node.js driver used to query MySQL with prepared statements
- **bcrypt** — hashes user passwords before they are stored
- **jsonwebtoken (JWT)** — issues and verifies login tokens for authentication
- **cors** — allows the Vue frontend to make requests to the API
- **dotenv** — loads database credentials and secrets from environment variables
- **Vue 3** — builds the reactive frontend interface (via CDN, no build step)
- **Bootstrap 5** — styling and layout

## Prerequisites

- Node.js installed, with npm available in the terminal
- MySQL running on **port 3307** (via XAMPP)
- A `.env` file inside `backend/` (see Environment Variables below)

## Environment Variables

Create a `.env` file inside `backend/` with the following (placeholder values shown — do not commit real credentials):

```
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=moderntech_hr
PORT=5000
JWT_SECRET=your_secret_key_here
```

## Database Setup

1. Start MySQL in XAMPP (port 3307).
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Click the **SQL** tab and run the following:

```sql
CREATE DATABASE IF NOT EXISTS moderntech_hr;
USE moderntech_hr;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'hr_staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(50),
  job_title VARCHAR(150) NOT NULL,
  department_id INT NOT NULL,
  employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-Time',
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  hours_per_week INT NOT NULL DEFAULT 40,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  address VARCHAR(255),
  emergency_contact VARCHAR(150),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE time_off_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Annual Leave',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

4. Seed sample data (departments, 16 employees, 5 time-off requests) using
   the full INSERT statements provided separately in the project setup, or
   add your own records through the running application.

## Installation

1. Clone this repository.
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Create the `.env` file inside `backend/` as described above.
4. The frontend has no build step — it runs directly via `index.html` in a browser.

## How to Run

1. Start the backend:
   ```
   cd backend
   npm start
   ```
   The API runs at `http://localhost:5000`.
2. Open `frontend/index.html` directly in a browser.
3. Log in with a registered user account (create one via the
   `POST /api/auth/register` endpoint if none exist yet).

## API Endpoints

| Method | Endpoint                     | Description                                      | Auth required |
|--------|-------------------------------|---------------------------------------------------|----------------|
| POST   | /api/auth/register            | Create a new HR user account                       | No             |
| POST   | /api/auth/login                | Log in and receive a JWT token                     | No             |
| GET    | /api/employees                 | Get all employees (with department info)           | Yes            |
| GET    | /api/employees/:id              | Get a single employee by ID                         | Yes            |
| POST   | /api/employees                 | Create a new employee                              | Yes            |
| PUT    | /api/employees/:id              | Update an existing employee                          | Yes            |
| DELETE | /api/employees/:id              | Delete an employee                                  | Yes            |
| GET    | /api/departments                | Get all departments                                 | Yes            |
| GET    | /api/timeoff                   | Get all time-off requests                            | Yes            |
| POST   | /api/timeoff                   | Submit a new time-off request (status: Pending)      | Yes            |
| PUT    | /api/timeoff/:id                | Update a request's status (Approved/Denied/Pending)   | Yes            |

Protected routes require an `Authorization: Bearer <token>` header,
obtained by logging in.

## Authentication Approach

This project uses **JWT (JSON Web Tokens)** combined with **bcrypt**
password hashing, as required for the Node.js stack.

- On registration, the user's password is hashed with `bcrypt.hash()`
  before being stored — plain-text passwords are never saved.
- On login, the submitted password is compared against the stored hash
  using `bcrypt.compare()`.
- On a successful login, the server signs a JWT containing the user's id,
  email, and role, valid for 8 hours.
- The frontend stores this token and sends it in the `Authorization`
  header on every subsequent request.
- A middleware function (`verifyToken`) checks this header on every
  protected route, rejecting the request with a 401 if the token is
  missing or invalid before any database query runs.

JWT was chosen over server-side sessions because it fits naturally with a
stateless REST API — the server doesn't need to keep any session data in
memory, and the same token approach scales cleanly if the API is deployed
separately from the frontend.

## Project Structure

```
moderntech_hr/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── employeeModel.js
│   │   ├── departmentModel.js
│   │   └── timeoffModel.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── departmentController.js
│   │   └── timeoffController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── departmentRoutes.js
│   │   └── timeoffRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── index.html
│   ├── main.js
│   ├── api.js
│   ├── style.css
│   └── components/
│       ├── Login.js
│       ├── Dashboard.js
│       ├── Employees.js
│       ├── Payroll.js
│       ├── Timeoff.js
│       └── Attendance.js
└── README.md
```

## Screenshots

## Screenshots

**Login**
![Login screen](login%20screen%20.png)

**Dashboard**
![Dashboard](DASHBOARD%20SCREEN%20.png)

**Employees**
![Employees page](EMPLOYEES%20SCREEN.png)

**Payroll**
![Payroll page](PAYROLL%20SCREEN.png)

**Time Off**
![Time off page](TIMEOFF%20SCREEN.png)

## Author

Saabir moefar, Life Choices Academy YouthCode Off-Site, Cohort 2
