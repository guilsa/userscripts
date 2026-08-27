import { watchFile } from 'node:fs'
import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile('userscripts.json', 'utf8'))
const scriptNames = process.argv.slice(2)
const selectedNames = scriptNames.length ? scriptNames : Object.keys(manifest.scripts)
const sourcePaths = selectedNames.map((name) => {
	const script = manifest.scripts[name]
	if (!script) throw new Error(`Unknown userscript: ${name}`)
	return script.source
})
const watchedPaths = ['userscripts.json', ...sourcePaths]
let buildInProgress = false
let rebuildQueued = false
let rebuildTimer

function build() {
	if (buildInProgress) {
		rebuildQueued = true
		return
	}

	buildInProgress = true
	const child = spawn(process.execPath, ['scripts/build-userscripts.mjs', ...scriptNames], {
		env: { ...process.env, USERSCRIPTS_BUILD_CONTEXT: 'watch' },
		stdio: 'inherit',
	})

	child.on('exit', () => {
		buildInProgress = false
		if (rebuildQueued) {
			rebuildQueued = false
			build()
		}
	})
}

function scheduleBuild(changedPath) {
	console.log(`\n[change] ${changedPath}`)
	clearTimeout(rebuildTimer)
	rebuildTimer = setTimeout(build, 300)
}

for (const path of watchedPaths) {
	watchFile(path, { interval: 300 }, (current, previous) => {
		if (current.mtimeMs !== previous.mtimeMs) {
			scheduleBuild(path)
		}
	})
}

console.log(`Watching ${watchedPaths.join(', ')}`)
build()
