const express = require('express');
const connectDB = require('./config/db');

const app = express();

//coneect to database
connectDB();

//body-parser middleware
app.use(express.json({ extended: false }));

app.use('/api/users', require('./routes/api/user'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

const Port = process.env.Port || 3000;

app.listen(Port, () => {
  console.log('app is listening on port ' + Port);
});
