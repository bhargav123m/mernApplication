const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const router = express.Router();

const User = require('../../models/User');

//@route Get api/users
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (e) {
    res.status(500).send('server error');
  }
});

router.post(
  '/',
  [
    check('email', 'Please include a valid Email').isEmail(),
    check('password', 'password should contain 6 or more characters').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ mssg: 'Invalid credentials' }] });
      }

      const ismatch = await bcrypt.compare(password, user.password);

      if (!ismatch) {
        return res
          .status(400)
          .json({ errors: [{ mssg: 'Invalid credentials' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000000 },
        (error, token) => {
          if (error) {
            throw error;
          }
          res.json({ token });
        }
      );
    } catch (e) {
      res.status(500).json({ error: 'server could not connect' });
    }
  }
);

module.exports = router;
