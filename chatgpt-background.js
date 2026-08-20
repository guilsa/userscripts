// ==UserScript==
// @name         ChatGPT Background
// @namespace    https://violentmonkey.github.io/
// @version      1.0
// @description  Changes the ChatGPT page background color to #15191e by overriding the `html.dark, html.dark body` rules.
// @author       Guil Sa
// @match        https://chatgpt.com/*
// @grant        GM_addStyle
// ==/UserScript==

;(function () {
	'use strict'

	// ChatGPT sets the page background like this in dark mode:
	//
	//   html.dark,
	//   html.dark body {
	//     background-color: var(--main-surface-primary);
	//   }
	//
	// Override the same selectors (plus the light-mode equivalents) with
	// !important so nothing on the page can win the specificity battle.
	GM_addStyle(`
		html,
		html body,
		html.dark,
		html.dark body {
			background-color: #15191e !important;
		}
	`)
})()
