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

/* global AudioUtils:readonly */

(function() {
    'use strict';
    let targetScroll

    const cssCustomDiv = {position: 'absolute', top: '25%', right:'1%', 'z-index': 3}
    const customDiv = document.createElement('div')

    Object.keys(cssCustomDiv).forEach(key => {customDiv.style[key] = cssCustomDiv[key]})
    document.getElementById('page_header_wrap').appendChild(customDiv)

    window.addEventListener('load', () => {
        // First album id. Starting with the last added (85349353, 85349352, 85349351, ...)
        const targetNode = document.querySelector('.audio_page_block__playlists_items._audio_page_block__playlists_items.CatalogBlock__itemsContainer')
        const firstId = parseInt(targetNode.firstChild.dataset.id.split('_')[1])

        // Create custom button
        const button = document.createElement('button')
        button.onclick = () => {window.scroll(targetScroll)}
        customDiv.appendChild(button)
        updateProgress(button)

        // Update info on album follow
        const old = AudioUtils.followPlaylist;
        AudioUtils.followPlaylist = async function() {
            old.apply(this, arguments);
            const id = firstId - arguments['2'] + 1;
            GM.setValue('scrollY', scrollY)
            GM.setValue('savedId', id)
            updateProgress(button)
            saveAlbumsCache(targetNode)
        };

        loadAlbumsCache(targetNode)
    })

    function loadAlbumsCache(container) {
        const cache = localStorage.getItem('AlbumsCache')
        if (cache != null) {
            container.innerHTML = cache
        }
    }

    async function saveAlbumsCache(container) {
        localStorage.setItem('AlbumsCache', container.innerHTML)
    }

    async function updateProgress(btn) {
        const albums = document.getElementsByClassName('CatalogBlock__title CatalogGroupOnlyPlaylistsHeader')[0].innerText.split(' ')[0]
        const id = await GM.getValue('savedId', 0)
        btn.innerHTML = `Last played album (${id}/${albums})`
        targetScroll = {top: await GM.getValue('scrollY', 0)}
     }
})();
