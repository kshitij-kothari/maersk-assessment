import sqlite3 from "sqlite3";
import path from "node:path";
import fs from "node:fs";

// Create data directory if it doesn't exist
const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("Created data directory:", dataDir);
}
const dbPath = path.join(dataDir, "vendors.db");
const db = new sqlite3.Database(dbPath, (err: any) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log(`Connected to SQLite database`);
    console.log(`Database location: ${dbPath}`);
  }
});
// Enable foreign keys
db.run("PRAGMA foreign_keys = ON", (err: any) => {
  if (err) console.error("Error enabling foreign keys:", err);
});
// Initialize vendors table
db.serialize(() => {
  // Create table
  db.run(
    `
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            partner_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    (err: any) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        console.log("Vendors table ready");
      }
    },
  );
  // Check if data already exists to avoid duplicate inserts on restarts
  db.get("SELECT COUNT(*) as count FROM vendors", (err: any, result: any) => {
    if (err) {
      console.error("Error checking vendors count:", err);
      return;
    }
    const count = result?.count || 0;
    console.log(`Current vendor count: ${count}`);
    // Only insert sample data if the table is empty
    if (count === 0) {
      const sampleData = [
        {
          name: "Acme Corp",
          contact_person: "Alice Johnson",
          email: "alice@acme.com",
          partner_type: "Supplier",
        },
        {
          name: "Globex Inc",
          contact_person: "Jane Smith",
          email: "jane@globex.com",
          partner_type: "Supplier",
        },
        {
          name: "Initech LLC",
          contact_person: "Michael Johnson",
          email: "michael@initech.com",
          partner_type: "Partner",
        },
        {
          name: "Umbrella Corp",
          contact_person: "Sarah Williams",
          email: "sarah@umbrellacorp.com",
          partner_type: "Partner",
        },
      ];
      const stmt = db.prepare(
        "INSERT INTO vendors (name, contact_person, email, partner_type) VALUES (?, ?, ?, ?)",
      );
      sampleData.forEach((vendor) => {
        stmt.run(
          [
            vendor.name,
            vendor.contact_person,
            vendor.email,
            vendor.partner_type,
          ],
          (err: any) => {
            if (err) {
              console.error("Error inserting sample data:", err);
            }
          },
        );
      });
      stmt.finalize((err: any) => {
        if (err) {
          console.error("Error finalizing insert:", err);
        } else {
          console.log("Sample vendor data inserted");
        }
      });
    }
  });
});
export default db;
