const app = require("./app");
const config = require("./config/config");
const db = require("./config/database");
const { CreateUser, GetUserById } = require("./services/user.service");

async function checkConnection() {
  let connection;
  try {
    connection = await db.getConnection();
    console.log("Database connected successfully");
  }
  catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

checkConnection().then(() => {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
})



