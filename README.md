# Userscripts

## Local Violentmonkey Development

`userscripts.json` is the manifest for scripts published through the local development server. The build generates versioned artifacts in `dist/` and injects their `@updateURL` and `@downloadURL` metadata.

Build every manifest entry:

```sh
make build
```

Build one entry:

```sh
make build SCRIPT=chatgpt-copy-all-turns
```

Serve all generated files at `http://127.0.0.1:8787`:

```sh
make serve
```

Build output lists install links by source-file modification time, newest first.

Watch every manifest entry and rebuild on changes:

```sh
make watch
```

Watch one entry:

```sh
make watch SCRIPT=chatgpt-copy-all-turns
```

The `build-chatgpt`, `serve-chatgpt`, and `watch-chatgpt` commands remain as shortcuts for the existing script.

For active development, keep two terminals open:

```sh
# Terminal 1: serve generated artifacts
make serve

# Terminal 2: rebuild after each source save
make watch
```

Restart the watcher after adding or removing manifest entries so it watches the updated source list.

### Initial Installation

Open a generated userscript URL in Firefox and confirm the Violentmonkey installation:

```text
http://127.0.0.1:8787/chatgpt-copy-all-turns.user.js
http://127.0.0.1:8787/folha-sp.user.js
http://127.0.0.1:8787/google-hn-points.user.js
http://127.0.0.1:8787/hacker-news-highlighter.user.js
http://127.0.0.1:8787/reddit-top-1p-inner-text.user.js
http://127.0.0.1:8787/reddit.user.js
http://127.0.0.1:8787/techmeme-highlighter.user.js
```

### Updating

1. Run `make build`, `make build SCRIPT=<name>`, or leave `make watch` running.
2. In Violentmonkey, use Check for updates to install the latest local build. You can instead enable automatic updates, but its interval is not intended for rapid development.
3. Reload the matching site.

After the initial installation, do not open the generated URL again. The server only needs to be running when Violentmonkey checks for an update. The last installed script continues to run while it is off.

### Migrating from Tampermonkey

1. Disable the Tampermonkey copy before enabling the same script in Violentmonkey, so both managers do not run it.
2. Install the generated userscript URL through Violentmonkey.
3. Verify the script on its matching site before removing the Tampermonkey copy.

### Validation Checklist

1. ChatGPT: press `Ctrl` + `Shift` + `C` and verify all turns are copied.
2. Hacker News: verify commenter highlighting, bios, and keyboard navigation.
3. Google: search for Hacker News results, press `Control` + `Shift` + `H`, and verify every HN result gets a points badge.
4. Reddit: verify badge highlighting/navigation and comment extraction.
5. Folha: verify unwanted sections are removed.
6. Techmeme: verify Bloomberg references are highlighted.

### Headless Integration Test

The sibling [userscript-agent-runtime](https://github.com/guilsa/userscript-agent-runtime) repository provides deterministic Playwright coverage for `google-hn-points.js`, including comment-to-story resolution, persistent cache rendering, and expired-score refreshes:

```sh
cd ../userscript-agent-runtime
npm run test:reference
```

### Adding a Script

1. Add its source and standard userscript metadata.
2. Add its name, source path, and output filename to `userscripts.json`.
3. Build and install the generated `http://127.0.0.1:8787/<output>.user.js` URL once.
