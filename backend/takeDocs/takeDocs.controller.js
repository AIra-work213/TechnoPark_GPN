const express = require('express');
const takeDocsService = require('./takeDocs.service');

const router = express.Router();

router.post('/api/takeDocs', async (req, res) => {
    try {
        const result = await takeDocsService.sendTakeDocs(req.body);
        req.app.locals.sharedData = {
            ...result,
            receivedAt: new Date().toISOString()
        };
        const resPy = await fetch('http://localhost:8000/datas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(result)
        });
        const pythonResponse = await resPy.json();
        res.status(200).json(pythonResponse);
    } catch {
        res.status(500).json({
            error: "Ошибка при попытке соединения с сервером"
        })
    }
});

module.exports = router;