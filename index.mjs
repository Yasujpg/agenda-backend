import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MySQL Railway
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

// ✅ Test conexión + tabla
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255)
      )
    `);
    console.log("✅ DB lista");
  } catch (err) {
    console.error("❌ Error DB:", err);
  }
})();

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

// 🔹 REGISTRO
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);

    await db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hash]
    );

    res.json({ message: "Usuario creado correctamente" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Usuario ya existe" });
    }
    console.error(err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// 🔹 LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const [results] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = results[0];
    const ok = bcrypt.compareSync(password, user.password);

    if (!ok) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error servidor" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});
