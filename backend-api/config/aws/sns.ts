import {
  AWS_SNS_TOPIC_ARN_ENQUEUE_BACKEND_WORKER,
  AWS_SNS_TOPIC_ARN_ENQUEUE_DOWNLOADING,
  AWS_SNS_TOPIC_ARN_ENQUEUE_IP_MONITORING,
  AWS_SNS_TOPIC_ARN_ENQUEUE_SCENE_FINDER,
} from '$/env';

export interface DownloadTorrent {
  magnet_link: string;
  case_id: string;
  type: 'IKEN_SHOUKAI' | 'KAIJI_SEIKYU';
  torrent_tracker_name: 'NYAA_SUKEBEI';
  torrent_detail_id: string;
}

export type BackendWorkerTaskType =
  | 'SUBMIT_IKEN_SHOUKAI_CASE'
  | 'CREATE_KAIJI_SEIKYU_BY_IKEN_SHOUKAI_CASE_ID'
  | 'IMPORT_WATCH_REQUEST_CSV'
  | 'RETRY_IMPORT_WATCH_REQUEST_CSV' // @NOTE: Terraformからcronで呼んでいるので変更あるときは注意
  | 'EXPORT_WATCH_REQUEST_IP_ADDRESSES_CSV_BY_ID'
  | 'EXPORT_WATCH_REQUEST_IP_ADDRESSES_CSV_ALL';

interface ISNSConfig {
  topics: {
    enqueueIpMonitor: {
      arn: string;
      defineMessagePayload: (args: {
        torrent: string;
        torrent_id: string;
      }) => Record<string, any>;
    };
    enqueueDownloadingTorrents: {
      arn: string;
      defineMessagePayload: (args: DownloadTorrent) => DownloadTorrent;
      defineMessagePayloadArgument: (args: DownloadTorrent) => DownloadTorrent;
    };
    enqueueSceneFinder: {
      arn: string;
      defineMessagePayload: (args: {
        nyaaSukebeiTorrentId: string;
        nyaaSukebeiCrawledTorrentScreenCaptureId: string;
        nyaaSukebeiVideoInputObjectStorageFilePath: string;
        screenCaptureImageInputObjectStorageFilePath: string;
        screenCaptureCsvOutputObjectStorageFilePath: string | null;
      }) => Record<string, any>;
    };
    backendWorker: {
      submitIkenShoukaiCase: {
        arn: string;
        defineMessagePayload: (args: {
          caseId: string;
          taskType: BackendWorkerTaskType;
        }) => Record<string, any | string>;
      };
      createKaijiSeikyuByIkenShoukaiCaseId: {
        arn: string;
        defineMessagePayload: (args: {
          ikenShoukaiCaseId: string;
          title: string;
          description?: string;
          taskType: BackendWorkerTaskType;
        }) => Record<string, any | string>;
      };
      importWatchRequestCsv: {
        arn: string;
        defineMessagePayload: (args: {
          fileId: string;
          taskType: BackendWorkerTaskType;
        }) => Record<string, any>;
      };
      retryImportWatchRequestCsv: {
        arn: string;
        defineMessagePayload: (args: {
          taskType: BackendWorkerTaskType;
        }) => Record<string, any>;
      };
      exportWatchRequestIpAddressesCsvById: {
        arn: string;
        defineMessagePayload: (args: {
          watchRequestCsvId: string;
          taskType: BackendWorkerTaskType;
        }) => Record<string, any>;
      };
      exportWatchRequestIpAddressesCsvAll: {
        arn: string;
        defineMessagePayload: (args: {
          taskType: BackendWorkerTaskType;
        }) => Record<string, any>;
      };
    };
  };
}

export const snsConfig: ISNSConfig = {
  topics: {
    enqueueIpMonitor: {
      arn: AWS_SNS_TOPIC_ARN_ENQUEUE_IP_MONITORING,
      defineMessagePayload: (args: { torrent: string }) => args,
    },
    enqueueDownloadingTorrents: {
      arn: AWS_SNS_TOPIC_ARN_ENQUEUE_DOWNLOADING,
      defineMessagePayload: (args: DownloadTorrent) => args,
      defineMessagePayloadArgument: (args: DownloadTorrent) => args,
    },
    enqueueSceneFinder: {
      arn: AWS_SNS_TOPIC_ARN_ENQUEUE_SCENE_FINDER,
      defineMessagePayload: (args: {
        nyaaSukebeiTorrentId: string;
        nyaaSukebeiCrawledTorrentScreenCaptureId: string;
        nyaaSukebeiVideoInputObjectStorageFilePath: string;
        screenCaptureImageInputObjectStorageFilePath: string;
        screenCaptureCsvOutputObjectStorageFilePath?: string | null;
      }) => args,
    },
    backendWorker: {
      submitIkenShoukaiCase: {
        arn: AWS_SNS_TOPIC_ARN_ENQUEUE_BACKEND_WORKER,
        defineMessagePayload: (args: {
          caseId: string;
          taskType: BackendWorkerTaskType;
        }) => args,
      },
      createKaijiSeikyuByIkenShoukaiCaseId: {
        arn: AWS_SNS_TOPIC_ARN_ENQUEUE_BACKEND_WORKER,
        defineMessagePayload: (args: {
          ikenShoukaiCaseId: string;
          title: string;
          description?: string;
          taskType: BackendWorkerTaskType;
        }) => args,
      },
      importWatchRequestCsv: {
        arn: AWS_SNS_TOPIC_ARN_ENQUEUE_BACKEND_WORKER,
        defineMessagePayload: (args: {
          fileId: string;
          taskType: BackendWorkerTaskType;
        }) => args,
      },
      // @NOTE: Terraformからcronで呼んでいるので変更あるときは注意
      retryImportWatchRequestCsv: {
        arn: AWS_SNS_TOPIC_ARN_ENQUEUE_BACKEND_WORKER,
        defineMessagePayload: (args: { taskType: BackendWorkerTaskType }) =>
          args,
      },
      exportWatchRequestIpAddressesCsvById: {
        arn: AWS_SNS_TOPIC_ARN_ENQUEUE_BACKEND_WORKER,
        defineMessagePayload: (args: {
          watchRequestCsvId: string;
          taskType: BackendWorkerTaskType;
        }) => args,
      },
      exportWatchRequestIpAddressesCsvAll: {
        arn: AWS_SNS_TOPIC_ARN_ENQUEUE_BACKEND_WORKER,
        defineMessagePayload: (args: { taskType: BackendWorkerTaskType }) =>
          args,
      },
    },
  },
};
