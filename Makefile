CC1:=docker compose
CC2:=deno
CC3:=deployctl
IMAGE:=blog_astroV2

.PHONY: img_build img_up img_logs img_stop img_clean  deno_install deno_build  deno_clean  deno_serve deno_debug deno_deploy

all: img_stop img_clean img_build 

img_build:
	@$(CC1) up --build -d

img_up:
	@$(CC1) up -d

img_logs:
	@$(CC1) logs --tail=100 -f

img_stop:
	@$(CC1) stop

img_clean:
	@$(CC1) down

deno_install:
	@echo "Install Dependencies Package"
	@$(CC2) task install

deno_build:
	@echo "Build static Pages"
	@$(CC2) task build

deno_serve:
	@$(CC2) task serve

deno_debug:
	@$(CC2) task start

deno_preview:
	# default port: 8085/tcp
	@$(CC2) task preview

deno_format_check:
	@echo "Check Format"
	@$(CC2) task lint
	@$(CC2) task format

deno_deploy_test:
	@echo "Start Deploy to Deno Deploy(Test)"
	@${CC3} deploy --project="neko-0xff-blog" --entrypoint="./dist/server/entry.mjs" --root="./dist"

deno_deploy_release:
	@echo "Start Deploy to Deno Deploy(Release)"
	@${CC3} deploy --project="neko-0xff-blog" --entrypoint="./dist/server/entry.mjs" --root="./dist" --prod

deno_clean:
	@echo "Start Clean Package"
	@rm -rf node_modules
	@rm -rf dist
	@$(CC2) clean
