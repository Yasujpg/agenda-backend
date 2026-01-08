import mysql from "mysql2";
import dotenv from "dotenv";


dotenv.config();

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERROR MySQL:", err.message);
  } else {
    console.log("✅ Conectado a MySQL");
    connection.release();
  }
});

export default db;
