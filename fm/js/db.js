class MusicDatabase {
    constructor() {
        this.dbName = 'FMusicaDB';
        this.dbVersion = 1;
        this.db = null;
        this.initPromise = this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.error('Your browser does not support IndexedDB');
                reject(new Error('IndexedDB not supported'));
                return;
            }

            console.log('Opening database...');
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(new Error('Failed to open database'));
            };

            request.onblocked = (event) => {
                console.error('Database blocked:', event);
                reject(new Error('Database blocked'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database opened successfully');

                // Handle database connection errors
                this.db.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                };

                resolve();
            };

            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed');
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('songs')) {
                    console.log('Creating songs store...');
                    const songsStore = db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
                    songsStore.createIndex('title', 'title', { unique: false });
                    songsStore.createIndex('artist', 'artist', { unique: false });
                    songsStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                    console.log('Songs store created');
                }

                if (!db.objectStoreNames.contains('playlists')) {
                    console.log('Creating playlists store...');
                    const playlistsStore = db.createObjectStore('playlists', { keyPath: 'id' });
                    playlistsStore.createIndex('name', 'name', { unique: false });
                    console.log('Playlists store created');
                }

                // Создание хранилища пользователей
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('email', 'email', { unique: true });
                    console.log('Создано хранилище users');
                }

                // Создание хранилища подписок
                if (!db.objectStoreNames.contains('subscriptions')) {
                    const subscriptionStore = db.createObjectStore('subscriptions', { keyPath: 'userId' });
                    subscriptionStore.createIndex('expiryDate', 'expiryDate');
                    console.log('Создано хранилище subscriptions');
                }
            };
        });
    }

    async ensureInitialized() {
        if (!this.db) {
            try {
                await this.initPromise;
            } catch (error) {
                console.error('Failed to initialize database:', error);
                throw error;
            }
        }
    }

    async addSong(song) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {
            try {
                const tx = this.db.transaction('songs', 'readwrite');
                const store = tx.objectStore('songs');
            const request = store.add(song);

                request.onsuccess = () => {
                    console.log('Song added successfully');
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error('Error adding song:', request.error);
                    reject(request.error);
                };
            } catch (error) {
                console.error('Error in addSong transaction:', error);
                reject(error);
            }
        });
    }

    async getAllSongs() {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {
            try {
                const tx = this.db.transaction('songs', 'readonly');
                const store = tx.objectStore('songs');
            const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result || []);
                };

                request.onerror = () => {
                    console.error('Error getting songs:', request.error);
                    reject(request.error);
                };
            } catch (error) {
                console.error('Error in getAllSongs transaction:', error);
                reject(error);
            }
        });
    }

    updateSong(song) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['songs'], 'readwrite');
            const store = transaction.objectStore('songs');
            const request = store.put(song);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to update song'));
        });
    }

    deleteSong(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction(['songs'], 'readwrite');
            const store = transaction.objectStore('songs');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete song'));
        });
    }

    // Playlists methods
    async savePlaylist(playlist) {
        await this.ensureInitialized();
        try {
            const tx = this.db.transaction('playlists', 'readwrite');
            const store = tx.objectStore('playlists');
            return new Promise((resolve, reject) => {
                const request = store.put(playlist);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error saving playlist:', error);
            throw error;
        }
    }

    async getPlaylists() {
        await this.ensureInitialized();
        try {
            const tx = this.db.transaction('playlists', 'readonly');
            const store = tx.objectStore('playlists');
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(Array.from(request.result || []));
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting playlists:', error);
            return [];
        }
    }

    async updatePlaylist(playlist) {
        await this.ensureInitialized();
        try {
            const tx = this.db.transaction('playlists', 'readwrite');
            const store = tx.objectStore('playlists');
            return new Promise((resolve, reject) => {
                const request = store.put(playlist);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error updating playlist:', error);
            throw error;
        }
    }

    async deletePlaylist(id) {
        await this.ensureInitialized();
        try {
            const tx = this.db.transaction('playlists', 'readwrite');
            const store = tx.objectStore('playlists');
            return new Promise((resolve, reject) => {
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting playlist:', error);
            throw error;
        }
    }

    // Liked songs methods
    async toggleLikedSong(song) {
        await this.ensureInitialized();
        try {
            const tx = this.db.transaction('likedSongs', 'readwrite');
            const store = tx.objectStore('likedSongs');
            
            const existingSong = await new Promise((resolve, reject) => {
                const request = store.get(song.id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            if (existingSong) {
                await store.delete(song.id);
                return false; // Song unliked
            } else {
                await store.add({...song, dateAdded: new Date().toISOString()});
                return true; // Song liked
            }
        } catch (error) {
            console.error('Error toggling liked song:', error);
            throw error;
        }
    }

    async getLikedSongs() {
        await this.ensureInitialized();
        try {
            const tx = this.db.transaction('likedSongs', 'readonly');
            const store = tx.objectStore('likedSongs');
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(Array.from(request.result || []));
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting liked songs:', error);
            return [];
        }
    }

    async isLikedSong(id) {
        await this.ensureInitialized();
        try {
            const tx = this.db.transaction('likedSongs', 'readonly');
            const store = tx.objectStore('likedSongs');
            const song = await new Promise((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            return !!song;
        } catch (error) {
            console.error('Error checking liked song:', error);
            return false;
        }
    }
}

// Delete the database if it exists and recreate it
async function resetDatabase() {
    const dbName = 'FMusicaDB';
    
    console.log('Deleting existing database...');
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.deleteDatabase(dbName);
        request.onsuccess = () => {
            console.log('Database deleted successfully');
            window.location.reload(); // Reload the page to reinitialize everything
        };
        request.onerror = () => {
            console.error('Error deleting database');
            reject();
        };
    });
}

// Make resetDatabase available globally
window.resetDatabase = resetDatabase;

// Initialize database instance
(async () => {
    try {
        window.db = new MusicDatabase(); 
        console.log('Database initialization started');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
})();

// Export the database instance
window.MusicDatabase = MusicDatabase;