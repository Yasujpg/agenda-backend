import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "agenda_user",
  password: "agenda123",
  database: "agenda_app"
});

db.connect((err) => {
  if (err) {
    console.log("❌ Error conectando a MySQL:", err);
  } else {
    console.log("✅ Conectado a MySQL");
  }
});

export default db;
