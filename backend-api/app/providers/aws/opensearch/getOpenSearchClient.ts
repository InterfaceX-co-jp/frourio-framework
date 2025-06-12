import {
  AWS_OPENSEARCH_ENDPOINT,
  AWS_OPENSEARCH_USERNAME,
  AWS_OPENSEARCH_PASSWORD,
} from '$/env';
import { Client } from '@opensearch-project/opensearch';

// @see: https://github.com/opensearch-project/opensearch-js/blob/main/USER_GUIDE.md
let client: Client;

export const getOpenSearchClient = () => {
  if (!client) {
    client = new Client({
      node: AWS_OPENSEARCH_ENDPOINT,
      auth: {
        username: AWS_OPENSEARCH_USERNAME,
        password: AWS_OPENSEARCH_PASSWORD,
      },
      memoryCircuitBreaker: {
        enabled: true,
        maxPercentage: 0.8,
      },
    });
  }

  return client;
};
