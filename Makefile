.PHONY: build serve watch build-chatgpt serve-chatgpt watch-chatgpt

build:
	node scripts/build-userscripts.mjs $(SCRIPT)

serve:
	USERSCRIPTS_BUILD_CONTEXT=serve node scripts/build-userscripts.mjs $(SCRIPT)
	python3 -m http.server 8787 --directory dist

watch:
	node scripts/watch-userscripts.mjs $(SCRIPT)

build-chatgpt:
	$(MAKE) build SCRIPT=chatgpt-copy-all-turns

serve-chatgpt:
	$(MAKE) serve SCRIPT=chatgpt-copy-all-turns

watch-chatgpt:
	$(MAKE) watch SCRIPT=chatgpt-copy-all-turns
