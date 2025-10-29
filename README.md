# How to run the project?

I use Docker containers to run all the necessary staff to run the system. There are four containers for the system -
Backend(NestJs), Frontend(NextJs), Database(Postgre), and Redis. So make sure Docker is installed in your machine.

## Start the containers

Run these commands in the project root directory.

```bash
# This will start the all containers and run migration
make up
```  

## Run Department Seeder

```bash
# This is only need for the first time to create department data.
make db-seed-department
```

## Running

The frontend will be serving on

```
http://localhost:3000
```

And the backend APIs are running at

```
http://localhost:5000
```

## Frontend Endpoints

| Endpoint          | Description                                           | Method |  TYPE   |
|:------------------|:------------------------------------------------------|:------:|:-------:|
| /login            | Employee Login with reCAPTCHA and Google OAuth        |  GET   | Public  |
| /register         | Employee Registration with reCAPTCHA and Google OAuth |  GET   | Public  |
| /dashboard        | View All Department List                              |  GET   | Public  |
| /departments/{id} | View Staff list for the specific department           |  GET   | Guarded |
| /otp              | Verify OTP                                            |  GET   | Public  |

## Backend Endpoints

| Endpoint                  | Description                                       | Method |  TYPE   |
|:--------------------------|:--------------------------------------------------|:------:|:-------:|
| /api/auth/login           | Employee Login with reCAPTCHA and generate tokens |  POST  | Public  |
| /api/auth/register        | Employee Registration with reCAPTCHA              |  POST  | Public  |
| /api/auth/verify-email    | Verify Employee Email via token                   |  GET   | Public  |
| /api/auth/me              | Get Authenticated User Data                       |  GET   | Guarded |
| /api/auth/refresh-token   | Refresh Access Token using Refresh Token Cookie   |  POST  | Public  |
| /api/auth/logout          | Logout and Clear Refresh Token                    |  POST  | Guarded |
| /api/auth/google          | Initiate Google OAuth Login                       |  GET   | Public  |
| /api/auth/google/callback | Google OAuth Callback and Token Issuance          |  GET   | Public  |
| /api/auth/otp/request     | Request OTP for Two-Factor Authentication         |  POST  | Public  |
| /api/auth/otp/verify      | Verify OTP to Complete Login/Verification         |  POST  | Public  |
