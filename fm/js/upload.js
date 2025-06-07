// File upload handling
class MusicUploader {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = document.getElementById('music-file');

        if (uploadArea && fileInput) {
            // Drag and drop events
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-primary');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-primary');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-primary');
                const files = e.dataTransfer.files;
                this.handleFiles(files);
            });

            // File input change event
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }
    }

    async processAudioFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    // Create an audio element to get duration
                    const audio = new Audio();
                    
                    // Create a blob URL for the file
                    const blob = new Blob([e.target.result], { type: file.type });
                    const blobUrl = URL.createObjectURL(blob);
                    
                    audio.src = blobUrl;
                    
                    // Wait for metadata to load
                    await new Promise((resolve) => {
                        audio.addEventListener('loadedmetadata', resolve);
                        audio.addEventListener('error', () => reject(new Error('Failed to load audio file')));
                    });

                    // Store the blob in IndexedDB
                    const song = {
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        artist: 'Unknown Artist',
                        duration: audio.duration,
                        type: file.type,
                        size: file.size,
                        uploadDate: new Date().toISOString(),
                        isLiked: false,
                        blob: blob // Store the actual blob
                    };

                    resolve(song);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    async handleFiles(files) {
        const uploadArea = document.querySelector('.upload-area');
        if (uploadArea) {
            uploadArea.classList.add('pointer-events-none', 'opacity-50');
        }

        try {
            for (const file of files) {
                if (file.type.startsWith('audio/')) {
                    try {
                        const song = await this.processAudioFile(file);
                        await window.db.addSong(song);
                        showNotification(`Uploaded: ${song.title}`, 'success');
                    } catch (error) {
                        console.error('Error processing file:', error);
                        showNotification(`Failed to upload: ${file.name}`, 'error');
                    }
                } else {
                    showNotification(`Skipped non-audio file: ${file.name}`, 'error');
                }
            }
        } finally {
            if (uploadArea) {
                uploadArea.classList.remove('pointer-events-none', 'opacity-50');
            }
        }

        // Reload songs in player
        if (window.player) {
            await window.player.loadSongs();
        }
    }
}

// Initialize uploader
document.addEventListener('DOMContentLoaded', () => {
    window.uploader = new MusicUploader();
}); 