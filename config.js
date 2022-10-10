const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true //the MongoDB driver sends a heartbeat every heartbeatFrequencyMS to check on the status of the connection
});
mongoose.loginDB = mongoose.createConnection(process.env.DB_LOGINS, {
  useNewUrlParser: true,
  useUnifiedTopology: true //the MongoDB driver sends a heartbeat every heartbeatFrequencyMS to check on the status of the connection
});
const db = mongoose.connection;
db.on('error', () => {
  //Adds a listener to the end of the listeners array for the specified event.
  console.log('error');
});
db.once('open', () => {
  console.log('Connection has been established!!');
});

module.exports = mongoose;
