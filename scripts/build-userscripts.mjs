import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile('userscripts.json', 'utf8'))
const scriptNames = process.argv.slice(2)
const selectedNames = scriptNames.length ? scriptNames : Object.keys(manifest.scripts)
const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
const version = `${timestamp.slice(0, 8)}.${timestamp.slice(8)}`
const useColor = process.stdout.isTTY
const buildContext = process.env.USERSCRIPTS_BUILD_CONTEXT

function style(code, text) {
	return useColor ? `\u001B[${code}m${text}\u001B[0m` : text
}

const bold = (text) => style(1, text)
const blue = (text) => style(34, text)
const cyan = (text) => style(36, text)
const dim = (text) => style(2, text)
const green = (text) => style(32, text)

function setMetadata(source, name, value) {
	const line = `// @${name.padEnd(12)} ${value}`
	const pattern = new RegExp(`^// @${name}\\s+.*$`, 'm')

	return pattern.test(source)
		? source.replace(pattern, line)
		: source.replace('// ==/UserScript==', `${line}\n// ==/UserScript==`)
}

const selectedScripts = await Promise.all(selectedNames.map(async (name) => {
	const script = manifest.scripts[name]
	if (!script) throw new Error(`Unknown userscript: ${name}`)

	const { mtime } = await stat(script.source)
	return { name, script, updatedAt: mtime }
}))

selectedScripts.sort((left, right) => (
	right.updatedAt - left.updatedAt || left.name.localeCompare(right.name)
))

await mkdir('dist', { recursive: true })

for (const { script, updatedAt } of selectedScripts) {
	const url = `${manifest.server}/${script.output}`
	let output = await readFile(script.source, 'utf8')
	output = setMetadata(output, 'version', version)
	output = setMetadata(output, 'updateURL', url)
	output = setMetadata(output, 'downloadURL', url)

	await writeFile(`dist/${script.output}`, output)
	console.log(`\n${green('[built]')} ${bold(`dist/${script.output}`)}`)
	console.log(`  ${dim('Version')}  ${cyan(version)}`)
	console.log(`  ${dim('Updated')}  ${updatedAt.toLocaleString()}`)
	console.log(`  ${dim('URL')}      ${blue(url)}`)
}

if (!buildContext) {
	console.log(`\n${bold('Next steps')}`)
	console.log(`  1. ${dim('Serve')}   ${cyan('make serve')}`)
	console.log(`  2. ${dim('Install')} Open a URL above in Firefox with Violentmonkey enabled.`)
	console.log(`  3. ${dim('Update')}  Rebuild, check for updates in Violentmonkey, then reload the site.`)
}
