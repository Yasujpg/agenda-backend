import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a la DB:", err);
  } else {
    console.log("✅ Conectado a la base de datos");
  }
});

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

// REGISTER
app.post("/api/register", upload.none(), (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const hash = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Usuario ya existe" });
        }
        console.error(err);
        return res.status(500).json({ error: "Error al crear usuario" });
      }

      res.json({ message: "Usuario creado correctamente" });
    }
  );
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error servidor" });
      }

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
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});
