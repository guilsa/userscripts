<div align="center">

# 🐒 Userscripts

**Small browser fixes for the sites I use every day.**

</div>

A personal collection of Violentmonkey scripts for Google, [Techmeme](https://www.techmeme.com/), [Hacker News](https://news.ycombinator.com/), ChatGPT, Reddit, [Folha de S.Paulo](https://www.folha.uol.com.br/).

Everything is plain JavaScript.

## Scripts

- 🌘 `chatgpt-background` — tweaks the ChatGPT dark-mode background color.
- 📋 `chatgpt-copy-all-turns` — copies an entire conversation as Markdown (Ctrl+Shift+C).
- 🔎 `google-hn-points` — shows HN points beside Google search results (Ctrl+Shift+H).
- 🗞️ `hacker-news-highlighter` — highlights commenters and shows their bios on hover (Ctrl+Shift+N/P).
- 🏅 `reddit` — highlights Top 1% badges and jumps between them (Ctrl+Shift+N/P).
- ✂️ `reddit-top-1p-inner-text` — extracts the text of Top 1% comments.
- 📰 `techmeme-highlighter` — highlights "Bloomberg" on Techmeme.
- 🇧🇷 `folha-sp` — removes sponsor and partnership sections from Folha.

## Quick start

Build every script and serve the install links locally:

```sh
make serve
```

Open one of the printed URLs in Firefox with Violentmonkey enabled. After that first install, rebuild when a script changes and let Violentmonkey update the installed copy.

### How updates work

Violentmonkey runs its own installed copy; it does not execute files from `dist/` directly. The local server makes generated scripts reachable through their `@updateURL` and `@downloadURL` metadata, so it only needs to be running during installation or update checks.

## Development

`userscripts.json` is the manifest for scripts published through the local development server. The build generates versioned artifacts in `dist/` and injects their `@updateURL` and `@downloadURL` metadata.

Build every manifest entry:

```sh
make build
```

Build one entry:

```sh
make build SCRIPT=chatgpt-copy-all-turns
```

Serve all generated files at `http://127.0.0.1:8787` (this also builds first):

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

For active development, keep two terminals open:

```sh
# Terminal 1: serve generated artifacts
make serve

# Terminal 2: rebuild after each source save
make watch
```

Restart the watcher after adding or removing manifest entries so it watches the updated source list.

### Installing

Open a generated userscript URL in Firefox and confirm the Violentmonkey installation:

```text
http://127.0.0.1:8787/chatgpt-background.user.js
http://127.0.0.1:8787/chatgpt-copy-all-turns.user.js
http://127.0.0.1:8787/folha-sp.user.js
http://127.0.0.1:8787/google-hn-points.user.js
http://127.0.0.1:8787/hacker-news-highlighter.user.js
http://127.0.0.1:8787/reddit-top-1p-inner-text.user.js
http://127.0.0.1:8787/reddit.user.js
http://127.0.0.1:8787/techmeme-highlighter.user.js
```

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
