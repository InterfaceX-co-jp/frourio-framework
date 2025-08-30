import { AWS_SQS_QUEUE_URL_BACKEND_WORKER } from '$/env';

export const sqsConfig = {
  queues: {
    backendWorker: {
      queueUrl: AWS_SQS_QUEUE_URL_BACKEND_WORKER,
    },
  },
};
