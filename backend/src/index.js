const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "DB_UNAVAILABLE" });
  }
});

app.get("/api/people", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email FROM people ORDER BY id DESC"
    );
    res.status(200).json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.get("/api/people/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "INVALID_ID" });

  try {
    const result = await pool.query(
      "SELECT id, full_name, email FROM people WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "NOT_FOUND" });
    res.status(200).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.post("/api/people", async (req, res) => {
  const { full_name, email } = req.body || {};

  if (!isNonEmptyString(full_name)) {
    return res.status(400).json({ error: "FULL_NAME_REQUIRED" });
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isNonEmptyString(normalizedEmail) || !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: "INVALID_EMAIL" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO people (full_name, email) VALUES ($1, $2) RETURNING id, full_name, email",
      [full_name.trim(), normalizedEmail]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e && e.code === "23505") {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.put("/api/people/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "INVALID_ID" });

  const { full_name, email } = req.body || {};

  if (!isNonEmptyString(full_name)) {
    return res.status(400).json({ error: "FULL_NAME_REQUIRED" });
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isNonEmptyString(normalizedEmail) || !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: "INVALID_EMAIL" });
  }

  try {
    const result = await pool.query(
      "UPDATE people SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, full_name, email",
      [full_name.trim(), normalizedEmail, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "NOT_FOUND" });
    res.status(200).json(result.rows[0]);
  } catch (e) {
    if (e && e.code === "23505") {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.delete("/api/people/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "INVALID_ID" });

  try {
    const result = await pool.query(
      "DELETE FROM people WHERE id = $1 RETURNING id, full_name, email",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "NOT_FOUND" });
    res.status(200).json({ deleted: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.use((_req, res) => res.status(404).json({ error: "NOT_FOUND" }));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
});

