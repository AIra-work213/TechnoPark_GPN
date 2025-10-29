const express = require('express');
const takeDocsService = require('./takeDocs.service');

const router = express.Router();

router.post('/api/takeDocs', async (req, res) => {
    const result = await takeDocsService.sendTakeDocs(req.body);
    res.status(200).json(result);
});

module.exports = router;