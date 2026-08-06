// ==UserScript==
// @name         Reddit Top 1% — Extract Inner Text v2
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Extracts the username from each "Top 1% Commenter" badge by traversing the DOM.
// @author       Gui
// @match        https://www.reddit.com/r/*
// @grant        none
// ==/UserScript==

;(function () {
	'use strict'

	function extractUsernames() {
		const allSpans = document.querySelectorAll('span.pr-3xs')
		const usernames = []

		for (const span of allSpans) {
			if (span.textContent.trim() !== 'Top 1% Commenter') continue

			// Build the path from span upward for debugging
			let el = span
			const path = [el.tagName.toLowerCase()]
			while (el.parentNode) {
				el = el.parentNode
				path.push(el.tagName.toLowerCase())
			}
			console.log('[reddit-top-1p] Path from span:', path.join(' > '))

			// Find the <summary> by walking up from the span
			let summaryEl = span
			for (let i = 0; i < 8; i++) {
				summaryEl = summaryEl.parentNode
				if (!summaryEl) break
			}

			// Verify we landed on a <summary>
			if (!summaryEl || summaryEl.tagName.toLowerCase() !== 'summary') {
				throw new Error(
					`Expected <summary> after 8 parent traversals, got ${summaryEl ? '<' + summaryEl.tagName.toLowerCase() + '>' : 'undefined'}`
				)
			}

			// Extract the username
			const username = summaryEl.childNodes[3].childNodes[5].innerText
			usernames.push(username)
		}

		console.log('[reddit-top-1p] Extracted usernames:', usernames)
		console.log(`[reddit-top-1p] Count: ${usernames.length}`)
	}

	// Run after page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', extractUsernames)
	} else {
		extractUsernames()
	}
})()
