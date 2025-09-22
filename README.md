# RideShare

## Overview

- RideShare is a web application designed to facilitate the sharing of vehicles such as cars, bikes, and e-scooters. Users can borrow available vehicles, offer their own vehicles for borrowing, and manage their bookings and vehicle listings. The application also provides a dashboard for vehicle owners to track bookings and view statistics.

- This backend is built using Node.js, TypeScript, and Mikro-ORM, with PostgreSQL as the database running inside a Docker container. Jest is used for testing.

- The frontend is built using React, Vite as the build tool and development server, providing a fast and efficient environment for development. For the user interface design, Chakra UI is employed, offering a modular and accessible component library that allows for the rapid creation of visually appealing and responsive layouts. Additionally, JWT (JSON Web Tokens) is integrated to handle secure authentication and authorization, ensuring that user sessions are managed safely and efficiently.


## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Environment Variables](#environment-variables)
- [Frontend Routes](#frontend-routes)
- [App Features](#app-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)



## Prerequisites

Before you start, make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)

## Installation

Follow these steps to get the backend and frontend running on your local machine:

### 1. Clone the Repository

First, clone the repository from GitHub:

```bash
git clone https://code.fbi.h-da.de/stslbenha/rideshare-fwe.git
cd rideshare-backend
```
### 2. Install Dependencies

- Install node modules for frontend: 
    ```bash
    cd frontend 
    ```
    ```bash
    npm install
    ```
    
- Install node modules for backend: 
    ```bash
    cd backend 
    ```
    ```bash
    npm install
    ```

### 3. Create Environment Variables

Create a `.env` file in the root directory of the backend and add the necessary environment variables.

an .env file is already configured for this project, you can find it in the root directory of the backend.

### 4. Start the Database

If you have Docker installed and running, you can use the included Docker Compose file to start the PostgreSQL database:

```bash
docker-compose up
```
```bash
npm run schema:fresh
```

### 5. Start the Server

To start the server, navigate to the backend folder and run:

```bash
npm run start
```

The server will start on `http://localhost:3400`.

### 6. Start the frontend

- Navigate to the frontend folder and run the frontend :
    ```bash
    npm run dev
    ```

### Running backend Tests

To run the tests, run:

```bash
npm run test
```

The tests in the Pipline fail because we couldn't inegrate docker in the Pipline, which is essetial to run the tests.

### Running frontend Tests

To run the tests, run:

```bash
npm run test
```

## Backend Structure

Here is a brief overview of the project's structure:
```
├── src/
│ ├── controllers/ # API controllers
│ ├── entities/ # Mikro-ORM entities (User, Vehicle, Booking)
│ ├── middleware/ # Express middleware (Auth, sendMail)
│ ├── Seeders/ # Database seeders for initial data
│ ├── types/ # Database seeders for initial data
│ ├── uploads/ # Utility functions
│ ├── index.ts # Entry point of the application
│ ├── mikro-orm.config.ts # Mikro-ORM configuration
├── tests/ # Jest test cases
├── .env # Environment variables
├── jest.config.js # Jest configuration
├── Dockerfile # Docker configuration for the app
├── docker-compose.yml # Docker Compose configuration for services
├── package.json # Node.js dependencies and scripts
├── package-lock.json # Lock file for Node.js dependencies
├── tsconfig.json # TypeScript configuration
└── README.md # Project documentation
```

**controllers**: API controllers define the routes and request handling logic for the application.

**entities**: Mikro-ORM entities define the database schema and relationships.

**middleware**: Express middleware functions for handling requests before they reach the route handler. We use JWT authentication and email sending middleware.

**Seeders**: Database seeders for initial data.

**types**: Custom types and interfaces used in the application.

**uploads**: Utility functions for file uploads and other tasks.

**index.ts**: Entry point of the application.

**mikro-orm.config.ts**: Mikro-ORM configuration file.

**tests**: Jest test cases for the application.

**.env**: Environment variables for the application.

## Frontend Structure

- [src](./src): This directory contains all the source code.
  - [pages](frontend/src/Pages): This folder containes all Pages of the App.
  - [provider](frontend/src/provider): Contains context providers for managing state across the app, such as authentication and vehicle data.
  - [appRoutes](frontend/src/AppRoutes.tsx): All Routes are defined here including their Pages. 
  - [hooks](frontend/src/hooks): Contains custom React hooks that encapsulate reusable logic, including interactions with localStorage for persistent state management. These hooks manage tasks such as data fetching, state management, and storing or retrieving data from localStorage, ensuring cleaner and more modular components across the application.

## Environment Variables

The following environment variables are used in the project:

- `PORT`: The port on which the server will run (default: 3400)
- `NODE_ENV`: The environment in which the server is running (development, test, production)
- `DB_HOST`: The host of the PostgreSQL database
- `DB_PORT`: The port of the PostgreSQL database
- `DB_USER`: The username of the PostgreSQL database
- `DB_PASSWORD`: The password of the PostgreSQL database
- `DB_NAME`: The name of the PostgreSQL database
- `JWT_SECRET`: The secret key for generating JWT tokens
- `JWT_EXPIRES_IN`: The expiration time for JWT tokens
- `SMTP_HOST`: The SMTP host for sending emails
- `SMTP_PORT`: The SMTP port for sending emails
- `SMTP_USER`: The SMTP username
- `SMTP_PASSWORD`: The SMTP password
- `SMTP_SECURE`: Whether to use a secure connection (true or false)
- `SMTP_SENDER_ADDRESS`: The email address from which emails will be sent

## Frontend Routes

- **Log In [/login]:** A Login Page where users can login using their unique credentials.

- **Register [/register]:** New Users can create their own account.

- **Home Page [/]:** Displays all vehicles available for borrowing. Users can browse through and filter cars, bikes, and e-scooters and choose one to borrow.
- **My Vehicles [/vehicles]:** Allows users to view all the vehicles they own. Users can also add new vehicles to the platform.

- **My Bookings [/bookings]:** Shows a list of all the vehicles that the user has booked. Users can manage their current and past bookings from this page. 
A Booking can only be started, if the Start Time is reached. When the ride is finisched, the User can end the Bookings and afterwards go ahead the payment.

- **My Dashboard [/dashboard]:** Provides vehicle owners with an overview of all the bookings made using their vehicles. This page also displays relevant statistics, such as total earnings and earnings of a specific month.

- **My Profile [/profile]:** Displays user information and allows users to edit their profile details, such as name, email, and profile picture.

- **Payment Success [/payment-success]:** Displays a confirmation message when a payment is successfully completed. 

- **Payment Failure [/payment-failed]:** Informs the user when a payment fails, providing options to retry or seek assistance.

## App Features:

#### Vehicle Management

- **Borrow Vehicles:** Users can browse the available vehicles on the main page and choose one to borrow. Each vehicle listing includes details such as type, availability, and owner information. To facilate this process, filters are also possible that showes the user exactly what he needs, for example vehicles in a specific city, or a maximum price.

- **Add Vehicles:** Users can list their vehicles (cars, bikes, e-scooters) for borrowing on the My Vehicles page. They can provide details such as vehicle type, Brand, Model, price and availability.

- **Manage Bookings:** Users can view and manage all their current and past bookings on the My Bookings page. They can also cancel or modify bookings if needed. And using the filters, users can check if they have unpaid bookings so that the can pay.

#### Payments

- **PayPal Integration:** The application includes PayPal integration for secure and convenient payments. Users can complete their transactions using PayPal when borrowing a vehicle.

- **Payment Success and Failure Handling:** After a payment is processed, users are redirected to either a payment success page or a payment failure page, depending on the outcome of the transaction.

#### Email Notifications

- When a user makes a new booking, an email is automatically sent to both the user and the vehicle owner. The email contains specific information about the booking, such as the vehicle details, booking period, and price, ensuring both parties are well-informed.


#### Dashboard and Statistics

- **Bookings Overview:** The My Dashboard page provides vehicle owners with a summary of all bookings made with their vehicles. Owners can see which vehicles are the most popular and track their earnings.

- **Statistics:** The dashboard includes visual statistics on vehicle usage, such as the number of bookings per vehicle and earnings over time.

#### User Profile

- **Profile Management:** Users can view and edit their profile information on the My Profile page. This includes updating their name, email, profile picture, and other personal details.

#### Authentication

- **JWT-Based Authentication:** The application uses JSON Web Tokens (JWT) for secure user authentication and session management.

## Troubleshooting

If you encounter any issues while setting up the project, please refer to the [Troubleshooting](https://code.fbi.h-da.de/stslbenha/rideshare-fwe/-/blob/main/README.md#troubleshooting) section of the frontend README.

If you still have issues, please open a new issue in the repository.

## Contributing

If you want to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Create a new Pull Request
7. Wait for your PR to be reviewed
8. Get your PR merged
9. Celebrate 🎉
10. Repeat

## License

This project is licensed under the MIT License - see the [LICENSE](https://code.fbi.h-da.de/stslbenha/rideshare-fwe/-/blob/main/LICENSE) file for details.


### Notes:

- **Project Structure**: I included an overview of the project structure to help users understand where everything is located.
- **Environment Variables**: Detailed instructions on how to set up the environment variables are crucial, as they are often the cause of issues.
- **Database Setup**: Instructions for setting up the PostgreSQL database with Docker are provided, including how to run migrations and seed the database.
- **Running Tests**: I explained how to run the tests using Jest and provided troubleshooting tips for common issues.
- **Docker Commands**: Added useful Docker commands to manage the PostgreSQL container, which might be useful during development.

This README provides a comprehensive guide to getting the Rideshare project up and running.




