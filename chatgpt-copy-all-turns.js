// ==UserScript==
// @name         ChatGPT Copy All Turns
// @namespace    https://violentmonkey.github.io/
// @version      1.0
// @description  Copies all ChatGPT turns in page order with Markdown dividers.
// @author       Guil Sa
// @match        https://chatgpt.com/*
// @grant        GM_setClipboard
// @grant        unsafeWindow
// ==/UserScript==

;(function () {
	'use strict'

	const COPY_BUTTON_SELECTOR = '[data-testid="copy-turn-action-button"]'
	const TURN_SEPARATOR = '\n\n---\n\n'
	const COPY_TIMEOUT_MS = 1_000
	const SCROLL_SETTLE_MS = 500
	const SCROLL_TIMEOUT_MS = 5_000
	const POLL_INTERVAL_MS = 100
	const copyTurnActionButtons = []
	let refreshFrame

	function refreshCopyButtons(buttons = document.querySelectorAll(COPY_BUTTON_SELECTOR)) {
		copyTurnActionButtons.splice(0, copyTurnActionButtons.length, ...buttons)
	}

	function findScrollContainer() {
		for (let element = copyTurnActionButtons[0]?.parentElement; element; element = element.parentElement) {
			const { overflowY } = getComputedStyle(element)
			if (['auto', 'scroll', 'overlay'].includes(overflowY)
				&& element.scrollHeight > element.clientHeight) {
				return element
			}
		}

		return document.scrollingElement
	}

	async function waitForCopyButtonsToSettle() {
		const deadline = Date.now() + SCROLL_TIMEOUT_MS
		let previousButtons = []
		let stableSince

		while (Date.now() < deadline) {
			await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
			const buttons = Array.from(document.querySelectorAll(COPY_BUTTON_SELECTOR))
			const buttonsAreStable = buttons.length > 0
				&& buttons.length === previousButtons.length
				&& buttons.every((button, index) => button === previousButtons[index])

			refreshCopyButtons(buttons)
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
		const clipboard = unsafeWindow.navigator.clipboard
		const originalMethods = ['writeText', 'write'].map((method) => [
			method,
			Object.getOwnPropertyDescriptor(clipboard, method),
		])
		let pendingCopy

		function settlePendingCopy(value, isError = false) {
			if (!pendingCopy) return

			clearTimeout(pendingCopy.timeout)
			pendingCopy[isError ? 'reject' : 'resolve'](value)
			pendingCopy = null
		}

		Object.defineProperty(clipboard, 'writeText', {
			configurable: true,
			value(text) {
				settlePendingCopy(String(text))
				return Promise.resolve()
			},
		})

		Object.defineProperty(clipboard, 'write', {
			configurable: true,
			async value(items) {
				try {
					const textItem = items.find((item) => item.types.includes('text/plain'))
					if (!textItem) throw new Error('Copy action did not provide text/plain data.')

					const blob = await textItem.getType('text/plain')
					settlePendingCopy(await blob.text())
				} catch (error) {
					settlePendingCopy(error, true)
				}
			},
		})

		return {
			click(button, index) {
				return new Promise((resolve, reject) => {
					const timeout = setTimeout(
						() => settlePendingCopy(new Error(`Copy button ${index} did not write text to the clipboard.`), true),
						COPY_TIMEOUT_MS,
					)
					pendingCopy = { resolve, reject, timeout }
					try {
						button.click()
					} catch (error) {
						settlePendingCopy(error, true)
					}
				})
			},
			restore() {
				for (const [method, descriptor] of originalMethods) {
					if (descriptor) Object.defineProperty(clipboard, method, descriptor)
					else delete clipboard[method]
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
			for (const [index, button] of [...copyTurnActionButtons].entries()) {
				items.push(await copyCapture.click(button, index))
			}

			const text = items.join(TURN_SEPARATOR)
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

	refreshCopyButtons()

	new MutationObserver(() => {
		cancelAnimationFrame(refreshFrame)
		refreshFrame = requestAnimationFrame(() => refreshCopyButtons())
	}).observe(document.documentElement, {
		childList: true,
		subtree: true,
	})

	document.addEventListener('keydown', (event) => {
		if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
			event.preventDefault()
			copyAllTurnsFromTop()
		}
	})
})()
