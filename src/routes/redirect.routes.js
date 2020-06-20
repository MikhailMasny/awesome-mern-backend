const config = require('config');
const { Router } = require('express');
const Link = require('../models/Link');

const router = Router();

router.get(
  '/:code',
  async (req, res) => {
    try {
      const link = await Link.findOne({ code: req.params.code });
      if (link) {
        link.clicks += 1;
        await link.save();
        return res.redirect(link.from);
      }
      res.status(404).json(config.get('redirect.notFound'));
    } catch (error) {
      console.log(config.get('common.log'), error);
      res.status(500).json({ message: config.get('common.error') });
    }
  },
);

module.exports = router;
