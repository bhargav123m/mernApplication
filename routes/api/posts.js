const express = require('express');
const router = express.Router();

//@route Get api/users
router.get('/', (req, res) => {
  res.send('get posts working');
});

module.exports = router;
