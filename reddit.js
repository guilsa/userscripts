// ==UserScript==
// @name         Reddit Top 1% Commenter — Scroll Finder
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights "Top 1% Commenter" badges and lets you scroll between them with Ctrl+Shift+N/P.
// @author       Gui
// @match        https://www.reddit.com/r/*
// @grant        GM_addStyle
// ==/UserScript==

;(function () {
	'use strict'

	function findAndHighlightTopCommenters() {
		// Find all spans with "Top 1% Commenter" text content
		const allSpans = document.querySelectorAll('span.pr-3xs')
		const top1PercentSpans = []
		
		for (const span of allSpans) {
			if (span.textContent.trim() === 'Top 1% Commenter') {
				top1PercentSpans.push(span)
			}
		}

		if (top1PercentSpans.length === 0) {
			console.log('[reddit-top-commenter] No "Top 1% Commenter" badges found on page.')
			return
		}

		console.log(`[reddit-top-commenter] Found ${top1PercentSpans.length} "Top 1% Commenter" badges.`)

		// Store in global state for navigation
		window.topCommenterAnchors = top1PercentSpans
		window.topCommenterIdx = 0

		// --- Scroll function ---
		window.scrollToTopCommenter = () => {
			const badge = window.topCommenterAnchors[window.topCommenterIdx]
			if (badge) {
				// Find the closest post/comment container to scroll into view
				const container = badge.closest('article, div[data-testid="post-container"], [data-testid="comment"]') || badge
				container.scrollIntoView({ behavior: 'smooth', block: 'start' })
			}
		}

		// --- Next and Prev ---
		window.nextTopCommenter = () => {
			window.topCommenterIdx = (window.topCommenterIdx + 1) % window.topCommenterAnchors.length
			window.scrollToTopCommenter()
		}

		window.prevTopCommenter = () => {
			if (window.topCommenterIdx === 0) {
				window.topCommenterIdx = window.topCommenterAnchors.length - 1
			} else {
				window.topCommenterIdx = (window.topCommenterIdx - 1) % window.topCommenterAnchors.length
			}
			window.scrollToTopCommenter()
		}

		// --- Key Binds ---
		const shortcuts = new Map()

		function bindShortcut(keyCombo, fn) {
			document.addEventListener('keydown', (e) => {
				const parts = keyCombo.split('+').map(k => k.toLowerCase())
				const pressed = []
				if (e.ctrlKey) pressed.push('ctrl')
				if (e.shiftKey) pressed.push('shift')
				if (e.altKey) pressed.push('alt')
				pressed.push(e.key.toLowerCase())

				if (JSON.stringify(pressed) === JSON.stringify(parts)) {
					e.preventDefault()
					fn(e)
				}
			})
		}

		bindShortcut('ctrl+shift+n', () => window.nextTopCommenter())
		bindShortcut('ctrl+shift+p', () => window.prevTopCommenter())
	}

	// Run after page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', findAndHighlightTopCommenters)
	} else {
		findAndHighlightTopCommenters()
	}
})()
