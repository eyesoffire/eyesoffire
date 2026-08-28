window.AudioPlayer = {
    init() {
        this.dock = document.getElementById('audio-dock');
        this.container = document.getElementById('audio-player-container');
        this.toggleBtn = document.getElementById('toggle-audio-btn');
        this.closeBtn = document.getElementById('close-audio-btn');
        this.currentIframe = null;

        if(this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleDock());
        }
        if(this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hideDock());
        }
    },

    updateTrack(audioData) {
        if (!audioData || !audioData.embedUrl) {
            this.hideDock();
            if(this.toggleBtn) this.toggleBtn.style.display = 'none';
            return;
        }

        if(this.toggleBtn) this.toggleBtn.style.display = 'inline-block';

        const newIframe = document.createElement('iframe');
        newIframe.src = audioData.embedUrl;
        newIframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        newIframe.loading = "lazy";

        this.container.innerHTML = '';
        this.container.appendChild(newIframe);

        // Auto show dock when navigating to a book with audio
        this.showDock();
    },

    toggleDock() {
        if (this.dock.classList.contains('hidden')) {
            this.showDock();
        } else {
            this.hideDock();
        }
    },

    showDock() {
        this.dock.classList.remove('hidden');
    },

    hideDock() {
        this.dock.classList.add('hidden');
    }
};
