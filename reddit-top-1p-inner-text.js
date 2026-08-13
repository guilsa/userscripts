// ==UserScript==
// @name         Reddit Top 1% — Extract Inner Text
// @namespace    https://violentmonkey.github.io/
// @version      2.2
// @description  Extracts the comments from each "Top 1% Commenter" badge by traversing the DOM.
// @author       Gui
// @match        https://www.reddit.com/r/*
// @grant        none
// ==/UserScript==

;(function () {
	'use strict'

	let comments = []

	function extractComments() {
		comments = []
		const allSpans = document.querySelectorAll('span.pr-3xs')

		for (const span of allSpans) {
			if (span.textContent.trim() !== 'Top 1% Commenter') continue

			let detailsEl = span.closest('details')

			if (!detailsEl) continue

			comments.push(detailsEl.childNodes[3].childNodes[5].innerText)
		}

		console.log('comments', comments)
	}

	function copyComments() {
		if (comments.length === 0) {
			extractComments()
		}
		if (comments.length === 0) return
		const text = comments.join('\n\n')
		navigator.clipboard.writeText(text).then(() => {
			console.log(`Copied ${comments.length} comments to clipboard`)
		})
	}

	// Key binding: Ctrl+Shift+C to copy
	document.addEventListener('keydown', (e) => {
		const parts = ['ctrl', 'shift', 'c']
		const pressed = []
		if (e.ctrlKey) pressed.push('ctrl')
		if (e.shiftKey) pressed.push('shift')
		if (e.altKey) pressed.push('alt')
		pressed.push(e.key.toLowerCase())
		if (JSON.stringify(pressed) === JSON.stringify(parts)) {
			e.preventDefault()
			copyComments()
		}
	})

	// Run after page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', extractComments)
	} else {
		extractComments()
	}
})()
