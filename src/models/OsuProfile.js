const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create a schema.
const OsuProfileSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  rating: {
    type: Number,
    default: 500
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  match_history: [
    {
      opponent: {
        type: String
      },
      is_winner: {
        Type: Boolean
      },
      maps_played: [
        {
          map_id: {
            type: String
          },
          is_map_winner: {
            type: Boolean
          }
        }
      ],
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

// Create a model.
const OsuProfile = mongoose.model("osuprofile", OsuProfileSchema);

// Export the model.
module.exports = OsuProfile;
