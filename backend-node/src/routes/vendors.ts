import { Router, Request, Response } from "express";
import db from "../db/database";
import { Vendor } from "../models/Vendor";

const router = Router();
// GET /vendors - List all vendors
router.get("/", (req: Request, res: Response) => {
  db.all(
    "SELECT * FROM vendors ORDER BY id DESC",
    [],
    (err: any, rows: any) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch vendors", error: err.message });
      }
      res.status(200).json(rows || []);
    },
  );
});

// POST /vendors - Register a new vendor
router.post("/", (req: Request, res: Response) => {
  const { name, contact_person, email, partner_type } = req.body as Vendor;
  if (!name || !contact_person || !email || !partner_type) {
    console.warn("Missing required fields:", {
      name,
      contact_person,
      email,
      partner_type,
    });
    return res.status(400).json({
      message: "All fields are required",
      received: { name, contact_person, email, partner_type },
    });
  }
  if (partner_type !== "Supplier" && partner_type !== "Partner") {
    console.warn("Invalid partner type:", partner_type);
    return res.status(400).json({
      message: 'partner_type must be either "Supplier" or "Partner"',
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn("Invalid email format:", email);
    return res.status(400).json({
      message: "Invalid email format",
    });
  }
  // Check for duplicate email
  db.get(
    "SELECT id FROM vendors WHERE LOWER(email) = LOWER(?)",
    [email],
    function (err: any, row: any) {
      if (err) {
        console.error("Database error during email check:", err);
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }
      if (row) {
        console.warn("Duplicate email attempt:", email);
        return res.status(400).json({
          message:
            "A vendor with this email already exists. Please use a different email address.",
        });
      }
      const sql = `INSERT INTO vendors (name, contact_person, email, partner_type) 
                     VALUES (?, ?, ?, ?)`;
      db.run(
        sql,
        [name.trim(), contact_person.trim(), email.trim(), partner_type],
        function (err: any) {
          if (err) {
            console.error("Database error during insert:", err);
            return res
              .status(500)
              .json({ message: "Failed to create vendor", error: err.message });
          }
          res.status(201).json({
            id: this.lastID,
            name,
            contact_person,
            email,
            partner_type,
          });
        },
      );
    },
  );
});

// DELETE /vendors/:id - Delete a vendor
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || Number.isNaN(Number(id))) {
    console.warn("Invalid vendor ID:", id);
    return res.status(400).json({ message: "Valid Vendor ID is required" });
  }
  const sql = "DELETE FROM vendors WHERE id = ?";
  db.run(sql, [id], function (err: any) {
    if (err) {
      console.error("Database error during delete:", err);
      return res
        .status(500)
        .json({ message: "Failed to delete vendor", error: err.message });
    }
    if (this.changes === 0) {
      console.warn("Vendor not found:", id);
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json({ message: "Vendor deleted successfully" });
  });
});

// GET /check-email - Check if email exists
router.get("/check-email", (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email || typeof email !== "string") {
    console.warn("Email check failed - missing or invalid email parameter");
    return res.status(400).json({ message: "Email is required" });
  }
  db.get(
    "SELECT id FROM vendors WHERE LOWER(email) = LOWER(?)",
    [email],
    (err: any, row: any) => {
      if (err) {
        console.error("Database error during email check:", err);
        return res
          .status(500)
          .json({ message: "Failed to check email", error: err.message });
      }
      const exists = !!row;
      res.status(200).json({ exists });
    },
  );
});
export default router;
