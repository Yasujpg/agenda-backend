const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const mysql = require("mysql2");

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


app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

db.connect((err) => {
  if (err) {
    console.error("❌ ERROR CONECTANDO A LA DB:", err);
  } else {
    console.log("✅ Conectado a la base de datos");
  }
});


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
