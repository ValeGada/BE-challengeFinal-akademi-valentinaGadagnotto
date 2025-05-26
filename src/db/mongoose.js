const mongoose = require('mongoose');

// mongo connection
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URL);
    } catch (err) {
      process.exit(1); // Termina el proceso si falla la conexión
    }
  };
  
module.exports = connectDB;