class SongPagination {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.songs = [];
        
        this.prevButton = document.getElementById('prev-page');
        this.nextButton = document.getElementById('next-page');
        this.currentPageSpan = document.getElementById('current-page');
        this.totalPagesSpan = document.getElementById('total-pages');
        this.songList = document.getElementById('song-list');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.prevButton.addEventListener('click', () => this.prevPage());
        this.nextButton.addEventListener('click', () => this.nextPage());

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard events when the listen songs section is active
            const listenSection = document.getElementById('listen-songs-section');
            if (!listenSection.classList.contains('active')) return;
            
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevPage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextPage();
            }
        });

        // Add touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.songList.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.songList.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        }, { passive: true });

        this.songList.addEventListener('touchend', () => {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
                if (swipeDistance > 0) {
                    this.prevPage();
                } else {
                    this.nextPage();
                }
            }
        });

        // Hide navigation buttons when mouse is idle
        let timeout;
        const navigation = document.querySelector('.songs-container > div:last-child');
        if (navigation) {
            navigation.style.transition = 'opacity 0.3s ease';
            
            const showNavigation = () => {
                navigation.style.opacity = '1';
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    navigation.style.opacity = '0';
                }, 2000);
            };

            document.getElementById('listen-songs-section').addEventListener('mousemove', showNavigation);
            document.getElementById('listen-songs-section').addEventListener('touchstart', showNavigation, { passive: true });
            
            // Show initially then fade out
            showNavigation();
        }
    }

    setSongs(songs) {
        this.songs = songs;
        this.currentPage = 1;
        this.updatePagination();
        this.renderCurrentPage();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.songs.length / this.itemsPerPage);
        this.currentPageSpan.textContent = this.currentPage;
        this.totalPagesSpan.textContent = totalPages;

        // Update button states
        this.prevButton.disabled = this.currentPage === 1;
        this.nextButton.disabled = this.currentPage === totalPages;

        // Update button opacity
        this.prevButton.style.opacity = this.currentPage === 1 ? '0.5' : '1';
        this.nextButton.style.opacity = this.currentPage === totalPages ? '0.5' : '1';
    }

    renderCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentSongs = this.songs.slice(startIndex, endIndex);

        // Clear current list
        this.songList.innerHTML = '';

        // Add songs with animation
        currentSongs.forEach((song, index) => {
            const songElement = this.createSongElement(song, startIndex + index + 1);
            songElement.style.opacity = '0';
            songElement.style.transform = 'translateY(10px)';
            this.songList.appendChild(songElement);

            // Trigger animation
            setTimeout(() => {
                songElement.style.opacity = '1';
                songElement.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    createSongElement(song, index) {
        const div = document.createElement('div');
        div.className = 'grid grid-cols-[auto,1fr,auto,auto] gap-4 p-4 items-center transition-all duration-300';
        div.innerHTML = `
            <div class="w-8 text-gray-400">${index}</div>
            <div class="min-w-0">
                <div class="font-medium truncate">${song.title}</div>
                <div class="text-sm text-gray-400 truncate">${song.artist || 'Unknown Artist'}</div>
            </div>
            <div class="w-32 text-gray-400">${song.duration || '0:00'}</div>
            <div class="w-32 flex justify-end space-x-2">
                <button class="text-gray-400 hover:text-white transition-colors" onclick="player.playSong(${song.id})">
                    <i class="fas fa-play"></i>
                </button>
                <button class="text-gray-400 hover:text-white transition-colors" onclick="player.addToQueue(${song.id})">
                    <i class="fas fa-list"></i>
                </button>
                <button class="text-gray-400 hover:text-white transition-colors" onclick="playlistManager.showAddToPlaylistModal(${song.id})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        return div;
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
            this.animatePageTransition('right');
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.songs.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updatePagination();
            this.animatePageTransition('left');
        }
    }

    animatePageTransition(direction) {
        const currentTransform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        const nextTransform = direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';

        // Animate current page out
        this.songList.style.transform = currentTransform;
        this.songList.style.opacity = '0';

        // After animation, render new page and animate in
        setTimeout(() => {
            this.renderCurrentPage();
            this.songList.style.transform = nextTransform;
            requestAnimationFrame(() => {
                this.songList.style.transform = 'translateX(0)';
                this.songList.style.opacity = '1';
            });
        }, 300);
    }
}

// Initialize pagination
document.addEventListener('DOMContentLoaded', () => {
    window.songPagination = new SongPagination();
}); 