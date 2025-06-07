// Playlist management
document.addEventListener('DOMContentLoaded', function() {
    const playlistContainer = document.getElementById('playlist-container');
    let playlists = [];
    const player = window.player; // Reference to the global player instance

    // Load playlists from localStorage
    function loadPlaylists() {
        const savedPlaylists = localStorage.getItem('playlists');
        if (savedPlaylists) {
            playlists = JSON.parse(savedPlaylists);
            renderPlaylists();
        }
    }

    // Save playlists to localStorage
    function savePlaylists() {
        localStorage.setItem('playlists', JSON.stringify(playlists));
    }

    // Create a new playlist
    function createPlaylist(name) {
        const playlist = {
            id: Date.now(),
            name: name,
            songs: []
        };
        playlists.push(playlist);
        savePlaylists();
        renderPlaylists();
        showNotification('Playlist created successfully!', 'success');
    }

    // Add song to playlist
    function addSongToPlaylist(playlistId, song) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
            // Check if song already exists in playlist
            if (!playlist.songs.some(s => s.id === song.id)) {
                playlist.songs.push(song);
                savePlaylists();
                showNotification('Song added to playlist!', 'success');
                if (player.currentPlaylist && player.currentPlaylist.id === playlist.id) {
                    player.setCurrentPlaylist(playlist);
                }
            } else {
                showNotification('Song already exists in playlist!', 'error');
            }
        }
    }

    // Remove song from playlist
    function removeSongFromPlaylist(playlistId, songId) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.songs = playlist.songs.filter(s => s.id !== songId);
            savePlaylists();
            showNotification('Song removed from playlist!', 'success');
            if (player.currentPlaylist && player.currentPlaylist.id === playlist.id) {
                player.setCurrentPlaylist(playlist);
            }
        }
    }

    // Render playlists in sidebar
    function renderPlaylists() {
        playlistContainer.innerHTML = '';
        playlists.forEach(playlist => {
            const playlistElement = document.createElement('a');
            playlistElement.href = '#';
            playlistElement.className = 'flex items-center space-x-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50';
            playlistElement.innerHTML = `
                <i class="fas fa-list"></i>
                <span>${playlist.name}</span>
                <span class="text-xs text-gray-400">(${playlist.songs.length})</span>
            `;
            playlistElement.addEventListener('click', () => showPlaylist(playlist));
            playlistContainer.appendChild(playlistElement);
        });
    }

    // Show playlist content
    function showPlaylist(playlist) {
        const songList = document.getElementById('song-list');
        songList.innerHTML = '';
        
        // Set as current playlist in player
        player.setCurrentPlaylist(playlist);
        
        if (playlist.songs.length === 0) {
            songList.innerHTML = `
                <div class="p-4 text-center text-gray-400">
                    This playlist is empty. Add some songs!
                </div>
            `;
            return;
        }

        // Add playlist header
        const playlistHeader = document.createElement('div');
        playlistHeader.className = 'p-6 bg-gradient-to-b from-gray-800/50 flex items-end space-x-6';
        playlistHeader.innerHTML = `
            <div class="w-52 h-52 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                <i class="fas fa-music text-6xl text-gray-500"></i>
            </div>
            <div>
                <h2 class="text-2xl font-bold mb-2">${playlist.name}</h2>
                <p class="text-gray-400">${playlist.songs.length} songs</p>
                <div class="mt-6 flex items-center space-x-4">
                    <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-medium transition-colors play-all-btn">
                        <i class="fas fa-play mr-2"></i>Play
                    </button>
                    <button class="text-gray-400 hover:text-white transition-colors shuffle-play-btn">
                        <i class="fas fa-random mr-2"></i>Shuffle
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for playlist header buttons
        playlistHeader.querySelector('.play-all-btn').addEventListener('click', () => {
            if (playlist.songs.length > 0) {
                player.isShuffleOn = false;
                player.updateShuffleButton();
                player.playSong(0);
            }
        });

        playlistHeader.querySelector('.shuffle-play-btn').addEventListener('click', () => {
            if (playlist.songs.length > 0) {
                player.isShuffleOn = true;
                player.updateShuffleButton();
                player.updateShuffleIndices();
                player.playSong(player.shuffledIndices[0]);
            }
        });

        songList.appendChild(playlistHeader);

        // Add songs
        playlist.songs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.className = `grid grid-cols-[auto,1fr,auto,auto] gap-4 p-4 hover:bg-gray-800/50 transition-colors items-center ${player.currentSongIndex === index ? 'bg-gray-800/50' : ''}`;
            songElement.innerHTML = `
                <div class="w-8 text-gray-400">${index + 1}</div>
                <div class="min-w-0">
                    <div class="font-medium truncate">${song.title || 'Unknown Title'}</div>
                    <div class="text-sm text-gray-400 truncate">${song.artist || 'Unknown Artist'}</div>
                </div>
                <div class="w-32 text-gray-400">${formatDuration(song.duration)}</div>
                <div class="w-32 text-right space-x-2">
                    <button class="text-gray-400 hover:text-white transition-colors play-btn">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="text-gray-400 hover:text-white transition-colors remove-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            // Add event listeners
            songElement.querySelector('.play-btn').addEventListener('click', () => player.playSong(index));
            songElement.querySelector('.remove-btn').addEventListener('click', () => {
                removeSongFromPlaylist(playlist.id, song.id);
                showPlaylist(playlist);
            });
            
            songList.appendChild(songElement);
        });
    }

    // Format duration
    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} z-50`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize
    loadPlaylists();

    // Event listener for new playlist button
    document.querySelector('[data-action="new-playlist"]').addEventListener('click', () => {
        const name = prompt('Enter playlist name:');
        if (name) {
            createPlaylist(name);
        }
    });

    // Export functions for global use
    window.playlistManager = {
        addSongToPlaylist,
        removeSongFromPlaylist,
        showPlaylist,
        playlists
    };
}); 