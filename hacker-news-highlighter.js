// ==UserScript==
// @name         Highlight Hacker News Comment Authors
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights comment author names on Hacker News (news.ycombinator.com)
// @author       You
// @match        https://news.ycombinator.com/*
// @grant        none
// ==/UserScript==

;(function () {
	'use strict'

	function highlightCommentAuthors(names) {
		// Normalize names for comparison (lowercase, trim whitespace)
		const normalizedNames = names.map((name) => name.toLowerCase().trim())

		// Find all comment author names
		// Hacker News uses <a href="user?id=..." class="hnuser"> for author names
		const commentAuthors = document.querySelectorAll('a[href^="user?id="]')

		const meta = {}
		let count = 0
		let currentTarget = ''

		// console.log('Found', commentAuthors.length, 'comment authors')
		// console.log('Looking for:', names)

		// Highlight each comment author that matches
		for (const authorLink of commentAuthors) {
			const textContent = authorLink.textContent
			const textLower = textContent.toLowerCase()

			// Check if any of the target names are in this author
			for (const targetName of normalizedNames) {
				const index = textLower.indexOf(targetName)

				if (index !== -1) {

					if (!meta[targetName]) meta[targetName] = { count: 0, anchors: [] }
					meta[targetName]['anchors'].push(authorLink)

					// Keep the original <a> tag and just modify its text
					// This preserves the hyperlink
					const span = document.createElement('span')
					span.textContent = targetName
					span.style.setProperty('background-color', 'yellow', 'important')
					span.style.padding = '0 2px'
					span.style.color = '#000'
					span.style.borderRadius = '2px'

					// Replace the text node with the highlighted span
					// but keep the link intact
					authorLink.innerHTML = ''
					authorLink.appendChild(span)

					// Add unhighlighted part after
					const afterText = textContent.substring(index + targetName.length)
					if (afterText) {
						// Create a new span for the after text
						const afterSpan = document.createElement('span')
						afterSpan.textContent = afterText
						authorLink.appendChild(afterSpan)
					}

					meta[targetName]['count'] += 1
					// console.log('Highlighted:', textContent, 'for', targetName)
					break // Only highlight first match per author
				}
			}
		}

		window.meta = meta
		window.author = 'pjmlp'
		window.idx = 0

		window.scrollAction = () => (
			window.meta[author].anchors[window.idx]
				.scrollIntoView({ behavior: 'smooth', block: 'start' })
		)

		window.next = () => {
			const anchorLen = window.meta[window.author].anchors.length - 1
			if (window.idx === anchorLen) {
				window.idx = 0
			} else {
				window.idx += 1
			}
			window.scrollAction()
		}

		window.prev = () => {
			const anchorLen = window.meta[window.author].anchors.length - 1
			if (window.idx === 0) {
				window.idx = anchorLen
			} else {
				window.idx -= 1
			}
			window.scrollAction()
		}


		console.log(window.meta)
		// const btn = document.createElement('button')
		// btn.textContent = 'Click me'
		// document.body.prepend(btn)
	}

	// Default names to search for (case-insensitive matching)
	const targetNames = [
		'tptacek',
		'jacquesm',
		'ingve',
		'todsacerdoti',
		'rbanffy',
		'pseudolus',
		'jumpcrisscross',
		'tosh',
		'danso',
		'animats',
		'tomte',
		'zdw',
		'lxm',
		'colinwright',
		'pjmlp',
		'dragonwriter',
		'rayiner',
		'thunderbong',
		'temoral',
		'luu',
		'chuckmcm',
		'pjc50',
		'paulhoule',
		'toomuchtodo',
		'simonw',
		'bookofjoe',
		'anigbrowl',
		'walterbell',
		'steveklabnik',
		'jgrahamc',
		'ceejayoz',
		'jerf',
		'mooreds',
		'coldtea',
		'userbinator',
		'signa11',
		'doener',
		'crazygringo',
		'nostrademons',
		'sohkamyung',
		'paxys',
		'walterbright',
		'jedberg',
		'stavros',
		'hn_throwaway_99',
		'uptown',
		'brajeshwar',
		'minimaxir',
		'mfiguiere',
		'jrockway',
		'robin_reala',
		'coloneltcb',
		'ryandrake',
		'davidw',
		'wglb',
		'masklinn',
		'jonbaer',
		'dnetesn',
		'dredmorbius',
		'bender',
		'aaronbrethorst',
		'cperciva',
		'belter',
		'saagarjha',
		'retric',
		'tyingq',
		'mpweiher',
		'wallflower',
		'wpietri',
		'anon84',
		'fogus',
		'adamnemecek',
		'evo_9',
		'lisper',
		'pavel_lishin',
		'btilly',
		'pabs3',
		'derefr',
		'kibwen',
		'bane',
		'ksec',
		'nkurz',
		'geox',
		'duxup',
		'ilamont',
		'brudgers',
		'bombcar',
		'aurornis',
		'pavlov',
		'bpierre',
		'someone1234',
		'waterluvian',
		'wmf',
		'tzs',
		'giuliomagnifico',
		'paulpauper',
		'joshtriplett',
		'amelius',
		'petercooper',
		'mmastrac',
	]

	const bios = {
		tptacek:
			'Thomas Ptacek, a highly respected security researcher, founder of Matasano/Latacora, and now at Fly.io; known for deep, no-nonsense technical comments on security, crypto, and systems.',
		jacquesm:
			"Jacques Mattheij, Dutch entrepreneur, founder of several companies (including early streaming tech), small angel investor, and one of HN's most prolific, opinionated, and experienced commenters.",
		ingve:
			'A very high-volume submitter and commenter; one of the top users by activity, known for consistently surfacing interesting technical articles.',
		todsacerdoti:
			'Tod Sacerdoti, CEO and founder of Pipedream (API/workflow automation); frequent submitter, especially cross-posting from other sites.',
		rbanffy:
			'Seasoned software engineer with decades of experience; often comments on programming languages, hardware, Apple, and broader tech industry topics.',
		pseudolus:
			'Long-time prolific commenter and submitter; known for high activity and a somewhat cynical/outspoken style.',
		jumpcrisscross:
			'Growth equity VC and pilot; writes sharp, well-informed comments especially on finance, economics, startups, and geopolitics.',
		tosh: 'Independent developer and founder (Findable); regular commenter across a wide range of tech topics.',
		danso:
			'Data journalist and amateur data scientist (ex-ProPublica, taught at Stanford); known for strong data-driven and investigative comments.',
		animats:
			'John Nagle, veteran programmer and robotics/animation expert (worked on physics engines, etc.); famous for detailed, often critical technical comments.',
		tomte:
			'Long-time prolific HN commenter with very high karma; known for thoughtful, high-quality submissions and comments on science, education, open source compliance, and functional safety.',
		zdw: 'Experienced software engineer and frequent commenter; often shares insightful takes on systems, programming practices, and tech industry observations.',
		lxm: 'Active commenter focused on programming languages, software architecture, and technical discussions; known for concise and knowledgeable contributions.',
		colinwright:
			'Colin Wright, mathematician, entrepreneur, and polymath; frequent HN commenter on science, philosophy, productivity, and broad intellectual topics.',
		pjmlp:
			'Long-time HN veteran with deep knowledge of programming languages, compilers, and software history; often comments on language design and European tech perspectives.',
		dragonwriter:
			'High-volume, opinionated commenter known for sharp political, legal, and socioeconomic analysis mixed with tech commentary.',
		rayiner:
			'Lawyer (often in Big Law/tech); writes detailed, well-informed comments on law, economics, policy, startups, and their intersections with technology.',
		thunderbong:
			'Regular technical commenter focused on software development, web technologies, and practical engineering insights.',
		temoral:
			'Active HN participant known for comments on programming, systems design, and occasional witty or critical industry takes.',
		luu: 'Dan Luu, performance engineer and writer (danluu.com); respected for deep technical comments on performance, hardware, and low-level systems.',
		chuckmcm:
			'Seasoned engineer and commenter with experience across hardware and software; often discusses embedded systems and practical tech topics.',
		pjc50:
			'Frequent UK-based commenter with strong opinions on tech policy, security, privacy, and societal impacts of technology.',
		paulhoule:
			'Knowledgeable commenter on AI, data science, physics, and complex systems; often shares detailed technical or scientific perspectives.',
		toomuchtodo:
			'Energy industry professional and prolific commenter; known for informed takes on energy, climate, EVs, and infrastructure.',
		simonw:
			'Simon Willison, co-creator of Django, creator of Datasette; extremely active blogger and commenter on open source, AI, and web development.',
		bookofjoe:
			'Regular commenter who frequently shares interesting links and observations, often with a medical or eclectic knowledge angle.',
		anigbrowl:
			'Long-time HN commenter known for sharp, contrarian, and politically informed takes across tech, law, and culture.',
		walterbell:
			'Hardware and systems enthusiast; comments on retro computing, embedded systems, and low-level technical topics.',
		steveklabnik:
			'Steve Klabnik, prominent Rust core team member (former) and writer; known for language design and programming community commentary.',
		jgrahamc:
			'John Graham-Cumming, Cloudflare CTO (retired to board); highly respected for technical depth in systems, security, and engineering.',
		ceejayoz:
			'Experienced devops/infra professional; frequent commenter on Apple, sysadmin, and cloud topics with a practical bent.',
		jerf: 'Long-time commenter with strong views on programming languages, software correctness, and functional programming.',
		mooreds:
			'Software engineer and founder; comments thoughtfully on startups, career advice, remote work, and web development.',
		coldtea:
			'Prolific, often blunt and opinionated commenter covering programming languages, tech culture, and industry critique.',
		userbinator:
			'Low-level systems and reverse-engineering enthusiast; known for deep technical comments on performance, assembly, and Windows internals.',
		signa11:
			'Technical commenter focused on systems programming, C, performance, and embedded/low-level topics.',
		doener: 'Knowledgeable commenter on compilers, performance optimization, and CPU architecture details.',
		crazygringo: 'Frequent, clear-thinking commenter on economics, user experience, web development, and product design.',
		nostrademons: "Early Google engineer. Long-time HN power user known for thoughtful, high-signal comments on tech, startups, and systems.",
		sohkamyung: "Consistent high-volume commenter respected for level-headed takes across tech, society, and current events.",
		paxys: "Prolific commenter focused on business, startups, and practical tech insights. Known for clear, no-nonsense analysis.",
		walterbright: "Creator of the D programming language and Digital Mars compilers. Legendary systems programmer with deep expertise in languages and compilers.",
		jedberg: "Former Reddit ops lead and Netflix SRE (popularized Chaos Engineering). Current DBOS CEO and startup investor.",
		stavros: "Independent developer and writer (stavros.io). Practical engineer with strong opinions on software craftsmanship and modern tools.",
		hn_throwaway_99: "Anonymous but highly active voice known for sharp, often contrarian insights on the tech industry and culture.",
		uptown: "Long-time commenter offering wide-ranging, experienced perspectives on tech and business.",
		brajeshwar: "Designer/developer who shares HN stories and writes on technology’s impact on society and cognition.",
		minimaxir: "Max Woolf, data scientist and creator of popular HN analysis tools, AI projects (gpt-2-simple), and data visualization work.",
		mfiguiere: "Steady, high-karma commenter known for quality contributions across programming and tech topics.",
		jrockway: "Software engineer and blogger. Frequent in-depth commenter on systems, languages, and engineering practices.",
		robin_reala: "Robin Whittleton, accessibility lead at IKEA. Strong voice on web standards, a11y, and inclusive design.",
		coloneltcb: "Twilio engineer. Long-time HN participant with pragmatic engineering perspectives.",
		ryandrake: "Thoughtful commenter on tech, society, and current events. Known for measured, insightful replies.",
		davidw: "David Welton. Early promoter of open-source projects like Redis. Active in open source and European tech scene.",
		wglb: "Security and systems-focused commenter who shares deep technical knowledge.",
		masklinn: "Knowledgeable on programming languages, history, and software design. Frequent deep diver.",
		jonbaer: "Consistent commenter across science, tech, and research topics.",
		dnetesn: "Regular high-quality contributor on diverse subjects.",
		dredmorbius: "Thoughtful, wide-ranging commenter often covering philosophy, economics, society, and tech critique.",
		bender: "Long-time user with broad, experienced commentary.",
		aaronbrethorst: "Mobile and software engineer. Active on tech and product topics.",
		cperciva: "Colin Percival, FreeBSD developer, Tarsnap creator, and security expert. Major contributor to FreeBSD and EC2.",
		belter: "Frequent commenter on science, tech, and geopolitics.",
		saagarjha: "Low-level systems programmer and reverse engineer. Known for strong technical depth.",
		retric: "Data-driven, quantitative thinker on tech and economics.",
		tyingq: "Practical, experienced voice on databases, operations, and real-world engineering.",
		mpweiher: "Marcel Weiher. Objective-C and Smalltalk expert, writer on software design and performance.",
		wallflower: "Insightful commenter on culture, tech, and human behavior.",
		wpietri: "Will Pietri. Long-time agile practitioner and thoughtful critic of tech culture.",
		anon84: "Anonymous but prolific and respected commenter.",
		fogus: "Michael Fogus. Lisp enthusiast, writer, and deep thinker on programming languages and computer science.",
		adamnemecek: "Technical commenter with interests in programming languages and systems.",
		evo_9: "Veteran commenter with broad tech knowledge.",
		lisper: "Lisp advocate and experienced software thinker. Brings language design and AI perspectives.",
		pavel_lishin: "Consistent, witty contributor across many threads.",
		btilly: "Ben Tilly. Deep mathematical and programming thinker known for excellent, detailed explanations.",
		pabs3: "Open source advocate and contributor, particularly in the Debian community.",
		derefr: "Levi Aul. CTO at Covalent. Systems thinker with strong architectural insights.",
		kibwen: "Rust community member and language enthusiast. Detailed commenter on programming language design.",
		bane: "High-volume, experienced commenter on tech and industry trends.",
		ksec: "Hardware, semiconductors, and deep tech follower.",
		nkurz: "Low-level programming and performance optimization expert.",
		geox: "Steady contributor on various technical topics.",
		duxup: "Practical, relatable takes on tech work and life.",
		ilamont: "Independent writer and journalist focused on tech and Asia.",
		brudgers: "Opinionated, old-school hacker-style commenter.",
		bombcar: "Witty, experienced voice on tech and culture.",
		aurornis: "Clear, analytical commenter on science and tech.",
		pavlov: "Design, UI/UX, and product-focused insights.",
		bpierre: "Developer known for quality, thoughtful contributions.",
		someone1234: "Anonymous high-volume commenter.",
		waterluvian: "Thoughtful commenter on software engineering and systems.",
		wmf: "Veteran tech commenter, often focused on hardware and architecture.",
		tzs: "Detailed, technical commenter on standards and systems.",
		giuliomagnifico: "Active on design, tech, and European topics.",
		paulpauper: "Finance, economics, and markets commentator.",
		joshtriplett: "Josh Triplett. Rust and Debian contributor, systems programmer.",
		amelius: "Strong on math, algorithms, and theoretical computer science.",
		petercooper: "Peter Cooper. Ruby writer, newsletter curator (Ruby Weekly), and HN tools creator.",
		mmastrac: "Long-time commenter with broad tech experience."
	}

	// Add hover tooltips for all bios - attach to spans as they're created
	function attachBiosTooltips() {
		document.querySelectorAll('a[href^="user?id="] span').forEach((span) => {
			const textLower = span.textContent.toLowerCase()
			for (const [username, bio] of Object.entries(bios)) {
				if (textLower === username) {
					span.addEventListener('mouseenter', () => {
						span.title = bio
					})
					break
				}
			}
		})
	}

	// Run tooltip on page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', attachBiosTooltips)
	} else {
		attachBiosTooltips()
	}

	// Run after page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			highlightCommentAuthors(targetNames)
			attachBiosTooltips()
		})
	} else {
		highlightCommentAuthors(targetNames)
		attachBiosTooltips()
	}
})()
