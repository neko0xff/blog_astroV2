CC1:=docker compose
CC2:=deno
CC3:=npm
IMAGE:=blog

.PHONY: build up logs stop img_clean  deno_dev  npm_update

all: build

build:
	@$(CC1) up --build -d

up:
	@$(CC1) up -d

logs:
	@$(CC1) logs --tail=100 -f

stop:
	@$(CC1) stop

img_clean:
	@$(CC1) down

npm_update:
	@$(CC3) update

deno_dev:
	@$(CC2) task dev