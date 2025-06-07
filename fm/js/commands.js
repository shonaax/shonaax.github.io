class CommandPalette {
    constructor() {
        this.isOpen = false;
        this.commands = [
            { id: 'add-songs', title: 'Add Songs', icon: 'fas fa-plus', action: () => this.switchTab('add-songs-section') },
            { id: 'listen-songs', title: 'Listen to Songs', icon: 'fas fa-headphones', action: () => this.switchTab('listen-songs-section') },
            { id: 'liked-songs', title: 'Show Liked Songs', icon: 'fas fa-heart', action: () => this.switchTab('liked-songs-section') },
            { id: 'relaxation', title: 'Open Relaxation Mode', icon: 'fas fa-spa', action: () => this.switchTab('relaxation-section') },
            { id: 'create-playlist', title: 'Create New Playlist', icon: 'fas fa-list', action: () => window.playlistManager.showCreatePlaylistModal() },
            { id: 'clear-queue', title: 'Clear Play Queue', icon: 'fas fa-trash', action: () => this.clearQueue() },
            { id: 'toggle-shuffle', title: 'Toggle Shuffle Mode', icon: 'fas fa-random', action: () => this.toggleShuffle() },
            { id: 'toggle-repeat', title: 'Toggle Repeat Mode', icon: 'fas fa-redo', action: () => this.toggleRepeat() }
        ];

        this.palette = document.getElementById('command-palette');
        this.input = document.getElementById('command-input');
        this.commandList = document.getElementById('command-list');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Open on . or /
        document.addEventListener('keydown', (e) => {
            if ((e.key === '.' || e.key === '/') && !this.isOpen && !e.target.closest('input, textarea')) {
                e.preventDefault();
                this.open();
            }
            // Close on Escape
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close when clicking outside
        this.palette.addEventListener('click', (e) => {
            if (e.target === this.palette) {
                this.close();
            }
        });

        // Filter commands on input
        this.input.addEventListener('input', () => {
            this.filterCommands();
        });

        // Navigate with arrow keys
        this.input.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            const items = this.commandList.querySelectorAll('.command-item');
            const activeItem = this.commandList.querySelector('.command-item.active');
            const activeIndex = Array.from(items).indexOf(activeItem);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (activeIndex < items.length - 1) {
                        if (activeItem) activeItem.classList.remove('active');
                        items[activeIndex + 1].classList.add('active');
                        items[activeIndex + 1].scrollIntoView({ block: 'nearest' });
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (activeIndex > 0) {
                        if (activeItem) activeItem.classList.remove('active');
                        items[activeIndex - 1].classList.add('active');
                        items[activeIndex - 1].scrollIntoView({ block: 'nearest' });
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (activeItem) {
                        const commandId = activeItem.dataset.commandId;
                        const command = this.commands.find(cmd => cmd.id === commandId);
                        if (command) {
                            this.executeCommand(command);
                        }
                    }
                    break;
            }
        });
    }

    open() {
        this.isOpen = true;
        this.palette.classList.remove('hidden');
        this.input.value = '';
        this.input.focus();
        this.filterCommands();
    }

    close() {
        this.isOpen = false;
        this.palette.classList.add('hidden');
        this.input.value = '';
    }

    filterCommands() {
        const query = this.input.value.toLowerCase();
        const filteredCommands = this.commands.filter(cmd => 
            cmd.title.toLowerCase().includes(query) ||
            cmd.id.toLowerCase().includes(query)
        );

        this.renderCommands(filteredCommands);
    }

    renderCommands(commands) {
        this.commandList.innerHTML = '';
        
        commands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = `command-item p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer flex items-center space-x-3 ${index === 0 ? 'active' : ''}`;
            item.dataset.commandId = cmd.id;
            
            item.innerHTML = `
                <i class="${cmd.icon} text-gray-400 w-5"></i>
                <span class="flex-1">${cmd.title}</span>
                <kbd class="px-2 py-1 rounded bg-gray-800/50 text-xs">${index === 0 ? 'enter' : index + 1}</kbd>
            `;

            item.addEventListener('click', () => this.executeCommand(cmd));
            item.addEventListener('mouseenter', () => {
                this.commandList.querySelectorAll('.command-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });

            this.commandList.appendChild(item);
        });
    }

    executeCommand(command) {
        this.close();
        command.action();
    }

    switchTab(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            section.classList.add('active');
            
            // Update tab button states
            const tabId = sectionId.replace('-section', '');
            document.querySelectorAll('.sidebar a').forEach(tab => {
                tab.classList.remove('bg-gray-800/50', 'text-white');
                tab.classList.add('text-gray-300', 'hover:text-white');
            });
            const activeTab = document.getElementById(`${tabId}-tab`);
            if (activeTab) {
                activeTab.classList.remove('text-gray-300', 'hover:text-white');
                activeTab.classList.add('bg-gray-800/50', 'text-white');
            }
        }
    }

    clearQueue() {
        // Implement clear queue functionality
        window.showNotification('Play queue cleared', 'success');
    }

    toggleShuffle() {
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.click();
        }
    }

    toggleRepeat() {
        const repeatBtn = document.getElementById('repeat-btn');
        if (repeatBtn) {
            repeatBtn.click();
        }
    }
}

// Initialize command palette
document.addEventListener('DOMContentLoaded', () => {
    window.commandPalette = new CommandPalette();
}); 