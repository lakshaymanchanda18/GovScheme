"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startQueueWorker = exports.enqueueJob = exports.registerHandler = void 0;
const queue = [];
const handlers = {};
const registerHandler = (type, handler) => {
    handlers[type] = handler;
};
exports.registerHandler = registerHandler;
const enqueueJob = (type, payload) => {
    const job = {
        id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        type,
        payload,
        createdAt: Date.now()
    };
    queue.push(job);
    return job.id;
};
exports.enqueueJob = enqueueJob;
const startQueueWorker = (intervalMs = 1000) => {
    setInterval(async () => {
        const job = queue.shift();
        if (!job)
            return;
        const handler = handlers[job.type];
        if (!handler)
            return;
        try {
            await handler(job.payload);
        }
        catch (error) {
            console.error(`Job failed: ${job.type}`, error);
        }
    }, intervalMs);
};
exports.startQueueWorker = startQueueWorker;
