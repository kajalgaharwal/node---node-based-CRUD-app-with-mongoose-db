const mongoose = require('mongoose');
let conn = require('../config');
const Any = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  }
});
// const Any = new Schema({ any: Schema.Types.Mixed });
// let login_model = conn.loginDB.model('logins', Any);
// module.exports = login_model;
module.exports = conn.loginDB.model('logins', Any);
