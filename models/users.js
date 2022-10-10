const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  category: {
    type: String
  },
  image: {
    type: String
  },
  created: {
    type: Date,
    deafault: Date.now
  }
});
module.exports = mongoose.model('users', userSchema);
