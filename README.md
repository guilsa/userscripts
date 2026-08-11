# Userscripts

## Local Tampermonkey Development

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

Open the generated userscript URL in Firefox and confirm the Tampermonkey installation:

```text
http://127.0.0.1:8787/chatgpt-copy-all-turns.user.js
```

### Updating

1. Run `make build`, `make build SCRIPT=<name>`, or leave `make watch` running.
2. In Tampermonkey, enable Automatic installation with a suitable update-check interval. If you leave it disabled, check for userscript updates and install the available update manually.
3. Reload the matching site.

After the initial installation, do not open the generated URL again. The server only needs to be running when Tampermonkey checks for an update. The last installed script continues to run while it is off.

### Adding a Script

1. Add its source and standard userscript metadata.
2. Add its name, source path, and output filename to `userscripts.json`.
3. Build and install the generated `http://127.0.0.1:8787/<output>.user.js` URL once.
