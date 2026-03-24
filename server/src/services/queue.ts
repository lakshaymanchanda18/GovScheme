type Job = {
  id: string;
  type: string;
  payload: any;
  createdAt: number;
};

type Handler = (payload: any) => Promise<void> | void;

const queue: Job[] = [];
const handlers: Record<string, Handler> = {};

export const registerHandler = (type: string, handler: Handler) => {
  handlers[type] = handler;
};

export const enqueueJob = (type: string, payload: any) => {
  const job: Job = {
    id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    type,
    payload,
    createdAt: Date.now()
  };
  queue.push(job);
  return job.id;
};

export const startQueueWorker = (intervalMs = 1000) => {
  setInterval(async () => {
    const job = queue.shift();
    if (!job) return;
    const handler = handlers[job.type];
    if (!handler) return;
    try {
      await handler(job.payload);
    } catch (error) {
      console.error(`Job failed: ${job.type}`, error);
    }
  }, intervalMs);
};
