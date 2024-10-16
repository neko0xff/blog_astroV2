CC1:=docker compose
CC2:=deno
CC3:=npm
IMAGE:=blog

.PHONY: img_build img_up img_logs img_stop img_clean  npm_update deno_build deno_dev deno_serve format  lint

all: img_stop img_build

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

npm_update:
	@$(CC3) update

deno_dev:
	@$(CC2) task dev

deno_build:
	@$(CC2) task build

deno_serve:
	@$(CC2) task serve

format:
	@$(CC3) run format_biome

lint:
	@$(CC3)  lint_biome 