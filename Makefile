.PHONY: build serve watch

build:
	node scripts/build-userscripts.mjs $(SCRIPT)

serve:
	USERSCRIPTS_BUILD_CONTEXT=serve node scripts/build-userscripts.mjs $(SCRIPT)
	python3 -m http.server 8787 --directory dist

watch:
	node scripts/watch-userscripts.mjs $(SCRIPT)

