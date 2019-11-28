const mongoose = require('mongoose');

// Set custom mongoose Promise.
mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      mongoose.connect('mongodb://localhost/APIAuthenticationTEST', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } else {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      });
    }
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
