const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = Router();
require('dotenv').config();

router.post(
    '/register',
    [
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Incorrect password, minimum 6 chars').isLength({ min: 6 })
    ],
    async (req, res) => {
        console.log('Body', req.body);
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            console.log('Error1');
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect data'
            });
        }

        const { email, password } = req.body;

        const candidate = await User.findOne({ email });
        if (candidate) {
            console.log('Error2');
            return res.status(400).json({
                message: 'User already existed.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User created'});
    } catch (error) {
        console.log('Error3');
        res.status(500).json({ message: "Something went wrong.." });
    }
});

router.post(
    '/login',
    [
        check('email', 'Incorrect email').normalizeEmail().isEmail(),
        check('password', 'Input password').exists()
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect data'
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'User or password incorrect'});
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log(token);

        res.json({
            token,
            userId: user.id
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong.." });
    }
});

module.exports = router;
