// ==UserScript==
// @name         ChatGPT Copy All Turns
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copies all ChatGPT turns in page order with spacing between items.
// @author       Guil Sa
// @match        https://chatgpt.com/*
// @grant        GM_setClipboard
// @grant        unsafeWindow
// ==/UserScript==

;(function () {
	'use strict'

	const COPY_BUTTON_SELECTOR = '[data-testid="copy-turn-action-button"]'
	const BADGE_CLASS = 'copy-turn-action-index'
	const ITEM_SEPARATOR = '\n\n\n'
	const COPY_TIMEOUT_MS = 1_000
	const SCROLL_SETTLE_MS = 500
	const SCROLL_TIMEOUT_MS = 5_000
	const POLL_INTERVAL_MS = 100
	const copyTurnActionButtons = []
	let refreshFrame
	const pageWindow = unsafeWindow

	window.copyTurnActionButtons = copyTurnActionButtons
	window.copyAllTurnActions = copyAllTurnActions
	window.copyAllTurnsFromTop = copyAllTurnsFromTop

	function refreshCopyButtons() {
		const buttons = Array.from(document.querySelectorAll(COPY_BUTTON_SELECTOR))
		const buttonsChanged = buttons.length !== copyTurnActionButtons.length
			|| buttons.some((button, index) => button !== copyTurnActionButtons[index])

		buttons.forEach(addIndexBadge)
		if (!buttonsChanged) return

		copyTurnActionButtons.splice(0, copyTurnActionButtons.length, ...buttons)
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

		const label = String(index)
		if (badge.textContent !== label) {
			badge.textContent = label
		}
	}

	function scheduleRefresh() {
		cancelAnimationFrame(refreshFrame)
		refreshFrame = requestAnimationFrame(refreshCopyButtons)
	}

	function findScrollContainer() {
		let element = copyTurnActionButtons[0]

		while (element?.parentElement) {
			element = element.parentElement
			const { overflowY } = getComputedStyle(element)
			if (['auto', 'scroll', 'overlay'].includes(overflowY)
				&& element.scrollHeight > element.clientHeight) {
				return element
			}
		}

		return document.scrollingElement
	}

	function wait(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	function haveSameButtons(first, second) {
		return first.length === second.length
			&& first.every((button, index) => button === second[index])
	}

	async function waitForCopyButtonsToSettle() {
		const deadline = Date.now() + SCROLL_TIMEOUT_MS
		let previousButtons = []
		let stableSince

		while (Date.now() < deadline) {
			await wait(POLL_INTERVAL_MS)
			const buttons = Array.from(document.querySelectorAll(COPY_BUTTON_SELECTOR))
			const buttonsAreStable = buttons.length > 0
				&& haveSameButtons(buttons, previousButtons)

			refreshCopyButtons()
			previousButtons = buttons

			if (buttonsAreStable) {
				stableSince ??= Date.now()
				if (Date.now() - stableSince >= SCROLL_SETTLE_MS) return
			} else {
				stableSince = undefined
			}
		}

		throw new Error('Copy buttons did not settle after scrolling to the top.')
	}

	function captureCopiedText() {
		const clipboard = pageWindow.navigator.clipboard
		const originalWriteText = Object.getOwnPropertyDescriptor(clipboard, 'writeText')
		const originalWrite = Object.getOwnPropertyDescriptor(clipboard, 'write')
		let pendingCopy

		function resolvePendingCopy(text) {
			if (!pendingCopy) return

			clearTimeout(pendingCopy.timeout)
			pendingCopy.resolve(text)
			pendingCopy = null
		}

		function rejectPendingCopy(error) {
			if (!pendingCopy) return

			clearTimeout(pendingCopy.timeout)
			pendingCopy.reject(error)
			pendingCopy = null
		}

		Object.defineProperty(clipboard, 'writeText', {
			configurable: true,
			value(text) {
				resolvePendingCopy(String(text))
				return Promise.resolve()
			},
		})

		Object.defineProperty(clipboard, 'write', {
			configurable: true,
			value(items) {
				const textItem = items.find((item) => item.types.includes('text/plain'))
				if (!textItem) {
					rejectPendingCopy(new Error('Copy action did not provide text/plain data.'))
					return Promise.resolve()
				}

				return textItem.getType('text/plain')
					.then((blob) => blob.text())
					.then(resolvePendingCopy)
					.catch(rejectPendingCopy)
			},
		})

		return {
			click(button, index) {
				return new Promise((resolve, reject) => {
					const timeout = setTimeout(() => {
						pendingCopy = null
						reject(new Error(`Copy button ${index} did not write text to the clipboard.`))
					}, COPY_TIMEOUT_MS)

					pendingCopy = { resolve, reject, timeout }
					try {
						button.click()
					} catch (error) {
						clearTimeout(timeout)
						pendingCopy = null
						reject(error)
					}
				})
			},
			restore() {
				if (originalWriteText) {
					Object.defineProperty(clipboard, 'writeText', originalWriteText)
				} else {
					delete clipboard.writeText
				}

				if (originalWrite) {
					Object.defineProperty(clipboard, 'write', originalWrite)
				} else {
					delete clipboard.write
				}
			},
		}
	}

	async function copyAllTurnActions() {
		if (!copyTurnActionButtons.length) {
			console.warn('No copy-turn action buttons found.')
			return
		}

		let copyCapture

		try {
			copyCapture = captureCopiedText()
			const items = []
			for (const [index, button] of copyTurnActionButtons.entries()) {
				items.push(await copyCapture.click(button, index))
			}

			const text = items.map((item) => `${item}${ITEM_SEPARATOR}`).join('')
			GM_setClipboard(text, 'text')
			console.log(`Copied ${items.length} items to clipboard.`, text)
		} catch (error) {
			console.error('Unable to copy all turns.', error)
		} finally {
			copyCapture?.restore()
		}
	}

	async function copyAllTurnsFromTop() {
		const scrollContainer = findScrollContainer()
		scrollContainer.scrollTop = 0
		console.log('Scrolled to the top of the conversation.')

		try {
			await waitForCopyButtonsToSettle()
			await copyAllTurnActions()
		} catch (error) {
			console.error('Unable to prepare the conversation for copying.', error)
		}
	}

	function handleKeydown(event) {
		if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
			event.preventDefault()
			copyAllTurnsFromTop()
		}
	}

	refreshCopyButtons()

	new MutationObserver(scheduleRefresh).observe(document.documentElement, {
		childList: true,
		subtree: true,
	})

	document.addEventListener('keydown', handleKeydown)
})()
