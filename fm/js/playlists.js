// Playlist Management
class PlaylistManager {
    constructor() {
        this.db = window.db; // Reference to the database from db.js
        this.playlists = [];
        this.selectedSongIndex = -1;
        this.init();
    }

    // Initialize playlist manager
    async init() {
        await this.db.initPromise; // Wait for database initialization
        await this.loadPlaylists();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Create playlist form
        const createPlaylistForm = document.getElementById('create-playlist-form');
        if (createPlaylistForm) {
            createPlaylistForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('playlist-name');
                const name = nameInput.value.trim();
                
                if (name) {
                    await this.createPlaylist(name);
                    nameInput.value = '';
                    
                    const modalElement = document.getElementById('createPlaylistModal');
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            });
        }

        // Add to playlist button
        const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
        if (addToPlaylistBtn) {
            addToPlaylistBtn.addEventListener('click', async () => {
                const select = document.getElementById('playlist-select');
                const playlistId = parseInt(select.value);
                const song = window.player.songs[this.selectedSongIndex];
                
                if (playlistId && song) {
                    await this.addToPlaylist(playlistId, song);
                    
                    const modalElement = document.getElementById('playlistModal');
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            });
        }
    }

    // Load playlists from database
    async loadPlaylists() {
        try {
            this.playlists = await this.db.getPlaylists() || [];
            this.updatePlaylistUI();
            this.updatePlaylistSelect();
        } catch (error) {
            console.error('Error loading playlists:', error);
            this.playlists = [];
            this.updatePlaylistUI();
            this.updatePlaylistSelect();
        }
    }

    // Create new playlist
    async createPlaylist(name) {
        try {
            const playlist = {
                id: Date.now(),
                name: name,
                songs: [],
                createdAt: new Date().toISOString()
            };
            
            await this.db.savePlaylist(playlist);
            this.playlists.push(playlist);
            this.updatePlaylistUI();
            this.updatePlaylistSelect();
            
            this.showNotification('Playlist created successfully!', 'success');
        } catch (error) {
            console.error('Error creating playlist:', error);
            this.showNotification('Failed to create playlist', 'error');
        }
    }

    // Add song to playlist
    async addToPlaylist(playlistId, song) {
        try {
            const playlist = this.playlists.find(p => p.id === playlistId);
            if (!playlist) return;

            if (!playlist.songs) {
                playlist.songs = [];
            }

            // Check if song is already in playlist
            if (!playlist.songs.some(s => s.id === song.id)) {
                playlist.songs.push(song);
                await this.db.updatePlaylist(playlist);
                this.updatePlaylistUI();
                this.updatePlaylistSelect();
                this.showNotification('Song added to playlist!', 'success');
            } else {
                this.showNotification('Song is already in this playlist', 'info');
            }
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            this.showNotification('Failed to add song to playlist', 'error');
        }
    }

    // Remove song from playlist
    async removeFromPlaylist(playlistId, songId) {
        try {
            const playlist = this.playlists.find(p => p.id === playlistId);
            if (!playlist) return;

            if (!playlist.songs) {
                playlist.songs = [];
                return;
            }

            playlist.songs = playlist.songs.filter(s => s.id !== songId);
            await this.db.updatePlaylist(playlist);
            this.updatePlaylistUI();
            this.updatePlaylistSelect();
            this.showNotification('Song removed from playlist', 'success');
        } catch (error) {
            console.error('Error removing song from playlist:', error);
            this.showNotification('Failed to remove song from playlist', 'error');
        }
    }

    // Delete playlist
    async deletePlaylist(playlistId) {
        try {
            await this.db.deletePlaylist(playlistId);
            this.playlists = this.playlists.filter(p => p.id !== playlistId);
            this.updatePlaylistUI();
            this.updatePlaylistSelect();
            this.showNotification('Playlist deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting playlist:', error);
            this.showNotification('Failed to delete playlist', 'error');
        }
    }

    // Update UI
    updatePlaylistUI() {
        const container = document.getElementById('playlist-container');
        if (!container) return;

        if (!Array.isArray(this.playlists)) {
            console.error('Playlists is not an array:', this.playlists);
            this.playlists = [];
        }

        container.innerHTML = this.playlists.map(playlist => `
            <div class="playlist-item flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-list text-gray-400"></i>
                    <span class="text-sm">${playlist.name}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">${playlist.songs ? playlist.songs.length : 0} songs</span>
                    <button class="text-gray-400 hover:text-white transition-colors" onclick="playlistManager.deletePlaylist(${playlist.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Show create playlist modal
    showCreatePlaylistModal() {
            const modalElement = document.getElementById('createPlaylistModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    showAddToPlaylistModal(songIndex) {
        this.selectedSongIndex = songIndex;
        this.updatePlaylistSelect();
        
        const modalElement = document.getElementById('playlistModal');
        const modal = new bootstrap.Modal(modalElement);
            modal.show();
    }

    updatePlaylistSelect() {
        const select = document.getElementById('playlist-select');
        if (!select) return;

        select.innerHTML = this.playlists.map(playlist => `
            <option value="${playlist.id}">${playlist.name} (${playlist.songs ? playlist.songs.length : 0} songs)</option>
        `).join('');
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize playlist manager
document.addEventListener('DOMContentLoaded', () => {
    window.playlistManager = new PlaylistManager();
}); 