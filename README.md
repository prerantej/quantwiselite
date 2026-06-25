# QuantWise Lite — Splitwise-Lite Expense Tracker

QuantWise Lite is a collaborative group expense ledger utility where friends or roommates can input shared bills and instantly see a calculated, minimized list of who owes how much money to whom. 

The application features a clean, card-based responsive UI inspired by the **PhonePe** payment flow, optimizing for minimal clicks, scan-friendly layouts, and intuitive peer-to-peer settlements.

---

## 🚀 Technology Stack
* **Frontend**: React (Vite), Tailwind CSS, Axios
* **Backend**: Node.js, Express.js
* **Architecture**: Layered MVC (Routes ➜ Middleware ➜ Controllers ➜ Services ➜ Repositories)
* **Storage**: LowDB (Lightweight, local file-based JSON persistence)

---

## 🏛️ System Architecture

The codebase strictly adheres to clean code practices, Separation of Concerns (SoC), and the Single Responsibility Principle (SRP):

```
quantwiselite/
├── backend/
│   ├── src/
│   │   ├── config/          # LowDB database file initialization
│   │   ├── routes/          # Express API route declarations
│   │   ├── middleware/      # Input validations & guards
│   │   ├── controllers/     # HTTP request handlers & status code mapping
│   │   ├── services/        # Business logic, ledger math, & debt minimization
│   │   ├── repositories/    # Database abstraction layer (LowDB CRUD interfaces)
│   │   ├── app.js           # App setup, CORS configuration, & global error routing
│   │   └── server.js        # Server listener entry point
│   ├── db.json              # Local JSON database (automatically seeded)
│   └── test-api.js          # API Integration test suite
└── frontend/
    ├── src/
    │   ├── components/      # UI components (NavBar, forms, sliders, list displays)
    │   ├── hooks/           # useLedger custom React state & API sync hook
    │   ├── services/        # Axios API client setup
    │   ├── index.css        # Tailwind directives and typography setups
    │   └── App.jsx          # Component coordination layout
```

* **Why this layout exists**: The database is completely abstracted by the Repository layer. If we need to migrate from LowDB to MongoDB/Mongoose in production, we only rewrite the two Repository classes (`userRepository.js` and `expenseRepository.js`) and the config database file. No Controllers, Services, Middlewares, or Frontend code changes.

---

## 🧠 Core Business Logic Algorithms

### 1. Fractional Division with Penny Adjustment
Dividing bills proportionally using custom sliders can result in floating-point residue (e.g., splitting $100.00 three ways: 33.33%, 33.33%, 33.34%). 
To prevent cent leakage, the backend computes exact shares for the first $N-1$ users, and assigns the absolute remainder to the final user:
$$\text{share}_N = \text{amount} - \sum_{i=1}^{N-1} \text{share}_i$$
This ensures the sum of participant shares is always mathematically equal to the total bill amount down to the cent.

### 2. Debt Minimization Algorithm (Simplify Debts)
To reduce overall transaction paths among participants, the engine:
1. Calculates net balances for all group members: $\text{netBalance}(U) = \text{TotalPaidBy}(U) - \text{TotalShareOf}(U)$.
2. Splits users into two sorted queues:
   * **Debtors**: Net balance < 0 (sorted descending by absolute debt).
   * **Creditors**: Net balance > 0 (sorted descending by credit amount).
3. Sequentially matches the largest debtor with the largest creditor:
   * Transaction Amount = $\min(\text{debt}, \text{credit})$.
   * Deducts this settled amount from both parties.
   * Discards balances that are fully settled ($0.00$) and repeats until both queues are empty.
   
This greedy algorithm solves the settlement path in $O(N \log N)$ complexity and yields at most $N-1$ transactions.

### 3. P2P Lazy-Recording Settlements
The backend supports recording direct cash payments. If Rahul pays Amit $15.00 directly to settle a debt, any user can record this transaction on their behalf. The database records this as a special expense (`isSettlement: true`) where the sender gets credited $15.00 and the recipient gets debited $15.00 (100% split), which perfectly nets down the balances mathematically.

---

## 🔌 REST API Design

| Method | Route | Description | Validation Rules / Payload |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/users` | List all group members | Returns Amit, Rahul, and Sneha with IDs |
| **GET** | `/api/expenses` | List all historical ledger items | Sorted chronologically |
| **POST** | `/api/expenses` | Record a bill split or cash payment | Description (string), Amount (number > 0), payerId (string), isSettlement (bool), splits (array) |
| **DELETE** | `/api/expenses/:id` | Remove a transaction | Returns `200 OK` or `404 Not Found` |
| **GET** | `/api/settlement` | Retrieve live settlement board | Computes net balances and minimized payment paths |

* **Payload Validation**: `POST /api/expenses` checks for empty descriptions, negative amounts, duplicate participant IDs, negative percentage values, and verifies the sum of percentages is exactly 100% on the server side.

---

## 🛠️ How to Setup and Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v16+) installed.

### 1. Run the Backend Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run the development server (with nodemon, auto-ignores db.json writes)
npm run dev
```
The server will start on `http://localhost:5000` and automatically create/seed `db.json` with **Amit**, **Rahul**, and **Sneha** if it does not exist.

### 2. Run the Frontend Client
```bash
# In a new terminal tab, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the Vite React client
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Running Backend Integration Tests
We've provided a zero-dependency API integration test suite to verify calculation accuracies, validations, and settlement plans:
```bash
cd backend
node test-api.js
```
