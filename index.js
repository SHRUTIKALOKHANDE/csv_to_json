require("dotenv").config();
const express = require("express");
const fs = require("fs");
const readline = require("readline");
const initDb = require("./db");
let pool;

(async () => {
  pool = await initDb();  // init DB at startup
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
const app = express();
const PORT = 3000;

// --- Helper: Parse CSV line into array (basic, handles quotes) ---
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// --- Helper: Convert flat object with dot keys into nested object ---
function nestObject(flatObj) {
  const nested = {};
  for (let key in flatObj) {
    const parts = key.split(".");
    let cur = nested;
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1) {
        cur[parts[i]] = flatObj[key];
      } else {
        cur[parts[i]] = cur[parts[i]] || {};
        cur = cur[parts[i]];
      }
    }
  }
  return nested;
}

// --- API: Load CSV into DB ---
app.post("/upload", async (req, res) => {
  const filePath = process.env.CSV_FILE_PATH;
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("CSV file not found");
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream });

  let headers = [];
  let rowCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (headers.length === 0) {
      headers = parseCsvLine(line);
      continue;
    }

    const values = parseCsvLine(line);
    const flatObj = {};
    headers.forEach((h, i) => (flatObj[h] = values[i] || null));

    const nestedObj = nestObject(flatObj);

    // Mandatory fields
    const firstName = nestedObj?.name?.firstName || "";
    const lastName = nestedObj?.name?.lastName || "";
    const name = `${firstName} ${lastName}`.trim();
    const age = parseInt(nestedObj?.age, 10) || null;

    // Address (if exists)
    const address = nestedObj.address || null;

    // Remove mandatory + address, keep rest in additional_info
    delete nestedObj.name;
    delete nestedObj.age;
    delete nestedObj.address;

    const additionalInfo = Object.keys(nestedObj).length ? nestedObj : null;

    // Insert into DB
    await pool.query(
      `INSERT INTO users(name, age, address, additional_info) VALUES($1,$2,$3,$4)`,
      [name, age, address, additionalInfo]
    );
   


    rowCount++;
  }

  res.send(`Uploaded ${rowCount} records to DB`);

  // --- Print Age Distribution ---
  const dist = await pool.query(`
    SELECT
    CASE 
        WHEN age < 20 THEN '<20'
        WHEN age BETWEEN 20 AND 40 THEN '20-40'
        WHEN age BETWEEN 40 AND 60 THEN '40-60'
        ELSE '>60'
    END as age_group,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users) AS NUMERIC) as percentage
    FROM users
    GROUP BY age_group
    ORDER BY age_group;
  `);

    console.log("Age-Group % Distribution");
dist.rows.forEach(r => {
  const pct = Number(r.percentage);   // force convert to number
  console.log(`${r.age_group} ${pct.toFixed(2)}`);
});
});
console.log("Starting server...");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
