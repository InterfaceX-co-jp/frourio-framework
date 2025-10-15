This project is based on InterfaceX original web framework `frourio-framework`(just `f-f` for shorthand).
The `f-f` includes a variety of composable functions and several best practices found in InterfaceX projects. Here defines several characteristics and concept on `f-f`. Given this instruction, the generated code needs to be created aligning with this `f-f` concept.

## Basic concept of `f-f`

- this uses `frourio.js`
- official doc: https://frourio.com/docs
- repo: https://github.com/frouriojs/frourio

### `f-f` file structure

#### backend-api/api

- file based routing
- controller just takes UseCase class and handles returned promise

##### controller.ts

- some typical controller.ts code given below.

```ts
import { returnPutError, returnSuccess } from "$/app/http/response";
import { AssociateWithNyaaSukebeiTorrentDetailUseCase } from "$/domain/fanzaCrawledData/usecase/AssociateWithNyaaSukebeiTorrentDetail.usecase";
import { defineController } from "./$relay";

export default defineController(() => ({
  get: () => ({ status: 200, body: "Hello" }),
  put: ({ params, body }) =>
    AssociateWithNyaaSukebeiTorrentDetailUseCase.create()
      .handle({
        fanzaContentId: params.fanzaContentId,
        nyaaSukebeiCrawledTorrentDetailId: params.nyaaSukebeiCrawledDataId,
        fanzaCrawledDataPayload: body.fanzaCrawledDataPayload,
      })
      .then(returnSuccess)
      .catch(returnPutError),
}));
```

```ts
import { returnDeleteError, returnSuccess } from "$/app/http/response";
import { DeleteFanzaCrawledDataAssociation } from "$/domain/torrentCrawledData/nyaa/usecase/DeleteFanzaCrawledDataAssociation.usecase";
import { defineController } from "./$relay";

export default defineController(() => ({
  get: () => ({ status: 200, body: "" }),
  delete: ({ params }) =>
    DeleteFanzaCrawledDataAssociation.create()
      .execute({
        torrentId: params.torrentId,
        fanzaCrawledDataId: params.fanzaCrawledDataId,
      })
      .then(returnSuccess)
      .catch(returnDeleteError),
}));
```

```ts
import {
  returnGetError,
  returnPutError,
  returnSuccess,
} from "$/app/http/response";
import { FindOrCreateUseCase } from "$/domain/torrentCrawledData/nyaa/usecase/FindOrCreate.usecase";
import { PaginateNyaaSukebeiCrawledTorrentDetailUseCase } from "$/domain/torrentCrawledData/nyaa/usecase/PaginateNyaaSukebeiCrawledTorrentDetail.usecase";
import { defineController } from "./$relay";

export default defineController(() => ({
  get: ({ query }) =>
    PaginateNyaaSukebeiCrawledTorrentDetailUseCase.create()
      .handle({
        page: query.page,
        limit: query.limit,
        search: query.searchValue ? { value: query.searchValue } : undefined,
      })
      .then(returnSuccess)
      .catch(returnGetError),
  put: ({ body }) =>
    FindOrCreateUseCase.create()
      .handle({
        category: body.category,
        title: body.title,
        link: body.link,
        torrentURL: body.torrentURL,
        magnetLink: body.magnetLink,
        size: body.size,
        uploadedAt: body.uploadedAt,
        seeders: body.seeders,
        leechers: body.leechers,
        downloads: body.downloads,
      })
      .then(returnSuccess)
      .catch(returnPutError),
}));
```

##### index.ts

- this is aspida type definition basically
- since it needs to pass type to frontend API client, it requires importing common types shared with frontend, import from `backend-api/commonTypesWithClient`. The `backend-api/commonTypesWithClient` is also imported as type in `frontend-web` and frontend can import mutual common type definitions.
- typical index.ts example given below

```ts
import type { DefineMethods } from "aspida";

export type Methods = DefineMethods<{
  get: {
    resBody: string;
  };
  delete: {
    resBody: void;
  };
}>;
```

```ts
import { NyaaSukebeiCrawledTorrentDetailModelDto } from "commonTypesWithClient";
import type { DefineMethods } from "aspida";

export type Methods = DefineMethods<{
  get: {
    resBody: {
      crawledTorrentDetail: NyaaSukebeiCrawledTorrentDetailModelDto;
    };
  };
}>;
```

```ts
import {
  PaginationMeta,
  NyaaSukebeiCrawledTorrentDetailModelDto,
} from "commonTypesWithClient";
import type { DefineMethods } from "aspida";

export type Methods = DefineMethods<{
  get: {
    query: {
      page: number;
      limit: number;
      searchValue?: string;
    };
    resBody: {
      data: NyaaSukebeiCrawledTorrentDetailModelDto[];
      meta: PaginationMeta;
    };
  };
  put: {
    reqBody: {
      category: string;
      title: string;
      link: string;
      torrentURL: string;
      magnetLink: string;
      size: string;
      uploadedAt: string;
      seeders: number;
      leechers: number;
      downloads: number;
    };
    resBody: NyaaSukebeiCrawledTorrentDetailModelDto;
  };
}>;
```

#### backend-api/domain

- aspect oriented file structure
- example structure is below
  - typically includes several mutual directory
    - model
    - repository
    - usecase
    - service
- dependency flow
  - usecase can import another usecase, service, repository, model
  - service can import another service, repository, model
  - repository can import model/prisma client
  - model can't import aforementioned layers(usecase, service, repository)

```ts
/home/mikana0918/Code/interfacex/torrent-watcher/backend-api/domain
├── admin
│   ├── model
│   │   └── Admin.model.ts
│   ├── repository
│   │   └── Admin.repository.ts
│   └── usecase
│       ├── InitAdmin.usecase.ts
│       └── SignInAdmin.usecase.ts
├── ikenShoukai
│   ├── repository
│   │   ├── IkenShoukai.repository.ts
│   │   ├── IkenShoukaiCase.repository.ts
│   │   └── IkenShoukaiCaseTorrentIpAddress.repository.ts
│   ├── service
│   │   └── SubmitIkenShoukaiCase.service.ts
│   └── usecase
│       ├── CreateIkenShoukaiCase.usecase.ts
│       ├── ExportIpAddressesAsCsv.usecase.ts
│       ├── PaginateIkenShoukaiCase.usecase.ts
│       ├── PatchUpdateIkenShoukaiCase.usecase.ts
│       ├── ShowIkenShoukaiCase.usecase.ts
│       ├── SubmitIkenShoukaiCase.usecase.ts
│       └── relatedTorrent
│           ├── AddRelatedTorrent.usecase.ts
│           ├── FindManyRelatedTorrent.usecase.ts
│           └── RemoveRelatedTorrent.usecase.ts
├── masterData
│   └── models
│       └── MasterDataModel.ts
```

##### backend-api/domain/model

- model directory
- typically automatically generated by prisma generator `frourio-framework-prisma-generators`
  - without autogenerated model or don't use, need to define original model here
  - with autogenerated model, typically the code just can import the model/DTO type definition in `prisma/__generated__/models/XXXX.model.ts`. (XXX is what you want)
- example model look like this

```ts
import { Prisma, User as PrismaUser } from "@prisma/client";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type UserModelDto = {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type UserModelConstructorArgs = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserModelFromPrismaValueArgs = {
  self: PrismaUser;
};

export class UserModel {
  private readonly _id: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(args: UserModelConstructorArgs) {
    this._id = args.id;
    this._createdAt = args.createdAt;
    this._updatedAt = args.updatedAt;
  }

  static fromPrismaValue(args: UserModelFromPrismaValueArgs) {
    return new UserModel({
      id: args.self.id,
      createdAt: args.self.createdAt,
      updatedAt: args.self.updatedAt,
    });
  }

  toDto() {
    return {
      id: this._id,
      createdAt: this._createdAt?.toISOString() ?? null,
      updatedAt: this._updatedAt?.toISOString() ?? null,
    };
  }

  get id() {
    return this._id;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }
}
```

##### backend-api/domain/repository

- repository class defined
- basically 1:1 associated with prisma model
  - DDD wise, it can be okay to used in the context of aggregation
    - but sometimes confusing with aggregate model
  - let's write more code maybe, create many repository and try to make things work well
- should export interface
- constructor needs to be public since prisma transaction client might be passing
- method name are preffered to have identifier suffixed
  - XXXXById
  - XXXXByUserId
- requires consistent name for method between same directories
  - paginate, create, updateById, count...
- don't return DTO here. just return Model
  - upper layers want to manipulate as Model not DTO

```ts
import { PrismaBaseRepository } from "$/app/foundation/repository/PrismaBaseRepository";
import { createPaginationMeta } from "$/app/paginator/createPaginationMeta";
import { PaginationMeta } from "$/commonTypesWithClient";
import { IkenShoukaiCaseModel } from "$/prisma/__generated__/models/IkenShoukaiCase.model";
import { IkenShoukaiCaseStatus, PrismaClient } from "@prisma/client";

export interface IIkenShoukaiCaseRepository {
  create(args: {
    title: string;
    description?: string;
  }): Promise<IkenShoukaiCaseModel>;
  findById(args: { id: string }): Promise<IkenShoukaiCaseModel | null>;
  updateById(args: {
    id: string;
    payload: {
      title?: string;
      description?: string;
      status?: IkenShoukaiCaseStatus;
    };
  }): Promise<IkenShoukaiCaseModel>;
  paginate(args: {
    limit: number;
    page: number;
  }): Promise<{ data: IkenShoukaiCaseModel[]; meta: PaginationMeta }>;
  addCrawledTorrentDetailsById(args: {
    id: string;
    crawledTorrentDetailIds: string[];
  }): Promise<void>;
  removeCrawledTorrentDetailsById(args: {
    id: string;
    crawledTorrentDetailIds: string[];
  }): Promise<void>;
  count(): Promise<number>;
  findAllForEnqueueDownloadingTorrents(): Promise<IkenShoukaiCaseModel[]>;
}

export class IkenShoukaiCaseRepository
  extends PrismaBaseRepository
  implements IIkenShoukaiCaseRepository
{
  constructor(args: { prisma: PrismaClient }) {
    super(args);
  }

  async create(args: { title: string; description?: string }) {
    const data = await this._prisma.ikenShoukaiCase.create({
      data: {
        title: args.title,
        description: args.description,
        status: IkenShoukaiCaseStatus.BEFORE_APPLICATIION_SENT, // デフォルト
      },
    });

    return IkenShoukaiCaseModel.fromPrismaValue({
      self: data,
      ikenShoukaiCaseNyaaSukebeiCrawledTorrentDetail: [],
      ikenShoukaiCaseTorrentIpAddress: [],
      kaijiSeikyuCase: [],
    });
  }

  async findById(args: { id: string }) {
    const data = await this._prisma.ikenShoukaiCase.findUnique({
      where: { id: args.id },
      include: {
        IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail: true,
        IkenShoukaiCaseTorrentIpAddress: true,
        kaijiSeikyuCase: true,
      },
    });

    if (!data) return null;

    return IkenShoukaiCaseModel.fromPrismaValue({
      self: data,
      ikenShoukaiCaseNyaaSukebeiCrawledTorrentDetail:
        data.IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail || [],
      ikenShoukaiCaseTorrentIpAddress:
        data.IkenShoukaiCaseTorrentIpAddress || [],
      kaijiSeikyuCase: data.kaijiSeikyuCase || [],
    });
  }

  async updateById(args: {
    id: string;
    payload: {
      title?: string;
      description?: string;
      status?: IkenShoukaiCaseStatus;
    };
  }) {
    const data = await this._prisma.ikenShoukaiCase.update({
      where: { id: args.id },
      data: args.payload,
      include: {
        IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail: true,
        kaijiSeikyuCase: true,
      },
    });

    return IkenShoukaiCaseModel.fromPrismaValue({
      self: data,
      ikenShoukaiCaseNyaaSukebeiCrawledTorrentDetail:
        data.IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail || [],
      ikenShoukaiCaseTorrentIpAddress: [],
      kaijiSeikyuCase: data.kaijiSeikyuCase || [],
    });
  }

  async paginate(args: { limit: number; page: number }) {
    const data = await this._prisma.ikenShoukaiCase.findMany({
      take: args.limit,
      skip: args.limit * (args.page - 1),
      orderBy: { createdAt: "desc" },
      include: {
        IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail: true,
        IkenShoukaiCaseTorrentIpAddress: true,
        kaijiSeikyuCase: true,
      },
    });

    return {
      data: data.map((d) =>
        IkenShoukaiCaseModel.fromPrismaValue({
          self: d,
          ikenShoukaiCaseNyaaSukebeiCrawledTorrentDetail:
            d.IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail || [],
          ikenShoukaiCaseTorrentIpAddress:
            d.IkenShoukaiCaseTorrentIpAddress || [],
          kaijiSeikyuCase: d.kaijiSeikyuCase || [],
        })
      ),
      meta: createPaginationMeta({
        totalCount: await this._prisma.ikenShoukaiCase.count(),
        perPage: args.limit,
      }),
    };
  }

  async addCrawledTorrentDetailsById(args: {
    id: string;
    crawledTorrentDetailIds: string[];
  }) {
    await this._prisma.ikenShoukaiCase_NyaaSukebeiCrawledTorrentDetail.createMany(
      {
        data: args.crawledTorrentDetailIds.map((id) => ({
          ikenShoukaiCaseId: args.id,
          nyaaSukebeiCrawledTorrentDetailId: id,
        })),
      }
    );
  }

  async removeCrawledTorrentDetailsById(args: {
    id: string;
    crawledTorrentDetailIds: string[];
  }) {
    await this._prisma.ikenShoukaiCase_NyaaSukebeiCrawledTorrentDetail.deleteMany(
      {
        where: {
          ikenShoukaiCaseId: args.id,
          nyaaSukebeiCrawledTorrentDetailId: {
            in: args.crawledTorrentDetailIds,
          },
        },
      }
    );
  }

  async count() {
    return this._prisma.ikenShoukaiCase.count();
  }

  async findAllForEnqueueDownloadingTorrents() {
    const data = await this._prisma.ikenShoukaiCase.findMany({
      include: {
        IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail: true,
      },
    });

    return data.map((el) =>
      IkenShoukaiCaseModel.fromPrismaValue({
        self: el,
        ikenShoukaiCaseNyaaSukebeiCrawledTorrentDetail:
          el.IkenShoukaiCase_NyaaSukebeiCrawledTorrentDetail,
        ikenShoukaiCaseTorrentIpAddress: [],
        kaijiSeikyuCase: [],
      })
    );
  }
}
```

##### backend-api/domain/service

- encapsulates common business logics seen in usecase
- declare its own interface and implement this
- follows `f-f` class coding rule
  - private fields starts with `_` and look like `private readonly _fields: FieldA`
  - constructor should be private
  - create factory method called `create` and initialize the class there
  - setup execution public method
    - sometimes several method can be used
      - handleById(args: {id: string})
      - handleByUserid(args: {userId: string})

```ts
import {
  IIkenShoukaiCaseRepository,
  IkenShoukaiCaseRepository,
} from "../repository/IkenShoukaiCase.repository";
import { getPrismaClient } from "$/service/getPrismaClient";
// more imports...

export interface ISubmitIkenShoukaiCaseService {
  handleByCaseId: (args: { caseId: string }) => Promise<void>;
}

export class SubmitIkenShoukaiCaseService
  implements ISubmitIkenShoukaiCaseService
{
  private readonly _ikenShoukaiCaseRepository: IIkenShoukaiCaseRepository;
  private readonly _ikenShoukaiRepository: IIkenShoukaiRepository;
  private readonly _openSearchMonitoredIPAddressesGateway: IOpenSearchMonitoredIPAddressesGateway;
  private readonly _ikenShoukaiCaseTorrentIpAddressRepository: IIkenShoukaiCaseTorrentIpAddressRepository;
  private readonly _maxmindGateway: IMaxmindGateway;

  private constructor(args: {
    ikenShoukaiCaseRepository: IIkenShoukaiCaseRepository;
    ikenShoukaiRepository: IIkenShoukaiRepository;
    openSearchMonitoredIPAddressesGateway: IOpenSearchMonitoredIPAddressesGateway;
    ikenShoukaiCaseTorrentIpAddressRepository: IIkenShoukaiCaseTorrentIpAddressRepository;
    maxMindGateway: IMaxmindGateway;
  }) {
    this._ikenShoukaiCaseRepository = args.ikenShoukaiCaseRepository;
    this._ikenShoukaiRepository = args.ikenShoukaiRepository;
    this._openSearchMonitoredIPAddressesGateway =
      args.openSearchMonitoredIPAddressesGateway;
    this._ikenShoukaiCaseTorrentIpAddressRepository =
      args.ikenShoukaiCaseTorrentIpAddressRepository;
    this._maxmindGateway = args.maxMindGateway;
  }

  static create() {
    return new SubmitIkenShoukaiCaseService({
      ikenShoukaiCaseRepository: new IkenShoukaiCaseRepository({
        prisma: getPrismaClient(),
      }),
      ikenShoukaiRepository: new IkenShoukaiRepository({
        prisma: getPrismaClient(),
      }),
      openSearchMonitoredIPAddressesGateway:
        OpenSearchMonitoredIPAddressesGateway.create(),
      ikenShoukaiCaseTorrentIpAddressRepository:
        new IkenShoukaiCaseTorrentIpAddressRepository({
          prisma: getPrismaClient(),
        }),
      maxMindGateway: MaxmindGateway.create(),
    });
  }

  async handleByCaseId(args: { caseId: string }) {
    await this._ikenShoukaiCaseRepository.updateById({
      id: args.caseId,
      payload: {
        status: "CASE_SUBMITTED",
      },
    });

    // TODO: implement continues...
  }
}
```

##### backend-api/domain/usecase

- mostly looks similar to usecase however it is the core of our backend business logic
- all the logic flows are here together
- unlike service, it won't export it's interface
  - unlike service, it will be just used in api directly thus don't need interface definition

```ts
import { ISNSService, SNSService } from "$/app/providers/aws/sns/SNS.service";
import { snsConfig } from "$/app/providers/aws/sns/config";
import { getPrismaClient } from "$/service/getPrismaClient";
import {
  IIkenShoukaiCaseRepository,
  IkenShoukaiCaseRepository,
} from "../repository/IkenShoukaiCase.repository";

export class SubmitIkenShoukaiCaseUseCase {
  private readonly _snsService: ISNSService;
  private readonly _ikenShoukaiCaseRepository: IIkenShoukaiCaseRepository;

  private constructor(args: {
    snsService: ISNSService;
    ikenShoukaiCaseRepository: IIkenShoukaiCaseRepository;
  }) {
    this._snsService = args.snsService;
    this._ikenShoukaiCaseRepository = args.ikenShoukaiCaseRepository;
  }

  static create() {
    return new SubmitIkenShoukaiCaseUseCase({
      snsService: SNSService,
      ikenShoukaiCaseRepository: new IkenShoukaiCaseRepository({
        prisma: getPrismaClient(),
      }),
    });
  }

  async handleByCaseId(args: { caseId: string }) {
    await this._ikenShoukaiCaseRepository.updateById({
      id: args.caseId,
      payload: {
        status: "CASE_SUBMISSION_PROCESSING",
      },
    });

    this._snsService.publish({
      topicArn: snsConfig.topics.backendWorker.submitIkenShoukaiCase.arn,
      message:
        snsConfig.topics.backendWorker.submitIkenShoukaiCase.defineMessagePayload(
          {
            caseId: args.caseId,
            taskType: "SUBMIT_IKEN_SHOUKAI_CASE",
          }
        ),
    });
  }
}
```
