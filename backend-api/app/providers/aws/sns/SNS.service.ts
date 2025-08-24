import {
  paginateListTopics,
  PublishCommand,
  PublishBatchCommand,
} from '@aws-sdk/client-sns';
import { getSnsClient } from './getSnsClient';

const client = getSnsClient();

export interface ISNSService {
  hello: () => Promise<void>;
  publish: (args: {
    topicArn: string;
    message: string | Record<string, any>;
  }) => Promise<void>;
  publishBatch: (args: {
    topicArn: string;
    messages: Array<string | Record<string, any>>;
  }) => Promise<void>;
}

export const SNSService: ISNSService = {
  /**
   * tests connection to SNS by listing up topics
   */
  hello: async () => {
    const paginatedTopics = paginateListTopics({ client }, {});
    const topics = [];

    for await (const page of paginatedTopics) {
      if (page.Topics?.length) {
        topics.push(...page.Topics);
      }
    }

    const suffix = topics.length === 1 ? '' : 's';

    console.log(
      `Hello, Amazon SNS! You have ${topics.length} topic${suffix} in your account.`,
    );
    console.log(topics.map((t) => `  * ${t}`).join('\n'));
  },
  /**
   * Publishes a message to a topic
   */
  publish: async (args: {
    topicArn: string;
    message: string | Record<string, any>;
  }) => {
    console.log('Publishing message to SNS topic:', args);

    if (typeof args.message === 'object') {
      await client.send(
        new PublishCommand({
          Message: JSON.stringify({ default: JSON.stringify(args.message) }),
          TopicArn: args.topicArn,
          MessageStructure: 'json',
        }),
      );

      return;
    }

    await client.send(
      new PublishCommand({
        Message: args.message,
        TopicArn: args.topicArn,
      }),
    );
  },
  /**
   * Publishes multiple messages to a topic
   */
  publishBatch: async (args: {
    topicArn: string;
    messages: Array<string | Record<string, any>>;
  }) => {
    await client.send(
      new PublishBatchCommand({
        PublishBatchRequestEntries: args.messages.map((message, index) => {
          if (typeof message === 'object') {
            return {
              Id: index.toString(),
              Message: JSON.stringify({ default: JSON.stringify(message) }),
              MessageStructure: 'json',
            };
          }

          return {
            Id: index.toString(),
            Message: message,
          };
        }),
        TopicArn: args.topicArn,
      }),
    );
  },
};
