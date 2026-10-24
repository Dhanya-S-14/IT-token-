# 🛠️ IT Token – IT Support Ticket Management System

## 📌 About the Project

**IT Token** is a web-based IT support ticket management system designed to help employees quickly report technical issues and allow the IT team to manage and resolve those issues efficiently.

Employees can create a support token whenever they face an IT-related problem such as a **laptop issue, software problem, network problem, system error, or other technical difficulties**.

The Technical Lead/Admin can view all submitted tokens from a centralized dashboard, check the issue details, prioritize requests, and take the necessary action as soon as possible.

The main goal of this project is to make the IT support process **faster, organized, transparent, and easier to manage**.

---

## 🎯 Problem Statement

In many organizations, employees report technical problems through calls, messages, or emails. This can make it difficult for the IT team to:

* Track all reported issues
* Identify urgent problems
* Know which issues are pending
* Track resolved issues
* Prioritize emergency requests
* Maintain a proper history of IT support requests

**IT Token** solves this problem by providing a centralized platform for managing IT support requests.

---

## 💡 How IT Token Works

### 👨‍💼 Employee

An employee can:

1. Log in to the system.
2. Create an IT support token.
3. Select the type of issue.
4. Describe the problem.
5. Submit the request.
6. Track the status of the request.

Example:

> **Issue:** Laptop is not connecting to Wi-Fi
> **Priority:** High
> **Description:** Employee is unable to connect to the office network.

A unique token is generated for the request.

### 👨‍💻 Technical Lead / Admin

The Technical Lead acts as the **Admin** of the system.

The Admin can:

* View all IT support tokens
* View employee issue details
* Identify emergency/high-priority issues
* Assign or handle support requests
* Update ticket status
* Track pending issues
* Mark issues as resolved
* Monitor all requests from one dashboard

---

## 🔄 Ticket Workflow

```text
Employee
   ↓
Reports IT Issue
   ↓
IT Token Created
   ↓
Admin Dashboard
   ↓
Technical Lead Reviews Issue
   ↓
Issue Prioritized
   ↓
Technical Team Takes Action
   ↓
Issue Resolved
   ↓
Token Status Updated


## 🚨 Example IT Issues

The system can be used to report issues such as:

* 💻 Laptop not working
* 🌐 Internet / Network problems
* 🔐 Password or account problems
* 🖨️ Printer issues
* 📧 Email problems
* 🧩 Software installation issues
* ⚙️ System errors
* 🔌 Hardware problems
* 🔑 Access permission issues
* 🚨 Emergency technical issues

---

## ✨ Key Features

### Employee Features

* Employee login
* Create IT support token
* Select issue category
* Add issue description
* Set issue priority
* View submitted requests
* Track ticket status
* View token details

### Admin Features

* Admin dashboard
* View all support tickets
* View employee details
* Filter tickets by status
* Filter tickets by priority
* Manage emergency requests
* Update ticket status
* Track pending requests
* Mark tickets as resolved
* Centralized IT support management


## 📊 Dashboard

The Admin dashboard provides a centralized view of the organization's IT support requests.

Example dashboard information:

## 🏗️ System Architecture

```text
              ┌─────────────────┐
              │    Employee     │
              └────────┬────────┘
                       │
                       │ Create Ticket
                       ▼
              ┌─────────────────┐
              │   IT Token Web  │
              │   Application   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    Database     │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Admin Dashboard │
              │ Technical Lead  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Issue Resolution│
              └─────────────────┘
```


## 🛠️ Technologies Used

Update this section according to the technologies you actually used.

* **Frontend:** HTML, CSS, JavaScript / React.js
* **Backend:** Node.js / Express.js or Python / Flask
* **Database:** MongoDB / MySQL
* **Authentication:** Login & Role-Based Access
* **Version Control:** Git & GitHub


## 👥 User Roles

The system mainly contains two roles:
employee and admin

## 📌 Ticket Status

Each token can have a status such as:

| Status         | Meaning                                 |
| -------------- | --------------------------------------- |
| 🟡 Pending     | Issue has been reported but not started |
| 🔵 In Progress | Technical team is working on the issue  |
| 🟢 Resolved    | Issue has been successfully resolved    |
| 🔴 Emergency   | Issue requires immediate attention      |

---

## 🚀 Future Enhancements

The project can be further improved by adding:

* Automatic ticket prioritization
* Technician assignment
* Ticket comments and communication
* File/image attachment for issue proof
* Response-time tracking
* IT support analytics
* Monthly support reports
* AI-based issue categorization
* AI-based priority prediction

## 🎯 Project Objective

The main objective of **IT Token** is to create a centralized IT support system where employees can easily report technical problems and the IT/Technical Lead can quickly identify, prioritize, and resolve those problems.

It reduces dependency on informal communication such as phone calls and messages and provides a **structured and trackable IT support workflow**.

---
## ⚙️ Installation & Setup

Clone the repository:

```bash
git clone https://github.com/Dhanya-S-14/it-token.git


Navigate to the project:

```bash
cd it-token
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Then open the application in your browser.

```text
http://localhost:3000
```

---

## 🤝 Contribution

Contributions are welcome.

If you would like to improve the project:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Create a Pull Request

---


## 👩‍💻 Author

**Dhanya S**

GitHub: **Dhanya-S-14**

---

⭐ If you find this project useful, consider giving the repository a star!
