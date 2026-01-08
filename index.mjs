import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import db from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

app.post("/api/register", upload.single("avatar"), (req, res) => {
  const { email, password } = req.body;
  const avatar = req.file ? req.file.filename : null;

  if (!email || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const hash = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (email, password, avatar) VALUES (?, ?, ?)",
    [email, hash, avatar],
    (err) => {
      if (err) {
        return res.status(400).json({ error: "Usuario ya existe" });
      }
      res.json({ message: "Usuario creado correctamente" });
    }
  );
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, users) => {
      if (err) return res.status(500).json({ message: "Error servidor" });
      if (users.length === 0)
        return res.status(401).json({ message: "Credenciales incorrectas" });

      const user = users[0];

      const ok = bcrypt.compareSync(password, user.password);
      if (!ok)
        return res.status(401).json({ message: "Credenciales incorrectas" });

      res.json({
        id: user.id,
        email: user.email,
        avatar: user.avatar,
      });
    }
  );
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});

