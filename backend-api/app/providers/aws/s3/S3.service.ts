import type {
  Bucket,
  ListObjectsCommandOutput,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import {
  PutObjectCommand,
  S3ServiceException,
  paginateListBuckets,
  ListObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getS3Client } from './getS3Client';

export interface IS3Service {
  helloS3: () => Promise<Bucket[] | void>;
  putObject: (args: {
    bucketName: string;
    key: string;
    file: File | Buffer | Uint8Array | Blob | string;
  }) => Promise<void>;
  getObject: (args: {
    bucketName: string;
    key: string;
  }) => Promise<GetObjectCommandOutput | undefined>;
  listObjects: (args: {
    bucketName: string;
    prefix: string;
  }) => Promise<ListObjectsCommandOutput | undefined>;
  deleteObject: (args: { bucketName: string; key: string }) => Promise<void>;
}

const client = getS3Client();

export const S3Service: IS3Service = {
  helloS3: async () => {
    // When no region or credentials are provided, the SDK will use the
    // region and credentials from the local AWS config.

    try {
      /**
       * @type { import("@aws-sdk/client-s3").Bucket[] }
       */
      const buckets = [];

      for await (const page of paginateListBuckets({ client }, {})) {
        if (page.Buckets?.length) {
          buckets.push(...page.Buckets);
        }
      }
      console.log('Buckets: ');
      console.log(buckets.map((bucket) => bucket.Name).join('\n'));

      return buckets;
    } catch (caught) {
      // ListBuckets does not throw any modeled errors. Any error caught
      // here will be something generic like `AccessDenied`.
      if (caught instanceof S3ServiceException) {
        console.error(`${caught.name}: ${caught.message}`);
      } else {
        // Something besides S3 failed.
        throw caught;
      }
    }
  },
  getObject: async ({ bucketName, key }) => {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      const response = await client.send(command);

      return response;
    } catch (caught) {
      if (caught instanceof S3ServiceException) {
        console.error(
          `Error getting object from S3: ${caught.name}: ${caught.message}`,
        );
      } else {
        throw caught;
      }
    }
  },
  putObject: async ({
    bucketName,
    key,
    file,
  }: {
    bucketName: string;
    key: string;
    file: File | Buffer | Uint8Array | Blob | string;
  }) => {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
    });

    try {
      await client.send(command);
    } catch (caught) {
      if (
        caught instanceof S3ServiceException &&
        caught.name === 'EntityTooLarge'
      ) {
        const errorMsg = `Error from S3 while uploading object to ${bucketName}. \
  The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
  or the multipart upload API (5TB max).`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      } else if (caught instanceof S3ServiceException) {
        const errorMsg = `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      } else {
        throw caught;
      }
    }
  },
  listObjects: async ({ bucketName, prefix }) => {
    const command = new ListObjectsCommand({
      Bucket: bucketName,
      Prefix: prefix,
    });
    try {
      const response = await client.send(command);

      return response;
    } catch (caught) {
      if (caught instanceof S3ServiceException) {
        console.error(`${caught.name}: ${caught.message}`);
      } else {
        throw caught;
      }
    }
  },
  deleteObject: async ({ bucketName, key }) => {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
    } catch (caught) {
      if (caught instanceof S3ServiceException) {
        console.error(`${caught.name}: ${caught.message}`);
      } else {
        throw caught;
      }
    }
  },
};
