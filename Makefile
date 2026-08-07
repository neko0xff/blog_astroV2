DOCKER := docker compose
DENO   := deno

.PHONY: help all \
	build_image build_local \
	img_build img_up img_logs img_stop img_clean \
	deno_install deno_build deno_pagefind deno_clean \
	deno_debug deno_preview deno_serve deno_bench deno_format_check \
	deno_deploy_test deno_deploy_release

help: ## Show all available targets
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_]+:.*?## ' $(MAKEFILE_LIST) \
		| awk -F ':.*?## ' '{printf "  %-22s %s\n", $$1, $$2}'

all: build_image ## Default target: build and start Docker container

build_image: img_clean img_build ## Rebuild image (down) and start container (up --build -d)
build_local: deno_clean deno_install deno_build ## Local build (clean + install + build + pagefind)

img_build: ## Build image and start container (background)
	@$(DOCKER) up --build -d

img_up: ## Start container (background)
	@$(DOCKER) up -d

img_logs: ## Follow container logs (last 100 lines)
	@$(DOCKER) logs --tail=100 -f

img_stop: ## Stop container
	@$(DOCKER) stop

img_clean: ## Stop and remove container
	@$(DOCKER) down

deno_install: ## Install dependencies Package
	@echo "Install Dependencies Package"
	@$(DENO) task install

deno_build: ## Build static pages and generate search index
	@echo "Build static Pages"
	@$(DENO) task build
	@$(DENO) task pagefind

deno_pagefind: ## Generate Pagefind search index
	@echo "Find Page"
	@$(DENO) task pagefind

deno_debug: ## Start dev server
	@$(DENO) task start

deno_preview: ## Preview build result (default 8085/tcp)
	@$(DENO) task preview

deno_serve: ## Serve static files via dist/server.ts
	@$(DENO) task serve

deno_format_check: ## Check code style (deno lint + prettier check)
	@echo "Check Format"
	@$(DENO) task lint
	@$(DENO) task format:check

deno_bench: ## Run benchmarks
	@echo "Running Bench Script"
	@$(DENO) task bench

deno_clean: ## Clean build artifacts and cache
	@echo "Start Clean Package"
	@$(DENO) task clean
	@$(DENO) clean

deno_deploy_test: deno_build ## Deploy to Deno Deploy (test)
	@echo "Start Deploy to Deno Deploy(Test)"
	@$(DENO) task deploy:test

deno_deploy_release: deno_build ## Deploy to Deno Deploy (production)
	@echo "Start Deploy to Deno Deploy(Release)"
	@$(DENO) task deploy:release
