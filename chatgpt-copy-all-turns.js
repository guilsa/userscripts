// ==UserScript==
// @name         ChatGPT Copy All Turns
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copies all ChatGPT turns in page order with spacing between items.
// @author       Guil Sa
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

;(function () {
	'use strict'

	const selector = '[data-testid="copy-turn-action-button"]'
	const copyTurnActionButtons = []
	let collectionFrame
	window.copyTurnActionButtons = copyTurnActionButtons
	window.copyAllTurnActions = copyAllTurnActions

	function collectCopyButtons() {
		const buttons = Array.from(document.querySelectorAll(selector))
		for (const [index, button] of buttons.entries()) {
			button.style.setProperty('background-color', 'yellow', 'important')
			button.style.setProperty('position', 'relative', 'important')

			let badge = button.querySelector(':scope > .copy-turn-action-index')
			if (!badge) {
				badge = document.createElement('span')
				badge.className = 'copy-turn-action-index'
				badge.setAttribute('aria-hidden', 'true')
				badge.style.cssText = [
					'position: absolute !important',
					'top: -8px !important',
					'right: -8px !important',
					'padding: 1px 4px !important',
					'border-radius: 999px !important',
					'background: #111 !important',
					'color: #fff !important',
					'font: 11px/1 monospace !important',
					'pointer-events: none !important',
				].join(';')
				button.appendChild(badge)
			}

			badge.textContent = index
		}

		copyTurnActionButtons.splice(0, copyTurnActionButtons.length, ...buttons)
		console.log('copyTurnActionButtons:', copyTurnActionButtons)
	}

	function scheduleCollection() {
		cancelAnimationFrame(collectionFrame)
		collectionFrame = requestAnimationFrame(collectCopyButtons)
	}

	function getTurnText(button) {
		const turn = button.closest('article, [data-testid^="conversation-turn-"]')
		const content = turn?.querySelector('.markdown') ?? turn
		return content?.innerText.trimEnd() ?? ''
	}

	async function copyAllTurnActions() {
		if (!copyTurnActionButtons.length) {
			console.warn('No copy-turn action buttons found.')
			return
		}

		const items = copyTurnActionButtons
			.map(getTurnText)
			.filter(Boolean)
		const text = items
			.map((item) => `${item}\n\n\n`)
			.join('')

		try {
			await navigator.clipboard.writeText(text)
			console.log(`Copied ${items.length} items to clipboard.`, text)
		} catch (error) {
			console.error('Unable to write the items to the clipboard.', error)
		}
	}

	collectCopyButtons()

	new MutationObserver(scheduleCollection).observe(document.documentElement, {
		childList: true,
		subtree: true,
	})

	document.addEventListener('keydown', (event) => {
		if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
			event.preventDefault()
			copyAllTurnActions()
		}
	})
})()
