import { SNSClient } from '@aws-sdk/client-sns';
import { AWS_SNS_ENDPOINT } from '$/env';

let snsClient: SNSClient;

export const getSnsClient = () => {
  snsClient =
    snsClient ??
    new SNSClient({
      region: 'ap-northeast-1',
      logger: console,
      endpoint: AWS_SNS_ENDPOINT,
    });

  return snsClient;
};
