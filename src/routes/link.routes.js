const config = require('config');
const shortid = require('shortid');
require('dotenv').config();
const { Router } = require('express');
const Link = require('../models/Link');
const auth = require('../middleware/auth.middleware');

const router = Router();

router.post(
  '/generate',
  auth,
  async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL;
      const { from } = req.body;
      const code = shortid.generate();
      const existedLink = await Link.findOne({ from });
      if (existedLink) {
        return res.json({ link: existedLink });
      }
      const to = `${baseUrl}/t/${code}`;
      const link = new Link({
        code,
        to,
        from,
        owner: req.user.userId,
      });
      await link.save();
      res.status(201).json({ link });
    } catch (error) {
      console.log(config.get('common.log'), error);
      res.status(500).json({ message: config.get('common.error') });
    }
  },
);

router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const links = await Link.find({ owner: req.user.userId });
      res.json(links);
    } catch (error) {
      console.log(config.get('common.log'), error);
      res.status(500).json({ message: config.get('common.error') });
    }
  },
);

router.get(
  '/:id',
  auth,
  async (req, res) => {
    try {
      const link = await Link.findById(req.params.id);
      res.json(link);
    } catch (error) {
      console.log(config.get('common.log'), error);
      res.status(500).json({ message: config.get('common.error') });
    }
  },
);

module.exports = router;
