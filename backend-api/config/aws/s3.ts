import { AWS_S3_BUCKET_EVIDENCE_FILE, AWS_S3_BUCKET_USER_UPLOADS } from '$/env';
import { randomUUID } from 'crypto';

// remove / from the string
const removeSlash = (str: string) => str.replace(/\//g, '_');

export const s3Config = {
  evidenceFile: {
    bucket: AWS_S3_BUCKET_EVIDENCE_FILE,
    path: {
      torrentScreenCapture: {
        definePath: (args: { torrentId: string }) =>
          `/screen-capture/torrent-detail/${args.torrentId}/${randomUUID()}`, // FIXME: //になってしまってる
      },
      torrentWatchRequestExport: {
        definePath: (args: {
          torrentWatchRequestId: string;
          fileName: string;
        }) =>
          `torrent-watch-request/${args.torrentWatchRequestId}/export/${removeSlash(args.fileName)}`, // MEMO: これはかえてもDBの連携ないのでOK
      },
    },
  },
  userUploads: {
    bucket: AWS_S3_BUCKET_USER_UPLOADS,
    path: {
      watchRequestCsv: {
        definePath: (args: { fileId: string }) =>
          `/watch-request-csv/${args.fileId}/${randomUUID()}`, // FIXME: //になってしまってる
      },
    },
  },
};
