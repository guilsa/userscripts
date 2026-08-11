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

	const COPY_BUTTON_SELECTOR = '[data-testid="copy-turn-action-button"]'
	const TURN_SELECTOR = 'article, [data-testid^="conversation-turn-"]'
	const CONTENT_SELECTOR = '.markdown'
	const BADGE_CLASS = 'copy-turn-action-index'
	const ITEM_SEPARATOR = '\n\n\n'
	const copyTurnActionButtons = []
	let refreshFrame

	window.copyTurnActionButtons = copyTurnActionButtons
	window.copyAllTurnActions = copyAllTurnActions

	function refreshCopyButtons() {
		const buttons = Array.from(document.querySelectorAll(COPY_BUTTON_SELECTOR))
		copyTurnActionButtons.splice(0, copyTurnActionButtons.length, ...buttons)
		buttons.forEach(addIndexBadge)
		console.log('copyTurnActionButtons:', copyTurnActionButtons)
	}

	function addIndexBadge(button, index) {
		button.style.setProperty('background-color', 'yellow', 'important')
		button.style.setProperty('position', 'relative', 'important')

		let badge = button.querySelector(`:scope > .${BADGE_CLASS}`)
		if (!badge) {
			badge = document.createElement('span')
			badge.className = BADGE_CLASS
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

	function getTurnText(button) {
		const turn = button.closest(TURN_SELECTOR)
		const content = turn?.querySelector(CONTENT_SELECTOR) ?? turn
		return content?.innerText.trimEnd() ?? ''
	}

	function getTurnTexts() {
		return copyTurnActionButtons.map(getTurnText).filter(Boolean)
	}

	function scheduleRefresh() {
		cancelAnimationFrame(refreshFrame)
		refreshFrame = requestAnimationFrame(refreshCopyButtons)
	}

	async function copyAllTurnActions() {
		if (!copyTurnActionButtons.length) {
			console.warn('No copy-turn action buttons found.')
			return
		}

		const items = getTurnTexts()
		const text = items.map((item) => `${item}${ITEM_SEPARATOR}`).join('')

		try {
			await navigator.clipboard.writeText(text)
			console.log(`Copied ${items.length} items to clipboard.`, text)
		} catch (error) {
			console.error('Unable to write the items to the clipboard.', error)
		}
	}

	function handleKeydown(event) {
		if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
			event.preventDefault()
			copyAllTurnActions()
		}
	}

	refreshCopyButtons()

	new MutationObserver(scheduleRefresh).observe(document.documentElement, {
		childList: true,
		subtree: true,
	})

	document.addEventListener('keydown', handleKeydown)
})()
