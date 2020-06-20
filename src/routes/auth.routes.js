const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Router } = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

const router = Router();

router.post(
  '/register',
  [
    check('email', config.get('auth.incorrectEmail')).isEmail(),
    check('password', config.get('auth.incorrectPassword')).isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: config.get('auth.incorrectData'),
        });
      }
      const { email, password } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        return res.status(400).json({
          message: config.get('auth.userAlreadyExist'),
        });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
      });
      await user.save();
      res.status(201).json({ message: config.get('auth.userCreated') });
    } catch (error) {
      console.log(config.get('common.log'), error);
      res.status(500).json({ message: config.get('common.error') });
    }
  },
);

router.post(
  '/login',
  [
    check('email', config.get('auth.incorrectEmail')).normalizeEmail().isEmail(),
    check('password', config.get('auth.incorrectPassword')).exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: config.get('auth.incorrectData'),
        });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: config.get('auth.userNotFound') });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: config.get('auth.incorrectUserOrPassword') });
      }
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_TIME },
      );
      res.json({
        token,
        userId: user.id,
      });
    } catch (error) {
      console.log(config.get('common.log'), error);
      res.status(500).json({ message: config.get('common.error') });
    }
  },
);

module.exports = router;
