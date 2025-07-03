import { S3Client } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';
import { AWS_S3_ENDPOINT_URL } from '$/env';

let s3Client: S3Client;

export const getS3Client = () => {
  s3Client =
    s3Client ??
    new S3Client({
      credentials: fromEnv(),
      region: 'ap-northeast-1',
      logger: console,
      endpoint: AWS_S3_ENDPOINT_URL,
      forcePathStyle: true,
    });

  return s3Client;
};
