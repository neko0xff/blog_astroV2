# 如何運行該專案

[回專案主頁](.././README.md)

## 手動
### 在本地開發環境

Then start the project by running the following commands:

- npm
    ```bash
    # install dependencies
    npm run install
    
    # start running the project
    npm run dev
    ```

- deno
    ```bash
    # install dependencies
    deno task install
    
    # start running the project
    deno task start
    deno task dev
    ```

### 打包成容器

As an alternative approach, if you have Docker installed, you can use Docker to run this project locally. Here's how:

```bash
# Build the Docker image
docker build -t blog_astroV2 .

# Run the Docker container
docker run -p 8085:80 blog_astroV2
```

## 使用專案內的自動化腳本
- 預設: 建置成容器
- 指令
    * `deno_xxx`: 使用 deno 做為開發選項
    * `img_xxx`: 建置成容器選項

## 開發時的指令

All commands are run from the root of the project, from a terminal:

> **_Note!_** 
> For `Docker` commands we must have it [installed](https://docs.docker.com/engine/install/) in your machine.

| Command                              | Action                                                                                                                           |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `deno task install`                        | Installs dependencies                                                                                                            |
| `deno task dev`                        | Starts local dev server at `localhost:8085`                                                                                      |
| `deno task build`                      | Build your production site to `./dist/`                                                                                          |
| `deno task preview`                    | Preview your build locally, before deploying                                                                                     |
| `deno task format:check`               | Check code format with Prettier                                                                                                  |
| `deno task format`                     | Format codes with Prettier                                                                                                       |
| `deno task sync`                       | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `deno task lint`                       | Lint with ESLint                                                                                                                 |
| `docker compose up -d`               | Run AstroPaper on docker, You can access with the same hostname and port informed on `dev` command.                              |
| `docker compose run app npm install` | You can run any command above into the docker container.                                                                         |
| `docker build -t astropaper .`       | Build Docker image                                                                                               |
| `docker run -p 4321:80 astropaper`   | Run AstroPaper on Docker. The website will be accessible at `http://localhost:4321`.                                             |

> **_Warning!_** Windows PowerShell users may need to install the [concurrently package](https://www.npmjs.com/package/concurrently) if they want to [run diagnostics](https://docs.astro.build/en/reference/cli-reference/#astro-check) during development (`astro check --watch & astro dev`). For more info, see [this issue](https://github.com/satnaing/astro-paper/issues/113).