const AudioController = {
    init() {
        this.dock = document.getElementById('audio-dock');
        this.container = document.getElementById('spotify-player-container');
        this.toggleBtn = document.getElementById('audio-toggle');
        this.closeBtn = document.getElementById('close-audio');

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleDock());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hideDock());
        }
    },

    loadTrack(audioData) {
        if (!audioData || !audioData.embedUrl) {
            this.container.innerHTML = '<p style="color: #888; font-size: 0.9em;">No soundtrack available for this book.</p>';
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.src = audioData.embedUrl;
        iframe.width = '100%';
        iframe.height = '152';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';

        this.container.innerHTML = '';
        this.container.appendChild(iframe);
    },

    toggleDock() {
        if (this.dock) {
            this.dock.classList.toggle('hidden');
        }
    },

    showDock() {
        if (this.dock) {
            this.dock.classList.remove('hidden');
        }
    },

    hideDock() {
        if (this.dock) {
            this.dock.classList.add('hidden');
        }
    }
};

window.AudioController = AudioController;