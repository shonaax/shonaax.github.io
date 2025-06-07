class MusicPlayer {
    constructor() {
        this.songs = [];
        this.currentSongIndex = -1;
        this.isPlaying = false;
        this.audio = new Audio();
        this.currentBlobUrl = null;
        this.currentPlaylist = null;
        this.isShuffleOn = false;
        this.repeatMode = 'all'; // none, one, all
        this.shuffledIndices = [];
        
        // Добавляем обработчик окончания песни сразу при создании
        this.audio.addEventListener('ended', () => {
            console.log('Audio ended event triggered from constructor');
            this.handleSongEnd();
        });
        
        this.initializeEventListeners();
        // Обновляем состояние кнопки повтора при инициализации
        setTimeout(() => this.updateRepeatButton(), 0);
    }

    initializeEventListeners() {
        // Play/Pause button
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.currentSongIndex === -1) {
                    if (this.currentPlaylist && this.currentPlaylist.songs.length > 0) {
                        this.playSong(0);
                    } else if (this.songs.length > 0) {
                        this.playSong(0);
                    }
                } else {
                    this.togglePlayPause();
                }
            });
        }

        // Next button
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.playNext());
        }

        // Previous button
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.playPrevious());
        }

        // Shuffle button
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }

        // Repeat button
        const repeatBtn = document.getElementById('repeat-btn');
        if (repeatBtn) {
            repeatBtn.addEventListener('click', () => this.toggleRepeat());
        }

        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());

        // Progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => this.seek(e));
        }

        // Volume control
        const volumeControl = document.querySelector('.volume-control');
        if (volumeControl) {
            volumeControl.addEventListener('click', (e) => this.setVolume(e));
        }

        // Volume button
        const volumeBtn = document.querySelector('.volume-control-btn');
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => this.toggleMute());
        }
    }

    async loadSongs() {
        try {
            // Wait for database initialization
            await window.db.initPromise;
            this.songs = await window.db.getAllSongs();
            this.updateSongList();
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    }

    updateSongList() {
        const songList = document.getElementById('song-list');
        if (!songList) return;

        songList.innerHTML = this.songs.map((song, index) => `
            <div class="grid grid-cols-[auto,1fr,auto,auto] gap-4 p-4 hover:bg-gray-800/50 transition-colors items-center ${this.currentSongIndex === index ? 'bg-gray-800/50' : ''}" data-index="${index}">
                <div class="w-8 text-gray-400">${index + 1}</div>
                <div class="min-w-0">
                    <div class="font-medium truncate">${song.title || 'Unknown Title'}</div>
                    <div class="text-sm text-gray-400 truncate">${song.artist || 'Unknown Artist'}</div>
                </div>
                <div class="w-32 text-gray-400">${this.formatTime(song.duration)}</div>
                <div class="w-32 text-right space-x-2">
                    <button onclick="player.toggleLike(${index})" class="text-gray-400 hover:text-white transition-colors">
                        <i class="fas fa-heart${song.isLiked ? ' text-primary' : ''}"></i>
                    </button>
                    <button onclick="player.playSong(${index})" class="text-gray-400 hover:text-white transition-colors">
                        <i class="fas fa-play"></i>
                    </button>
                    <button onclick="playlistManager.showAddToPlaylistModal(${index})" class="text-gray-400 hover:text-white transition-colors">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add click event listeners for playing songs
        const songElements = songList.querySelectorAll('[data-index]');
        songElements.forEach(element => {
            element.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const index = parseInt(element.dataset.index);
                    this.playSong(index);
                }
            });
        });
    }

    async playSong(index) {
        try {
            const song = this.songs[index];
            if (!song) return;

            // If we have a previous audio element, clean it up
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
                this.audio.load();
            }

            // Create a new audio element for each song
            this.audio = new Audio();
            
            // Set up error handling
            this.audio.onerror = (e) => {
                console.error('Audio error:', e);
                showNotification('Error playing song: ' + (e.message || 'Unknown error'), 'error');
            };

            // Create a blob URL from the stored blob
            if (song.blob) {
                try {
                    const blobUrl = URL.createObjectURL(song.blob);
                    this.audio.src = blobUrl;
                    
                    // Clean up the old blob URL when we're done with it
                    if (this.currentBlobUrl) {
                        URL.revokeObjectURL(this.currentBlobUrl);
                    }
                    this.currentBlobUrl = blobUrl;

                    // Set up audio event listeners
                    this.audio.addEventListener('loadedmetadata', () => {
                        this.updateDuration();
                    });

                    this.audio.addEventListener('timeupdate', () => {
                        this.updateProgress();
                    });

                    this.audio.addEventListener('ended', () => {
                        console.log('Audio ended event triggered');
                        this.handleSongEnd();
                    });

                    // Play the song
                    await this.audio.play();
                    this.isPlaying = true;
                    this.currentSongIndex = index;
                    this.updatePlayButton();
                    this.updateSongInfo();
                    this.updateSongList();
                } catch (error) {
                    console.error('Error creating blob URL:', error);
                    showNotification('Error loading song file', 'error');
                }
            } else {
                showNotification('Song file not found', 'error');
            }
        } catch (error) {
            console.error('Error playing song:', error);
            showNotification('Error playing song: ' + (error.message || 'Unknown error'), 'error');
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play();
            this.isPlaying = true;
        }
        this.updatePlayButton();
    }

    updatePlayButton() {
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            const icon = playBtn.querySelector('i');
            if (icon) {
                icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
    }

    updateSongInfo() {
        const song = this.songs[this.currentSongIndex];
        if (!song) return;

        const titleElement = document.getElementById('song-title');
        const artistElement = document.getElementById('song-artist');

        if (titleElement) {
            titleElement.textContent = song.title || 'Unknown Title';
        }
        if (artistElement) {
            artistElement.textContent = song.artist || 'Unknown Artist';
        }
    }

    setCurrentPlaylist(playlist) {
        this.currentPlaylist = playlist;
        this.songs = playlist.songs;
        this.currentSongIndex = -1;
        this.updateShuffleIndices();
        this.updatePlaylistInfo();
    }

    updateShuffleIndices() {
        this.shuffledIndices = Array.from({ length: this.songs.length }, (_, i) => i);
        if (this.isShuffleOn) {
            for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
            }
        }
    }

    toggleShuffle() {
        this.isShuffleOn = !this.isShuffleOn;
        this.updateShuffleIndices();
        this.updateShuffleButton();
    }

    updateShuffleButton() {
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', this.isShuffleOn);
            shuffleBtn.querySelector('i').style.color = this.isShuffleOn ? '#1DB954' : '#9CA3AF';
        }
    }

    toggleRepeat() {
        switch (this.repeatMode) {
            case 'none':
                this.repeatMode = 'all';
                break;
            case 'all':
                this.repeatMode = 'one';
                break;
            case 'one':
                this.repeatMode = 'none';
                break;
        }
        this.updateRepeatButton();
    }

    updateRepeatButton() {
        const repeatBtn = document.getElementById('repeat-btn');
        if (repeatBtn) {
            const icon = repeatBtn.querySelector('i');
            switch (this.repeatMode) {
                case 'one':
                    icon.className = 'fas fa-repeat-1';
                    icon.style.color = '#1DB954';
                    break;
                case 'all':
                    icon.className = 'fas fa-repeat';
                    icon.style.color = '#1DB954';
                    break;
                default:
                    icon.className = 'fas fa-repeat';
                    icon.style.color = '#9CA3AF';
            }
        }
    }

    handleSongEnd() {
        console.log('Song ended. Current mode:', this.repeatMode, 'Current index:', this.currentSongIndex, 'Total songs:', this.songs.length);
        
        // Проверяем, есть ли песни в плейлисте
        if (!this.songs.length) {
            console.log('No songs in playlist');
            return;
        }

        if (this.repeatMode === 'one') {
            console.log('Repeating current song');
            this.audio.currentTime = 0;
            this.audio.play().catch(error => {
                console.error('Error replaying song:', error);
            });
        } else if (this.repeatMode === 'all') {
            // Если это последняя песня и включен режим повтора всего плейлиста
            if (this.currentSongIndex === this.songs.length - 1) {
                console.log('Last song ended, restarting playlist');
                this.playSong(0); // Начать с первой песни
            } else {
                console.log('Playing next song in playlist');
                this.playNext();
            }
        } else {
            console.log('No repeat mode, playing next');
            this.playNext();
        }
    }

    playNext() {
        if (!this.songs.length) return;

        let nextIndex;
        if (this.isShuffleOn) {
            const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentSongIndex);
            nextIndex = this.shuffledIndices[(currentShuffleIndex + 1) % this.songs.length];
        } else {
            nextIndex = (this.currentSongIndex + 1) % this.songs.length;
        }

        // Если достигнут конец плейлиста
        if (nextIndex === 0) {
            if (this.repeatMode === 'none') {
                // Остановить воспроизведение
                this.currentSongIndex = -1;
                this.isPlaying = false;
                this.updatePlayButton();
                this.updateSongInfo();
                return;
            } else if (this.repeatMode === 'all') {
                // Начать плейлист сначала
                this.playSong(0);
                return;
            }
        }

        // В остальных случаях просто играть следующую песню
        this.playSong(nextIndex);
    }

    playPrevious() {
        if (!this.songs.length) return;

        let prevIndex;
        if (this.isShuffleOn) {
            const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentSongIndex);
            prevIndex = this.shuffledIndices[(currentShuffleIndex - 1 + this.songs.length) % this.songs.length];
        } else {
            prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        }

        this.playSong(prevIndex);
    }

    updateProgress() {
        const progress = document.getElementById('progress');
        const currentTime = document.getElementById('current-time');
        
        if (progress) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            progress.style.width = `${percent}%`;
        }
        
        if (currentTime) {
            currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        const duration = document.getElementById('duration');
        if (duration) {
            duration.textContent = this.formatTime(this.audio.duration);
        }
    }

    seek(event) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        this.audio.currentTime = this.audio.duration * percent;
    }

    setVolume(event) {
        const volumeBar = event.currentTarget;
        const rect = volumeBar.getBoundingClientRect();
        const volume = (event.clientX - rect.left) / rect.width;
        this.audio.volume = Math.max(0, Math.min(1, volume));
        this.updateVolumeUI();
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.updateVolumeUI();
    }

    updateVolumeUI() {
        const volumeProgress = document.querySelector('.volume-progress');
        const volumeBtn = document.querySelector('.volume-control-btn i');
        
        if (volumeProgress) {
            volumeProgress.style.width = `${this.audio.muted ? 0 : this.audio.volume * 100}%`;
        }
        
        if (volumeBtn) {
            volumeBtn.className = this.audio.muted || this.audio.volume === 0
                ? 'fas fa-volume-mute'
                : this.audio.volume < 0.5
                    ? 'fas fa-volume-down'
                    : 'fas fa-volume-up';
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async toggleLike(index) {
        const song = this.songs[index];
        if (!song) return;

        try {
            song.isLiked = !song.isLiked;
            await window.db.updateSong(song);
            this.updateSongList();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    updatePlaylistInfo() {
        const playlistNameElement = document.getElementById('playlist-name');
        if (playlistNameElement && this.currentPlaylist) {
            playlistNameElement.textContent = this.currentPlaylist.name;
        }
    }
}

// Initialize player
document.addEventListener('DOMContentLoaded', () => {
    window.player = new MusicPlayer();
    window.player.loadSongs();
}); 