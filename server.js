const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('app is listening');
});

const Port = process.env.Port || 3000;

app.listen(Port, () => {
  console.log('app is listening on port ' + Port);
});
