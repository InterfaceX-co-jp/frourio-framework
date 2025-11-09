# https://www.client9.com/self-documenting-makefiles/
help: ## Shows help
	@awk -F ':|##' '/^[^\t].+?:.*?##/ {\
	printf "\033[36m%-30s\033[0m %s\n", $$1, $$NF \
	}' $(MAKEFILE_LIST)

install: ## Install All Directories
	npm i 
	npm i --prefix backend-api 
	npm i --prefix frontend-web

npm-audit: ## Run npm audit
	npm audit
	npm audit --prefix backend-api
	npm audit --prefix frontend-web

npm-audit-fix: ## Run npm audit fix
	npm audit fix
	npm audit fix --prefix backend-api
	npm audit fix --prefix frontend-web

env-setup-local: ## Setup dotenvs
	cp backend-api/.env.example backend-api/.env	
	cp frontend-web/.env.local.example frontend-web/.env.local

package-reset-safe: ## Remove node_modules and package-lock.json safely
	rm -rf node_modules package-lock.json
	rm -rf backend-api/node_modules backend-api/package-lock.json
	rm -rf frontend-web/node_modules frontend-web/package-lock.json


.DEFAULT_GOAL=help
.PHONY=help