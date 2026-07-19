import { Solitude } from "./core/api.js";

class MusicPlayer {
    constructor() {
        this.init();
    }

    init() {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        this.getCustomPlayList();
        this.addEventListeners();
    }

    getCustomPlayList() {
        this.changeMusicBg(false);
    }

    addEventListeners() {
        this.boundKeydown = this.handleKeydown.bind(this);
        document.addEventListener("keydown", this.boundKeydown);
        const aplayerList = document.querySelector(".aplayer-list");
        const aplayerLrc = document.querySelector(".aplayer-lrc");
        if (aplayerLrc && !aplayerLrc.dataset.clickBound) {
            aplayerLrc.addEventListener("click", () => {
                aplayerList?.classList.toggle("aplayer-list-hide");
            });
            aplayerLrc.dataset.clickBound = true;
        }
    }

    changeMusicBg(isChangeBg = true) {
        const musicBg = document.getElementById("Music-bg");
        const musicLoading = document.getElementsByClassName("Music-loading")[0];

        isChangeBg ? this.updateBackgroundImage(musicBg) : this.setLoadingScreen(musicLoading, musicBg);
    }

    updateBackgroundImage(element) {
        const musicCover = document.querySelector("#Music-page .aplayer-pic");
        if (!element || !musicCover) return;
        const img = new Image();
        img.src = this.extractValue(musicCover.style.backgroundImage);
        img.onload = () => {
            element.style.backgroundImage = musicCover.style.backgroundImage;
            element.className = 'show';
        };
    }

    setLoadingScreen(loadingElement, backgroundElement) {
        clearInterval(this.loadingTimer);
        this.loadingTimer = setInterval(() => {
            const musicCover = document.querySelector("#Music-page .aplayer-pic");
            if (musicCover) {
                if (loadingElement) loadingElement.style.display = "none";
                clearInterval(this.loadingTimer);
                this.loadingTimer = null;
                this.addEventListenerChangeMusicBg();
                if (backgroundElement) backgroundElement.style.display = "block";
            }
        }, 100);
    }

    extractValue(input) {
        const match = /url\("([^"]+)"\)/.exec(input);
        return match ? match[1] : '';
    }

    addEventListenerChangeMusicBg() {
        const aplayer = document.querySelector("#Music-page meting-js")?.aplayer;
        if (!aplayer) return;
        aplayer.on('loadeddata', () => this.changeMusicBg(true));
        aplayer.on('timeupdate', this.lrcUpdate.bind(this));
    }

    lrcUpdate() {
        const aplayerLrcContents = document.querySelector('.aplayer-lrc-contents');
        if (!aplayerLrcContents) return;
        const currentLrc = aplayerLrcContents.querySelector('p.aplayer-lrc-current');
        if (currentLrc) {
            const currentIndex = Array.from(aplayerLrcContents.children).indexOf(currentLrc);
            aplayerLrcContents.style.transform = `translateY(${-currentIndex * 80}px)`;
        }
    }

    handleKeydown(event) {
        if (event.target?.matches?.('input, textarea, [contenteditable="true"]')) return;
        const aplayer = document.querySelector('#Music-page meting-js')?.aplayer;
        if (!aplayer) return;
        const actions = {
            "Space": () => aplayer.toggle(),
            "ArrowRight": () => aplayer.skipForward(),
            "ArrowLeft": () => aplayer.skipBack(),
            "ArrowUp": () => { if (aplayer.volume < 1) aplayer.volume(aplayer.volume + 0.1); },
            "ArrowDown": () => { if (aplayer.volume > 0) aplayer.volume(aplayer.volume - 0.1); }
        };

        if (actions[event.code]) {
            event.preventDefault();
            actions[event.code]();
        }
    }

    destroy() {
        clearInterval(this.loadingTimer);
        document.removeEventListener("keydown", this.boundKeydown);
    }
}

export function initializeMusicPlayer() {
    const exitingMusic = Solitude.musicPlayer;
    if (exitingMusic) exitingMusic.destroy();
    Solitude.musicPlayer = new MusicPlayer();
}
