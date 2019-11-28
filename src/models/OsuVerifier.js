const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create a schema.
const OsuVerifierSchema = new Schema({
  code: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
});

// Create a model.
const OsuVerifier = mongoose.model('osuverifier', OsuVerifierSchema);

// Export the model.
module.exports = OsuVerifier;
