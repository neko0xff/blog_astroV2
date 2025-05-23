CC1:=docker compose
CC2:=deno
CC3:=deployctl
IMAGE:=blog_astroV2

.PHONY: img_build img_up img_logs img_stop img_clean  deno_install deno_build deno_pagefind  deno_clean  deno_serve deno_debug deno_deploy deno_bench

all: build_image

# Build Option
build_image: img_stop img_clean img_build																	# Build: Container Image(docker)
build_local: deno_clean deno_install deno_build		 													# Build: Local Deno Project

# Commends
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
	$(MAKE) deno_pagefind

deno_pagefind:
	@echo "Find Page "
	@$(CC2) task pagefind
	mkdir -p public/pagefind
	cp -r dist/pagefind/* public/pagefind/

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

deno_bench:
	@echo "Running Bench Script"
	@$(CC2) task bench

deno_clean:
	@echo "Start Clean Package"
	@rm -rf node_modules
	@rm -rf dist
	@rm -rf public/pagefind
	@$(CC2) clean
