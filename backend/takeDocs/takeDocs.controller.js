const express = require('express');
const { randomUUID } = require('crypto');
const takeDocsService = require('./takeDocs.service');

const router = express.Router();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureJobStore = (app) => {
    if (!app.locals.analysisJobs) {
        app.locals.analysisJobs = new Map();
    }
    return app.locals.analysisJobs;
};

router.post('/api/takeDocs', async (req, res) => {
    try {
        const documents = await takeDocsService.sendTakeDocs(req.body);
        const jobs = ensureJobStore(req.app);
        const jobId = randomUUID();
        const createdAt = new Date().toISOString();

        jobs.set(jobId, {
            status: 'pending',
            documents,
            createdAt,
        });

        res.status(202).json({ jobId });

        const runAnalysis = async () => {
            const timeoutMinutes = 15;
            const signal = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout)
                ? AbortSignal.timeout(timeoutMinutes * 60 * 1000)
                : undefined;

            const updateJob = (updates) => {
                const current = jobs.get(jobId) || {};
                const next = {
                    ...current,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                };

                if (['completed', 'error'].includes(next.status)) {
                    delete next.documents;
                }

                jobs.set(jobId, next);
            };

            try {
                updateJob({ status: 'processing' });
                const fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(documents),
                };
                if (signal) {
                    fetchOptions.signal = signal;
                }

                const pythonUrl = 'http://127.0.0.1:8000/datas';
                const maxAttempts = 5;
                let pythonResponse;

                for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
                    try {
                        const resPy = await fetch(pythonUrl, fetchOptions);
                        if (!resPy.ok) {
                            throw new Error(`Python сервис вернул статус ${resPy.status}`);
                        }
                        pythonResponse = await resPy.json();
                        break;
                    } catch (fetchError) {
                        const isRetryable = fetchError?.cause?.code === 'ECONNREFUSED'
                            || fetchError?.message?.includes('fetch failed');

                        if (attempt === maxAttempts || !isRetryable) {
                            throw fetchError;
                        }

                        await sleep(2000);
                    }
                }

                if (!pythonResponse) {
                    throw new Error('Python сервис не ответил');
                }
                updateJob({
                    status: 'completed',
                    result: pythonResponse,
                    finishedAt: new Date().toISOString(),
                });
            } catch (error) {
                console.error('Ошибка взаимодействия с Python сервисом:', error);
                updateJob({
                    status: 'error',
                    error: error?.message || 'Неизвестная ошибка',
                    finishedAt: new Date().toISOString(),
                });
            }
        };

        setImmediate(runAnalysis);
    } catch (error) {
        console.error('Ошибка при обработке документов:', error);
        res.status(500).json({
            error: "Ошибка при попытке соединения с сервером",
            details: error?.message
        })
    }
});

router.get('/api/takeDocs/:jobId', (req, res) => {
    const jobs = ensureJobStore(req.app);
    const jobId = req.params.jobId;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ status: 'not_found', message: 'Задача не найдена' });
    }

    if (job.status === 'completed') {
        return res.status(200).json({
            status: 'completed',
            result: job.result,
            finishedAt: job.finishedAt,
        });
    }

    if (job.status === 'error') {
        return res.status(200).json({
            status: 'error',
            error: job.error,
            finishedAt: job.finishedAt,
        });
    }

    return res.status(200).json({
        status: job.status,
        createdAt: job.createdAt,
    });
});

module.exports = router;