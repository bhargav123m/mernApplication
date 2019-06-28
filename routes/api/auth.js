const express = require('express');
const router = express.Router();

//@route Get api/users
router.get('/', (req, res) => {
  res.send('auth api working');
});

module.exports = router;
