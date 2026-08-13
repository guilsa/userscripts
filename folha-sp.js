// ==UserScript==
// @name         Folha SP: Remove Unwanted Noise
// @namespace    https://violentmonkey.github.io/
// @version      1.0
// @description  Remove sponsor/partnership section from folha.uol.com.br
// @author       You
// @match        *://*.folha.uol.com.br/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

;(function () {
	'use strict'

	// Performance note: run-at document-start means this executes before the page
	// loads, minimizing reflows. We use a simple selector that leverages browser
	// CSS selector optimization.

	function removeEnterprisingVertical() {
		// Use querySelectorAll for a single DOM traversal
		const blocks = document.querySelectorAll('.c-enterprising-vertical')

		// Direct removal - each remove() is O(1) since we already have references
		blocks.forEach((el) => el.remove())
	}

	function removeNewsletter() {
		// Use querySelectorAll for a single DOM traversal
		const blocks = document.querySelectorAll('.c-newsletter')

		// Direct removal - each remove() is O(1) since we already have references
		blocks.forEach((el) => el.remove())
	}

	function removeVejaTambem() {
		// Use querySelectorAll for a single DOM traversal
		const blocks = document.querySelectorAll('.c-wildcard-box')

		// Direct removal - each remove() is O(1) since we already have references
		blocks.forEach((el) => el.remove())
	}

	// Execute immediately if DOM is ready, otherwise wait
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', removeEnterprisingVertical)
		document.addEventListener('DOMContentLoaded', removeNewsletter)
		document.addEventListener('DOMContentLoaded', removeVejaTambem)
	} else {
		removeEnterprisingVertical()
		removeNewsletter()
		removeVejaTambem()
	}
})()
