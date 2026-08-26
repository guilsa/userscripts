// ==UserScript==
// @name         Hacker News Points on Google
// @namespace    https://violentmonkey.github.io/
// @version      0.1.0
// @description  Press Control+Shift+H on Google Search to show scores beside every Hacker News result.
// @author       Guil Sa
// @match        https://google.com/search*
// @match        https://www.google.com/search*
// @connect      news.ycombinator.com
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

;(function () {
	'use strict'

	const MAX_CONCURRENT_REQUESTS = 3
	const BADGE_CLASS = 'google-hn-points-badge'

	GM_addStyle(`
		.${BADGE_CLASS} {
			display: inline-flex;
			align-items: center;
			padding: 0.15em 0.52em;
			border: 1px solid #ff6600;
			border-radius: 999px;
			background: #fff4ec;
			color: #b54708;
			font: 600 0.62em/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			letter-spacing: 0.01em;
			vertical-align: 0.18em;
			white-space: nowrap;
		}

		.${BADGE_CLASS}[data-state="loading"] {
			border-color: #dadce0;
			background: #f8f9fa;
			color: #5f6368;
		}

		.${BADGE_CLASS}[data-state="error"] {
			border-color: #f1c7c7;
			background: #fff7f7;
			color: #9b1c1c;
		}

		#google-hn-points-toast {
			position: fixed;
			right: 22px;
			bottom: 22px;
			z-index: 2147483647;
			padding: 10px 14px;
			border-radius: 9px;
			background: rgba(32, 33, 36, 0.94);
			box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
			color: white;
			font: 500 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			opacity: 0;
			transform: translateY(5px);
			transition: opacity 120ms ease, transform 120ms ease;
			pointer-events: none;
		}

		#google-hn-points-toast[data-visible="true"] {
			opacity: 1;
			transform: translateY(0);
		}
	`)

	function getDestinationUrl(anchor) {
		try {
			const url = new URL(anchor.href, location.href)

			if (url.hostname === 'www.google.com' && url.pathname === '/url') {
				return new URL(url.searchParams.get('q') || url.searchParams.get('url'))
			}

			return url
		} catch {
			return null
		}
	}

	function findHackerNewsResults() {
		const results = []
		const seenUrls = new Set()

		for (const heading of document.querySelectorAll('#search a[href] > h3')) {
			const anchor = heading.closest('a[href]')
			const url = anchor && getDestinationUrl(anchor)

			if (!url || url.hostname !== 'news.ycombinator.com' || seenUrls.has(url.href)) {
				continue
			}

			seenUrls.add(url.href)
			results.push({ heading, url: url.href })
		}

		return results
	}

	function requestHtml(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url,
				timeout: 15000,
				onload(response) {
					if (response.status >= 200 && response.status < 300) {
						resolve(response.responseText)
						return
					}

					reject(new Error(`Hacker News returned HTTP ${response.status}`))
				},
				onerror: () => reject(new Error('Could not reach Hacker News')),
				ontimeout: () => reject(new Error('Hacker News request timed out')),
			})
		})
	}

	function readPoints(html) {
		const page = new DOMParser().parseFromString(html, 'text/html')
		const score = page.querySelector('.subtext .score, .score')
		const match = score?.textContent.match(/\d[\d,]*/)

		return match ? Number(match[0].replaceAll(',', '')) : null
	}

	function getOrCreateBadge(heading) {
		let badge = heading.querySelector(`.${BADGE_CLASS}`)

		if (!badge) {
			badge = document.createElement('span')
			badge.className = BADGE_CLASS
			heading.appendChild(badge)
		}

		return badge
	}

	function setBadge(badge, state, text, tooltip = '') {
		badge.dataset.state = state
		badge.textContent = text
		badge.title = tooltip
	}

	let toastTimer

	function showToast(message) {
		let toast = document.querySelector('#google-hn-points-toast')

		if (!toast) {
			toast = document.createElement('div')
			toast.id = 'google-hn-points-toast'
			toast.setAttribute('role', 'status')
			document.body.appendChild(toast)
		}

		toast.textContent = message
		toast.dataset.visible = 'true'
		clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toast.dataset.visible = 'false'
		}, 2400)
	}

	async function addPointsToResult({ heading, url }) {
		const badge = getOrCreateBadge(heading)

		if (badge.dataset.state === 'ready') return true

		setBadge(badge, 'loading', 'HN · checking…')

		try {
			const points = readPoints(await requestHtml(url))

			if (points === null) {
				setBadge(badge, 'error', 'HN · no score', 'This HN page does not expose a story score.')
				return false
			}

			const noun = points === 1 ? 'point' : 'points'
			setBadge(badge, 'ready', `🔥 ${points.toLocaleString()} HN ${noun}`, `${points.toLocaleString()} points on Hacker News`)
			return true
		} catch (error) {
			setBadge(badge, 'error', 'HN · unavailable', error.message)
			return false
		}
	}

	let isRunning = false

	async function addPointsToResults(results) {
		let nextIndex = 0
		let successes = 0

		async function worker() {
			while (nextIndex < results.length) {
				const result = results[nextIndex]
				nextIndex += 1

				if (await addPointsToResult(result)) successes += 1
			}
		}

		const workerCount = Math.min(MAX_CONCURRENT_REQUESTS, results.length)
		await Promise.all(Array.from({ length: workerCount }, worker))

		return successes
	}

	async function run() {
		if (isRunning) return

		const results = findHackerNewsResults()

		if (results.length === 0) {
			showToast('No Hacker News results found on this page.')
			return
		}

		isRunning = true
		showToast(`Checking ${results.length} Hacker News ${results.length === 1 ? 'result' : 'results'}…`)

		try {
			const successes = await addPointsToResults(results)

			if (successes === results.length) {
				showToast(`Added ${successes} Hacker News ${successes === 1 ? 'score' : 'scores'}.`)
			} else if (successes > 0) {
				showToast(`Added ${successes} of ${results.length} Hacker News scores.`)
			} else {
				showToast('The Hacker News scores were unavailable.')
			}
		} finally {
			isRunning = false
		}
	}

	document.addEventListener('keydown', (event) => {
		if (
			event.ctrlKey &&
			event.shiftKey &&
			!event.metaKey &&
			!event.altKey &&
			event.code === 'KeyH'
		) {
			event.preventDefault()
			event.stopImmediatePropagation()
			void run()
		}
	}, true)
})()
