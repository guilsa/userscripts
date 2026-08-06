// ==UserScript==
// @name         Reddit Top 1% — Extract Inner Text
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Extracts the comments from each "Top 1% Commenter" badge by traversing the DOM.
// @author       Gui
// @match        https://www.reddit.com/r/*
// @grant        none
// ==/UserScript==

;(function () {
	'use strict'

	function extractComments() {
		const allSpans = document.querySelectorAll('span.pr-3xs')
		const comments = []

		for (const span of allSpans) {
			if (span.textContent.trim() !== 'Top 1% Commenter') continue

			// Find the <summary>
			let detailsEl = span.closest('details')

			if (!detailsEl) continue

      comments.push(detailsEl.childNodes[3].childNodes[5].innerText)
		}

		console.log('comments', comments)
	}

	// Run after page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', extractComments)
	} else {
		extractComments()
	}
})()
