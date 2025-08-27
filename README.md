# 📂 CSV to JSON with Express & PostgreSQL

This project is a simple **Node.js + Express** application that:  
1. Uploads CSV data.  
2. Converts it into JSON.  
3. Stores it in a **PostgreSQL database**.  
4. Provides an API to analyze age-group distribution.  

---

## 🚀 Features
- Upload CSV data via REST API (`/upload`).  
- Auto-creates the database (`testdb`) and table (`users`) if they don’t exist.  
- Stores parsed CSV data into PostgreSQL.  
- Calculates and prints **age-group % distribution**:
  - `<20`
  - `20-40`
  - `40-60`
  - `>60`

---

## 🛠️ Tech Stack
- **Node.js** (Express framework)  
- **PostgreSQL** (`pg` npm package)  
- **dotenv** for environment variables  

---

## 📂 Project Setup

### 1. Clone the repository
```bash
git clone https://github.com/SHRUTIKALOKHANDE/csv_to_json.git
cd csv_to_json
npm install

3. Configure environment variables

Create a .env file in the project root:
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testdb
PORT=3000

4. Run the server
node index.js

Starting server...
Server running on port 3000
Connected to DB "testdb" and ensured table "users" exists.


📌 API Endpoints
➤ Upload CSV
curl -X POST http://localhost:3000/upload
