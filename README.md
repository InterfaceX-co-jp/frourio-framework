## Ecosystem

- [frourio-framework-prisma-generators](https://github.com/InterfaceX-co-jp/frourio-framework-prisma-generators)
  - prisma generator that keeps your DX and speed 🚀

## Root Commands

```bash
# At root dir
cd frourio-framework
```

Setup .env

```bash
# With makefile
make env-setup-local
```

Run the app

```bash
# Let's run DB containers to begin with
docker-compose up -d

# Run npm install for all the directories
make install

# Run dev server for both frontend & backend
npm run dev
```

## Use Supabase At Local Environment

①

```bash
# move directory to frontend
cd frontend-web
```

②

```bash
# initialize supabase cofiguration
npx supabase init
```

③

```bash
# Let's staet Supabase
npx supabase start
```

After a moment, local keys and configurations will be generated.

④

Create fields for "NEXT_PUBLIC_SUPABASE_URL" and "NEXT_PUBLIC_SUPABASE_ANON_KEY" in your .env.local file,
and set their values to the "API URL" and "anon key", respectively.

⑤

Access the Studio URL for initial setup.

    1)Navigate to the Storage section and create a new bucket.

    2)Go to the Policies section under Storage and create your storage policies (make sure to pay attention to the bucket name, folder name, and allowed file extensions, as they are case-sensitive).

⑥

Finally, call the API to perform actual uploads and other operations.

## Enter ECS tasks in the Staging environment via SSM Session Manager

### What you need

- AWS CLI
- [AWS SSM Plugin](https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/session-manager-working-with-install-plugin. html)

### Reference.

- [SSH connection to ECS Fargate using SSM (Qiita)](https://qiita.com/kouji0705/items/005ea6d7c21ddd24ebb3)

```bash
$ cd frourio-framework
$ sh . /scripts/ecs_exec_stg -t ((task-id)) # Example) . /scripts/ecs_exec_stg -t 941f8694308b4adea44cb07ff9e50c30
```

## Deployment config

### Railway 
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/yiamej?referralCode=NtAl-c)

### AWS Amplify(frontend)

```yml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd ../
            - npm install --prefix frontend-web
            - npm install --prefix backend-api
        build:
          commands:
            - cd frontend-web
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - "**/*"
      cache:
        paths:
          - .next/cache/**/*
          - .npm/**/*
    appRoot: frontend-web
```
