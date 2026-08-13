// ==UserScript==
// @name         Highlight Bloomberg on TechMeme
// @namespace    https://violentmonkey.github.io/
// @version      1.0
// @description  Highlights all instances of the word "Bloomberg" on techmeme.com without rendering HTML tags as text
// @author       You
// @match        https://www.techmeme.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function highlightBloomberg() {
        const targetWord = "Bloomberg";

        // Select all text nodes that contain "Bloomberg"
        const allTextNodes = document.evaluate(
            "//text()[contains(., '" + targetWord + "')]",
            document,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        // Get all text nodes first, then process them in order
        // to avoid issues with iterator advancing past replaced nodes
        const allTextNodesList = [];
        let tempNode;
        while ((tempNode = allTextNodes.iterateNext())) {
            allTextNodesList.push(tempNode);
        }

        for (let i = 0; i < allTextNodesList.length; i++) {
            const node = allTextNodesList[i];
            const index = node.nodeValue.indexOf(targetWord);

            if (index !== -1) {
                const beforeText = node.nodeValue.substring(0, index);
                const matchText = node.nodeValue.substring(index, index + targetWord.length);
                const afterText = node.nodeValue.substring(index + targetWord.length);

                // Create a container div to hold the split parts
                const container = document.createElement('div');
                container.style.display = 'contents';

                // Add unhighlighted part before
                if (beforeText) {
                    const textBefore = document.createTextNode(beforeText);
                    container.appendChild(textBefore);
                }

                // Add highlighted word in span
                const span = document.createElement('span');
                span.textContent = matchText;
                span.style.backgroundColor = "yellow";
                span.style.padding = "0 2px";
                span.style.color = "#000";
                container.appendChild(span);

                // Add unhighlighted part after
                if (afterText) {
                    const textAfter = document.createTextNode(afterText);
                    container.appendChild(textAfter);
                }

                // Replace the entire text node with our new container
                node.parentNode.replaceChild(container, node);
            }
        }
    }

    // Run after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', highlightBloomberg);
    } else {
        highlightBloomberg();
    }

})();
