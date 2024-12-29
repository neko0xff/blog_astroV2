CC1:=docker compose
CC2:=deno
IMAGE:=blog_astroV2

.PHONY: img_build img_up img_logs img_stop img_clean  deno_install deno_build  deno_clean  format  lint

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
	@$(CC2) task install

deno_build:
	@$(CC2) task build

deno_preview:
	# default port: 8085/tcp
	@$(CC2) task preview

deno_clean:
	@echo "Start Clean Package"
	@rm -rf node_modules
	@rm -rf dist
	@$(CC2) clean
