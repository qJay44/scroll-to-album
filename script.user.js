// ==UserScript==
// @name         Scroll to last played album
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  scroll to last played album by saving scroll position
// @author       qJay44
// @source       github:qJay44/scroll-to-album
// @homepage     https://github.com/qJay44/scroll-to-album/
// @homepageURL  https://github.com/qJay44/scroll-to-album/
// @downloadURL  https://raw.githack.com/qJay44/main/scroll-to-album/script.user.js
// @updateURL    https://raw.githack.com/qJay44/main/scroll-to-album/script.meta.js
// @match        https://vk.com/audios-60027733?section=playlists
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vk.com
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

(function() {
    'use strict';
    let observer, keepScrolling = false

    const cssCustomDiv = {position: 'absolute', top: '25%', right:'1%', 'z-index': 3}
    const customDiv = document.createElement('div')
    const customDivStyle = customDiv.style

    Object.keys(cssCustomDiv).forEach(key => { customDivStyle[key] = cssCustomDiv[key]} )
    document.getElementById('page_header_wrap').appendChild(customDiv)

    const config = { attributes: false, childList: true, subtree: false }
    const callback = () => {if (keepScrolling) doScroll()};

    // Setup all stuff after page loaded
    window.addEventListener('load', () => {
        const button = document.createElement('button')
        button.innerHTML = 'Go to last played album'
        button.onclick = doScroll
        customDiv.appendChild(button)

        const className = '.audio_page_block__playlists_items._audio_page_block__playlists_items.CatalogBlock__itemsContainer'
        const targetNode = document.querySelector(className)
        observer = new MutationObserver(callback)
        observer.observe(targetNode, config)
    })

    // Probably unnecessary
    window.addEventListener("beforeunload", function() {
        observer.disconnect()
    })

    // Hook function that executes on play button (on an album) pressed
    const old = getAudioPlayer().playPlaylist;
    getAudioPlayer().playPlaylist = async function() {
        old.apply(this, arguments);
        await GM.setValue('scrollY', scrollY)
        console.log('Saved scroll position')
    };

    async function doScroll() {
        const targetScroll = {top: await GM.getValue('scrollY', scrollY)}
        window.scroll(targetScroll)
        keepScrolling = scrollY != targetScroll.top
    }
})();

