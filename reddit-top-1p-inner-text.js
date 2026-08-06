// ==UserScript==
// @name         Reddit Top 1% — Extract Inner Text
// @namespace    http://tampermonkey.net/
// @version      1.0
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

			// Traverse up 8 parent levels
			let el = span
			for (let i = 0; i < 8; i++) {
				el = el.parentNode
			}

			// Verify we landed on a <summary>
			if (el.tagName.toLowerCase() !== 'summary') {
				throw new Error(
					`Expected <summary> after 8 parent traversals, got <${el.tagName.toLowerCase()}>`
				)
			}

			// Extract the username
			const username = el.childNodes[3].childNodes[5].innerText
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
