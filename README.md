# expenseTracker Backend

This project is a Java Spring Boot backend for an Expense Tracker application, providing essential features for personal finance management including transaction tracking, category management, and user authentication.

## Features

- **User Management**: Registration, authentication
- **Transaction Tracking**: Record one-time or recurring transactions
- **Category Management**: Organize transactions by customizable categories
- **Currency Exchange**: Convert your savings or transcations
- **Budgeting**: See your Monthly and annualy financial state
- **Visauliaze**: Pie Charts to visualize your income - expense distrubitions by categorys
- **Savings**: Add your savings and track
- **Security**: JWT-based authentication and authorization

## Tech Stack

- **Backend**: Java, Spring Boot, Spring Security
- **Database**: PostgreSQL
- **Authentication**: JWT-based security

## Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

Before you begin, ensure that you have the following installed:

- **Java 17 or higher**
- **Maven**
- **PostgreSQL**
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shyesilbas/expenseTracker.git
   cd expenseTracker
   ```

2. **Set up the Database**:
   - Create a PostgreSQL database named `expenseTracker`.
   - Update the `application.properties` file located in `src/main/resources/` with your database credentials:

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/expenseTracker
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

### Build and Run the Project

1. **Build the project**:
   ```bash
   mvn clean install
   ```

2. **Run the project**:
   ```bash
   mvn spring-boot:run
   ```

### Access the Application

Once the backend is running, you can access it at the following URL:

- **Backend URL**: [http://localhost:8080](http://localhost:8080)

### API Documentation

You can access all the API endpoints via Swagger UI at:

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the repository**.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add your feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/your-feature
   ```
5. **Open a Pull Request** to the main repository.
