class CommandPalette {
    constructor() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing command palette...');
        
        this.commands = [
            // Создание вопросов
            {
                id: 'create-single',
                title: 'Один из списка',
                description: 'Создать вопрос с одним правильным ответом',
                icon: 'fa-dot-circle',
                shortcut: '/one',
                category: 'create',
                action: () => this.createQuestion('single-choice')
            },
            {
                id: 'create-multiple',
                title: 'Несколько из списка',
                description: 'Создать вопрос с несколькими правильными ответами',
                icon: 'fa-check-square',
                shortcut: '/more',
                category: 'create',
                action: () => this.createQuestion('multiple-choice')
            },
            {
                id: 'create-text',
                title: 'Текстовый ответ',
                description: 'Создать вопрос со свободным ответом',
                icon: 'fa-font',
                shortcut: '/text',
                category: 'create',
                action: () => this.createQuestion('text')
            },
            {
                id: 'create-image',
                title: 'Вопрос с изображением',
                description: 'Создать вопрос с изображением',
                icon: 'fa-image',
                shortcut: '/image',
                category: 'create',
                action: () => this.createQuestion('image')
            },
            
            // Экспорт и сохранение
            {
                id: 'export-html',
                title: 'Экспорт в HTML',
                description: 'Экспортировать тест как HTML файл',
                icon: 'fa-file-export',
                shortcut: '/export',
                category: 'export',
                action: () => this.openExportModal()
            },
            {
                id: 'save-draft',
                title: 'Сохранить черновик',
                description: 'Сохранить текущий тест как черновик',
                icon: 'fa-save',
                shortcut: '/save',
                category: 'export',
                action: () => this.saveDraft()
            },

            // Темы
            {
                id: 'theme-classic',
                title: 'Классическая тема',
                description: 'Светлая тема по умолчанию',
                icon: 'fa-sun',
                shortcut: '/theme classic',
                category: 'themes',
                action: () => this.applyTheme('classic')
            },
            {
                id: 'theme-dark',
                title: 'Тёмная тема',
                description: 'Тёмная тема для глаз',
                icon: 'fa-moon',
                shortcut: '/theme dark',
                category: 'themes',
                action: () => this.applyTheme('dark')
            },
            {
                id: 'theme-nature',
                title: 'Природная тема',
                description: 'Спокойные природные тона',
                icon: 'fa-leaf',
                shortcut: '/theme nature',
                category: 'themes',
                action: () => this.applyTheme('nature')
            },
            {
                id: 'theme-ocean',
                title: 'Океан',
                description: 'Морские оттенки',
                icon: 'fa-water',
                shortcut: '/theme ocean',
                category: 'themes',
                action: () => this.applyTheme('ocean')
            },
            {
                id: 'theme-sunset',
                title: 'Закат',
                description: 'Тёплые тона заката',
                icon: 'fa-cloud-sun',
                shortcut: '/theme sunset',
                category: 'themes',
                action: () => this.applyTheme('sunset')
            },
            {
                id: 'theme-custom',
                title: 'Настроить тему',
                description: 'Создать свою тему',
                icon: 'fa-palette',
                shortcut: '/theme custom',
                category: 'themes',
                action: () => this.customizeTheme()
            },

            // Настройки теста
            {
                id: 'test-settings',
                title: 'Настройки теста',
                description: 'Открыть настройки теста',
                icon: 'fa-cog',
                shortcut: '/settings',
                category: 'settings',
                action: () => this.openSettings()
            },
            {
                id: 'time-limit',
                title: 'Ограничение времени',
                description: 'Установить ограничение по времени',
                icon: 'fa-clock',
                shortcut: '/time',
                category: 'settings',
                action: () => this.openSettings('timeLimit')
            },
            {
                id: 'grading',
                title: 'Критерии оценивания',
                description: 'Настроить критерии оценивания',
                icon: 'fa-graduation-cap',
                shortcut: '/grade',
                category: 'settings',
                action: () => this.openSettings('grading')
            },

            // Управление тестом
            {
                id: 'clear-test',
                title: 'Очистить тест',
                description: 'Удалить все вопросы',
                icon: 'fa-trash',
                shortcut: '/clear',
                category: 'manage',
                action: () => this.clearTest()
            },
            {
                id: 'preview-test',
                title: 'Предпросмотр',
                description: 'Открыть предпросмотр теста',
                icon: 'fa-eye',
                shortcut: '/preview',
                category: 'manage',
                action: () => this.previewTest()
            },
            {
                id: 'duplicate-question',
                title: 'Дублировать вопрос',
                description: 'Создать копию текущего вопроса',
                icon: 'fa-copy',
                shortcut: '/duplicate',
                category: 'manage',
                action: () => this.duplicateCurrentQuestion()
            },
            {
                id: 'move-up',
                title: 'Переместить вопрос вверх',
                description: 'Переместить текущий вопрос на позицию выше',
                icon: 'fa-arrow-up',
                shortcut: '/up',
                category: 'manage',
                action: () => this.moveQuestion('up')
            },
            {
                id: 'move-down',
                title: 'Переместить вопрос вниз',
                description: 'Переместить текущий вопрос на позицию ниже',
                icon: 'fa-arrow-down',
                shortcut: '/down',
                category: 'manage',
                action: () => this.moveQuestion('down')
            },
            {
                id: 'add-hint',
                title: 'Добавить подсказку',
                description: 'Добавить подсказку к текущему вопросу',
                icon: 'fa-lightbulb',
                shortcut: '/hint',
                category: 'manage',
                action: () => this.addHint()
            },
            {
                id: 'add-explanation',
                title: 'Добавить объяснение',
                description: 'Добавить объяснение к правильному ответу',
                icon: 'fa-comment-dots',
                shortcut: '/explain',
                category: 'manage',
                action: () => this.addExplanation()
            },
            {
                id: 'add-points',
                title: 'Установить баллы',
                description: 'Установить количество баллов за вопрос',
                icon: 'fa-star',
                shortcut: '/points',
                category: 'manage',
                action: () => this.setPoints()
            },
            {
                id: 'add-section',
                title: 'Добавить раздел',
                description: 'Создать новый раздел в тесте',
                icon: 'fa-folder-plus',
                shortcut: '/section',
                category: 'create',
                action: () => this.addSection()
            },
            {
                id: 'import-questions',
                title: 'Импорт вопросов',
                description: 'Импортировать вопросы из файла',
                icon: 'fa-file-import',
                shortcut: '/import',
                category: 'create',
                action: () => this.importQuestions()
            },
            {
                id: 'shuffle-questions',
                title: 'Перемешать вопросы',
                description: 'Случайно перемешать все вопросы',
                icon: 'fa-random',
                shortcut: '/shuffle',
                category: 'manage',
                action: () => this.shuffleQuestions()
            },
            {
                id: 'add-timer',
                title: 'Добавить таймер',
                description: 'Установить таймер для текущего вопроса',
                icon: 'fa-clock',
                shortcut: '/timer',
                category: 'manage',
                action: () => this.addTimer()
            }
        ];

        // Определение тем
        this.themes = {
            classic: {
                name: 'Классическая',
                colors: {
                    primary: '#3a86ff',
                    secondary: '#8338ec',
                    accent: '#ff006e',
                    text: '#2d3436',
                    background: '#ffffff',
                    'bg-light': '#f8f9fa'
                }
            },
            dark: {
                name: 'Тёмная',
                colors: {
                    primary: '#6c5ce7',
                    secondary: '#a29bfe',
                    accent: '#00b894',
                    text: '#dfe6e9',
                    background: '#2d3436',
                    'bg-light': '#353b48'
                }
            },
            nature: {
                name: 'Природная',
                colors: {
                    primary: '#27ae60',
                    secondary: '#2ecc71',
                    accent: '#f1c40f',
                    text: '#2d3436',
                    background: '#f5f6fa',
                    'bg-light': '#dff9fb'
                }
            },
            ocean: {
                name: 'Океан',
                colors: {
                    primary: '#0c98b9',
                    secondary: '#0a7c9a',
                    accent: '#f39c12',
                    text: '#2d3436',
                    background: '#f5f6fa',
                    'bg-light': '#e3f2fd'
                }
            },
            sunset: {
                name: 'Закат',
                colors: {
                    primary: '#e17055',
                    secondary: '#d63031',
                    accent: '#fdcb6e',
                    text: '#2d3436',
                    background: '#f5f6fa',
                    'bg-light': '#ffeaa7'
                }
            },
            // Новые темы
            neon: {
                name: 'Неон',
                colors: {
                    primary: '#ff2e63',
                    secondary: '#08d9d6',
                    accent: '#ff0099',
                    text: '#eaeaea',
                    background: '#252a34',
                    'bg-light': '#2d3436'
                }
            },
            forest: {
                name: 'Лесная',
                colors: {
                    primary: '#2d5a27',
                    secondary: '#4a8f40',
                    accent: '#e4b04a',
                    text: '#2c3e50',
                    background: '#f4f9f4',
                    'bg-light': '#e8f3e8'
                }
            },
            arctic: {
                name: 'Арктика',
                colors: {
                    primary: '#4c6ef5',
                    secondary: '#228be6',
                    accent: '#15aabf',
                    text: '#212529',
                    background: '#f8f9fa',
                    'bg-light': '#e9ecef'
                }
            },
            desert: {
                name: 'Пустыня',
                colors: {
                    primary: '#d68438',
                    secondary: '#e6a157',
                    accent: '#b55b2e',
                    text: '#4a3933',
                    background: '#fdf6e3',
                    'bg-light': '#f5e6d3'
                }
            },
            candy: {
                name: 'Конфетная',
                colors: {
                    primary: '#ff85a2',
                    secondary: '#fbb1bd',
                    accent: '#ffd5e3',
                    text: '#4a4a4a',
                    background: '#fff0f3',
                    'bg-light': '#ffe9ec'
                }
            },
            cyberpunk: {
                name: 'Киберпанк',
                colors: {
                    primary: '#f700ff',
                    secondary: '#00fff9',
                    accent: '#ff2975',
                    text: '#eaeaea',
                    background: '#1a1a2e',
                    'bg-light': '#16213e'
                }
            },
            vintage: {
                name: 'Винтаж',
                colors: {
                    primary: '#845ec2',
                    secondary: '#d65db1',
                    accent: '#ff6f91',
                    text: '#4b4453',
                    background: '#f9f3e6',
                    'bg-light': '#f3e6d8'
                }
            }
        };

        this.palette = document.getElementById('commandPalette');
        this.input = document.getElementById('commandInput');
        this.suggestions = document.getElementById('commandSuggestions');
        this.selectedIndex = -1;

        if (!this.palette || !this.input || !this.suggestions) {
            console.error('Required elements not found');
            return;
        }

        this.createOverlay();
        this.setupEventListeners();
        console.log('Command palette initialized');
    }

    createOverlay() {
        console.log('Creating overlay...'); // Debug log
        const overlay = document.createElement('div');
        overlay.className = 'command-overlay';
        document.body.appendChild(overlay);
        this.overlay = overlay;
        console.log('Overlay created'); // Debug log
    }

    setupEventListeners() {
        // Command palette button
        const commandPaletteBtn = document.getElementById('commandPaletteBtn');
        if (commandPaletteBtn) {
            commandPaletteBtn.addEventListener('click', () => {
                console.log('Command palette button clicked'); // Debug log
                this.open();
            });
        } else {
            console.error('Command palette button not found'); // Debug log
        }

        // Global shortcut to open palette
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !this.isInputFocused()) {
                e.preventDefault();
                this.open();
            } else if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // Input handling
        this.input.addEventListener('input', () => this.updateSuggestions());
        this.input.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.palette.contains(e.target) && this.isOpen()) {
                this.close();
            }
        });
    }

    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
    }

    open() {
        console.log('Opening command palette...'); // Debug log
        if (!this.palette || !this.overlay) {
            console.error('Palette or overlay not initialized');
            return;
        }
        this.palette.classList.add('active');
        this.overlay.classList.add('active');
        this.input.value = '';
        this.input.focus();
        this.updateSuggestions();
        console.log('Command palette opened'); // Debug log
    }

    close() {
        console.log('Closing command palette...'); // Debug log
        if (!this.palette || !this.overlay) {
            console.error('Palette or overlay not initialized');
            return;
        }
        this.palette.classList.remove('active');
        this.overlay.classList.remove('active');
        this.input.value = '';
        this.selectedIndex = -1;
        console.log('Command palette closed'); // Debug log
    }

    isOpen() {
        return this.palette.classList.contains('active');
    }

    updateSuggestions() {
        const query = this.input.value.toLowerCase().trim();
        let filteredCommands = this.commands;

        if (query) {
            filteredCommands = this.commands.filter(cmd => {
                return cmd.title.toLowerCase().includes(query) ||
                       cmd.description.toLowerCase().includes(query) ||
                       cmd.shortcut.toLowerCase().includes(query) ||
                       cmd.category.toLowerCase().includes(query);
            });
        }

        // Group commands by category
        const groupedCommands = filteredCommands.reduce((acc, cmd) => {
            if (!acc[cmd.category]) {
                acc[cmd.category] = [];
            }
            acc[cmd.category].push(cmd);
            return acc;
        }, {});

        this.suggestions.innerHTML = '';

        // Render commands by category
        Object.entries(groupedCommands).forEach(([category, commands]) => {
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'command-category';
            categoryHeader.textContent = this.getCategoryTitle(category);
            this.suggestions.appendChild(categoryHeader);

            // Add commands in category
            commands.forEach((cmd, index) => {
                const suggestion = document.createElement('div');
                suggestion.className = `command-suggestion ${this.selectedIndex === index ? 'selected' : ''}`;
                suggestion.innerHTML = `
                    <i class="fas ${cmd.icon}"></i>
                    <div class="command-suggestion-content">
                        <div class="command-suggestion-title">${cmd.title}</div>
                        <div class="command-suggestion-description">${cmd.description}</div>
                    </div>
                    <span class="command-shortcut">${cmd.shortcut}</span>
                `;
                suggestion.addEventListener('click', () => this.executeCommand(cmd));
                this.suggestions.appendChild(suggestion);
            });
        });
    }

    getCategoryTitle(category) {
        const titles = {
            'create': 'Создание вопросов',
            'export': 'Экспорт и сохранение',
            'settings': 'Настройки',
            'manage': 'Управление тестом'
        };
        return titles[category] || category;
    }

    handleKeyNavigation(e) {
        const suggestions = this.suggestions.children;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.updateSelection();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(suggestions.length - 1, this.selectedIndex + 1);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && this.selectedIndex < suggestions.length) {
                    const selectedCommand = this.commands.find(cmd => 
                        cmd.title === suggestions[this.selectedIndex].querySelector('.command-suggestion-title').textContent
                    );
                    if (selectedCommand) {
                        this.executeCommand(selectedCommand);
                    }
                }
                break;
        }
    }

    updateSelection() {
        const suggestions = this.suggestions.children;
        Array.from(suggestions).forEach((suggestion, index) => {
            suggestion.classList.toggle('selected', index === this.selectedIndex);
        });

        // Scroll selected item into view
        if (this.selectedIndex >= 0) {
            suggestions[this.selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    executeCommand(command) {
        this.close();
        command.action();
    }

    createQuestion(type) {
        // Trigger the same action as clicking the tool item
        const toolItem = document.querySelector(`[data-type="${type}"]`);
        if (toolItem) {
            const content = document.createElement('div');
            content.className = 'question-content';

            const commonHTML = `
                <input type="text" class="form-control mb-3" placeholder="Введите вопрос">
                <div class="options" id="options-${Date.now()}">
                    <div class="option-wrapper mb-2" draggable="true">
                        <div class="input-group">
                            <div class="input-group-text correct-answer-toggle" onclick="toggleCorrectAnswer(this)">
                                <input type="${type === 'single-choice' ? 'radio' : 'checkbox'}" class="form-check-input">
                            </div>
                            <div class="input-group-text drag-handle">
                                <i class="fas fa-grip-vertical"></i>
                            </div>
                            <input type="text" class="form-control" placeholder="Вариант ответа">
                            <button class="btn btn-outline-danger" onclick="removeOption(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="option-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="addOption(this, '${type === 'single-choice' ? 'radio' : 'checkbox'}')">
                        <i class="fas fa-plus"></i> Добавить вариант
                    </button>
                    <button class="btn btn-outline-secondary btn-sm ms-2" onclick="showBulkAddModal(this, '${type === 'single-choice' ? 'radio' : 'checkbox'}')">
                        <i class="fas fa-list"></i> Добавить несколько
                    </button>
                </div>
            `;

            content.innerHTML = commonHTML;
            
            const block = document.createElement('div');
            block.className = 'question-block fade-in';
            block.appendChild(content);
            
            const testContent = document.getElementById('test-content');
            testContent.appendChild(block);

            // Initialize drag and drop
            this.initDragAndDrop(content.querySelector('.options'));
        }
    }

    initDragAndDrop(optionsContainer) {
        let draggedItem = null;

        optionsContainer.addEventListener('dragstart', (e) => {
            draggedItem = e.target.closest('.option-wrapper');
            draggedItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            
            // Create a custom drag image
            const dragImage = draggedItem.cloneNode(true);
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 20, 20);
            setTimeout(() => document.body.removeChild(dragImage), 0);
        });

        optionsContainer.addEventListener('dragend', (e) => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            optionsContainer.querySelectorAll('.option-wrapper').forEach(option => {
                option.classList.remove('drag-over');
            });
        });

        optionsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const option = e.target.closest('.option-wrapper');
            if (option && option !== draggedItem) {
                const rect = option.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    option.parentNode.insertBefore(draggedItem, option);
                } else {
                    option.parentNode.insertBefore(draggedItem, option.nextSibling);
                }
            }
        });
    }

    showBulkAddModal(button, type) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Добавить варианты ответов</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <textarea class="form-control" rows="5" placeholder="Введите варианты ответов, каждый с новой строки"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="this.addBulkOptions(this, '${type}')">Добавить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    addBulkOptions(button, type) {
        const modal = button.closest('.modal');
        const textarea = modal.querySelector('textarea');
        const options = textarea.value.split('\n').filter(opt => opt.trim());
        const optionsContainer = document.querySelector(`#options-${Date.now()}`);
        
        options.forEach(option => {
            const optionElement = this.createOptionElement(type);
            optionElement.querySelector('input[type="text"]').value = option.trim();
            optionsContainer.appendChild(optionElement);
        });
        
        bootstrap.Modal.getInstance(modal).hide();
        modal.remove();
    }

    createOptionElement(type) {
        const option = document.createElement('div');
        option.className = 'option-wrapper mb-2';
        option.draggable = true;
        option.innerHTML = `
            <div class="input-group">
                <div class="input-group-text correct-answer-toggle" onclick="toggleCorrectAnswer(this)">
                    <input type="${type}" class="form-check-input">
                </div>
                <div class="input-group-text drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <input type="text" class="form-control" placeholder="Вариант ответа">
                <button class="btn btn-outline-danger" onclick="removeOption(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        return option;
    }

    addOption(button, type) {
        const optionsDiv = button.closest('.question-content').querySelector('.options');
        const option = this.createOptionElement(type);
        
        // Add with animation
        option.style.opacity = '0';
        option.style.transform = 'translateY(-20px)';
        optionsDiv.appendChild(option);
        
        requestAnimationFrame(() => {
            option.style.opacity = '1';
            option.style.transform = 'translateY(0)';
        });

        this.showToast('Добавлен новый вариант ответа', 'info');
    }

    removeOption(button) {
        const optionWrapper = button.closest('.option-wrapper');
        if (!optionWrapper) return;
        
        // Add removal animation
        optionWrapper.style.animation = 'slideOutFade 0.3s ease forwards';
        
        // Remove element after animation
        setTimeout(() => {
            optionWrapper.remove();
            this.showToast('Вариант ответа удален', 'info');
        }, 300);
    }

    toggleCorrectAnswer(button) {
        const input = button.querySelector('input');
        input.checked = !input.checked;
    }

    openExportModal() {
        const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
        exportModal.show();
    }

    saveDraft() {
        // Сохранение черновика в localStorage
        const testData = {
            title: document.getElementById('test-title').value,
            questions: this.getTestQuestions(),
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('testDraft', JSON.stringify(testData));
        this.showToast('Черновик сохранен', 'success');
    }

    openSettings(tab = null) {
        const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
        settingsModal.show();
        if (tab) {
            // Переключение на нужную вкладку в настройках
            const tabElement = document.querySelector(`#settingsModal [data-settings="${tab}"]`);
            if (tabElement) {
                tabElement.click();
            }
        }
    }

    clearTest() {
        if (confirm('Вы уверены, что хотите очистить весь тест? Это действие нельзя отменить.')) {
            document.getElementById('test-content').innerHTML = '';
            this.showToast('Тест очищен', 'info');
        }
    }

    previewTest() {
        const testContent = document.getElementById('test-content');
        const testTitle = document.getElementById('test-title').value || 'Предпросмотр теста';
        
        // Создаем окно предпросмотра
        const previewWindow = document.createElement('div');
        previewWindow.className = 'preview-window';
        previewWindow.innerHTML = `
            <div class="preview-header">
                <h3>
                    <i class="fas fa-eye"></i>
                    Предпросмотр теста
                </h3>
                <div class="preview-actions">
                    <button class="btn btn-outline-primary btn-sm preview-device" data-device="desktop">
                        <i class="fas fa-desktop"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm preview-device" data-device="tablet">
                        <i class="fas fa-tablet-alt"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm preview-device" data-device="mobile">
                        <i class="fas fa-mobile-alt"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm close-preview">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="preview-container">
                <div class="preview-frame">
                    <div class="preview-content">
                        <h2 class="preview-title">${testTitle}</h2>
                        <div class="preview-test-content">
                            ${testContent.innerHTML}
                        </div>
                    </div>
                </div>
            </div>
            <div class="preview-footer">
                <div class="preview-info">
                    <span class="badge bg-primary">
                        <i class="fas fa-question-circle"></i>
                        Вопросов: ${document.querySelectorAll('.question-block').length}
                    </span>
                    <span class="badge bg-info">
                        <i class="fas fa-clock"></i>
                        Примерное время: ${this.calculateTestTime()} мин
                    </span>
                </div>
                <div class="preview-theme">
                    <select class="form-select form-select-sm" id="previewThemeSelect">
                        <option value="light">Светлая тема</option>
                        <option value="dark">Тёмная тема</option>
                        <option value="sepia">Сепия</option>
                    </select>
                </div>
            </div>
        `;

        // Добавляем стили для предпросмотра
        const previewStyles = document.createElement('style');
        previewStyles.textContent = `
            .preview-window {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90vw;
                height: 90vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                z-index: 1050;
            }

            .preview-header {
                padding: 1rem;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .preview-actions {
                display: flex;
                gap: 0.5rem;
            }

            .preview-container {
                flex: 1;
                overflow: hidden;
                padding: 1rem;
                background: #f8f9fa;
            }

            .preview-frame {
                width: 100%;
                height: 100%;
                background: white;
                border-radius: 8px;
                overflow: auto;
                transition: all 0.3s ease;
            }

            .preview-content {
                padding: 2rem;
                max-width: 800px;
                margin: 0 auto;
            }

            .preview-footer {
                padding: 1rem;
                border-top: 1px solid rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .preview-info {
                display: flex;
                gap: 1rem;
            }

            /* Responsive Previews */
            .preview-frame[data-device="desktop"] {
                width: 100%;
            }

            .preview-frame[data-device="tablet"] {
                width: 768px;
                margin: 0 auto;
            }

            .preview-frame[data-device="mobile"] {
                width: 375px;
                margin: 0 auto;
            }

            /* Theme Previews */
            .preview-frame[data-theme="light"] {
                background: white;
                color: #212529;
            }

            .preview-frame[data-theme="dark"] {
                background: #212529;
                color: #f8f9fa;
            }

            .preview-frame[data-theme="sepia"] {
                background: #f4ecd8;
                color: #433422;
            }

            .preview-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
                z-index: 1040;
            }
        `;

        // Создаем оверлей
        const overlay = document.createElement('div');
        overlay.className = 'preview-overlay';

        // Добавляем элементы в DOM
        document.body.appendChild(previewStyles);
        document.body.appendChild(overlay);
        document.body.appendChild(previewWindow);

        // Обработчики событий
        const frame = previewWindow.querySelector('.preview-frame');
        const deviceButtons = previewWindow.querySelectorAll('.preview-device');
        const themeSelect = previewWindow.querySelector('#previewThemeSelect');
        const closeButton = previewWindow.querySelector('.close-preview');

        deviceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const device = button.dataset.device;
                frame.dataset.device = device;
                deviceButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        themeSelect.addEventListener('change', (e) => {
            frame.dataset.theme = e.target.value;
        });

        closeButton.addEventListener('click', () => {
            previewWindow.remove();
            overlay.remove();
            previewStyles.remove();
        });

        overlay.addEventListener('click', () => {
            closeButton.click();
        });
    }

    calculateTestTime() {
        const questions = document.querySelectorAll('.question-block');
        let totalTime = 0;

        questions.forEach(question => {
            // Базовое время на вопрос
            let questionTime = 30; // 30 секунд

            // Если есть таймер, используем его значение
            const timer = question.querySelector('.question-timer');
            if (timer) {
                const timeMatch = timer.textContent.match(/\d+/);
                if (timeMatch) {
                    questionTime = parseInt(timeMatch[0]);
                }
            }

            // Добавляем время в зависимости от типа вопроса
            if (question.querySelector('input[type="radio"]')) {
                questionTime += 15; // Дополнительное время для выбора из списка
            } else if (question.querySelector('input[type="checkbox"]')) {
                questionTime += 30; // Больше времени для множественного выбора
            } else if (question.querySelector('input[type="text"]')) {
                questionTime += 45; // Еще больше времени для текстового ответа
            }

            totalTime += questionTime;
        });

        // Конвертируем в минуты и округляем вверх
        return Math.ceil(totalTime / 60);
    }

    duplicateCurrentQuestion() {
        const selectedQuestion = document.querySelector('.question-block.selected');
        if (selectedQuestion) {
            const clone = selectedQuestion.cloneNode(true);
            selectedQuestion.after(clone);
            this.showToast('Вопрос скопирован', 'success');
        } else {
            this.showToast('Выберите вопрос для копирования', 'error');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    getTestQuestions() {
        // Получение всех вопросов теста
        const questions = [];
        document.querySelectorAll('.question-block').forEach(block => {
            questions.push({
                type: block.dataset.type,
                content: block.innerHTML
            });
        });
        return questions;
    }

    // Добавляем метод для применения темы
    applyTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme) {
            this.showToast('Тема не найдена', 'error');
            return;
        }

        // Применяем цвета темы только для редактора
        Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}-color`, value);
        });

        // Сохраняем выбранную тему
        localStorage.setItem('selectedTheme', JSON.stringify(theme));
        this.showToast(`Тема "${theme.name}" применена (только для редактора)`, 'info');
    }

    // Новые методы для работы с вопросами
    moveQuestion(direction) {
        const selectedQuestion = document.querySelector('.question-block.selected');
        if (!selectedQuestion) {
            this.showToast('Выберите вопрос для перемещения', 'error');
            return;
        }

        const sibling = direction === 'up' ? 
            selectedQuestion.previousElementSibling : 
            selectedQuestion.nextElementSibling;

        if (sibling && sibling.classList.contains('question-block')) {
            if (direction === 'up') {
                sibling.before(selectedQuestion);
            } else {
                sibling.after(selectedQuestion);
            }
            this.showToast('Вопрос перемещен', 'success');
        } else {
            this.showToast('Достигнут край списка', 'info');
        }
    }

    addHint() {
        const selectedQuestion = document.querySelector('.question-block.selected');
        if (!selectedQuestion) {
            this.showToast('Выберите вопрос для добавления подсказки', 'error');
            return;
        }

        const hint = prompt('Введите текст подсказки:');
        if (hint) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'question-hint mt-2';
            hintDiv.innerHTML = `
                <i class="fas fa-lightbulb text-warning"></i>
                <span class="ms-2">${hint}</span>
            `;
            selectedQuestion.querySelector('.question-content').appendChild(hintDiv);
            this.showToast('Подсказка добавлена', 'success');
        }
    }

    addExplanation() {
        const selectedQuestion = document.querySelector('.question-block.selected');
        if (!selectedQuestion) {
            this.showToast('Выберите вопрос для добавления объяснения', 'error');
            return;
        }

        const explanation = prompt('Введите объяснение правильного ответа:');
        if (explanation) {
            const explDiv = document.createElement('div');
            explDiv.className = 'question-explanation mt-3';
            explDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <span class="ms-2">${explanation}</span>
                </div>
            `;
            selectedQuestion.querySelector('.question-content').appendChild(explDiv);
            this.showToast('Объяснение добавлено', 'success');
        }
    }

    setPoints() {
        const selectedQuestion = document.querySelector('.question-block.selected');
        if (!selectedQuestion) {
            this.showToast('Выберите вопрос для установки баллов', 'error');
            return;
        }

        const points = prompt('Введите количество баллов за вопрос:', '1');
        if (points && !isNaN(points)) {
            const pointsDiv = document.createElement('div');
            pointsDiv.className = 'question-points';
            pointsDiv.innerHTML = `
                <span class="badge bg-success">
                    <i class="fas fa-star"></i> ${points} балл(ов)
                </span>
            `;
            const header = selectedQuestion.querySelector('.handle');
            header.appendChild(pointsDiv);
            this.showToast('Баллы установлены', 'success');
        }
    }

    addSection() {
        const sectionTitle = prompt('Введите название раздела:');
        if (sectionTitle) {
            const section = document.createElement('div');
            section.className = 'test-section mb-4';
            section.innerHTML = `
                <div class="section-header">
                    <h3>${sectionTitle}</h3>
                    <div class="section-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="this.closest('.test-section').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('test-content').appendChild(section);
            this.showToast('Раздел добавлен', 'success');
        }
    }

    importQuestions() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const questions = JSON.parse(e.target.result);
                        this.addImportedQuestions(questions);
                    } catch (error) {
                        this.showToast('Ошибка при импорте файла', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    addImportedQuestions(questions) {
        if (Array.isArray(questions)) {
            questions.forEach(q => {
                // Логика добавления импортированных вопросов
                this.createQuestion(q.type);
            });
            this.showToast(`Импортировано ${questions.length} вопросов`, 'success');
        }
    }

    shuffleQuestions() {
        const questions = Array.from(document.querySelectorAll('.question-block'));
        if (questions.length < 2) {
            this.showToast('Недостаточно вопросов для перемешивания', 'error');
            return;
        }

        const container = document.getElementById('test-content');
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            container.appendChild(questions[j]);
        }
        this.showToast('Вопросы перемешаны', 'success');
    }

    addTimer() {
        const selectedQuestion = document.querySelector('.question-block.selected');
        if (!selectedQuestion) {
            this.showToast('Выберите вопрос для добавления таймера', 'error');
            return;
        }

        const time = prompt('Введите время на вопрос (в секундах):', '60');
        if (time && !isNaN(time)) {
            const timerDiv = document.createElement('div');
            timerDiv.className = 'question-timer mt-2';
            timerDiv.innerHTML = `
                <i class="fas fa-clock text-info"></i>
                <span class="ms-2">Время на ответ: ${time} сек.</span>
            `;
            selectedQuestion.querySelector('.question-content').appendChild(timerDiv);
            this.showToast('Таймер добавлен', 'success');
        }
    }

    customizeTheme() {
        // Создаем модальное окно для настройки темы
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'customThemeModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-palette"></i>
                            Настройка пользовательской темы
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="theme-preview p-4 rounded mb-3">
                                    <h4>Предпросмотр темы</h4>
                                    <div class="preview-elements">
                                        <button class="btn btn-primary mb-2">Кнопка Primary</button>
                                        <button class="btn btn-secondary mb-2">Кнопка Secondary</button>
                                        <div class="alert alert-info mb-2">Информационный блок</div>
                                        <div class="card">
                                            <div class="card-body">
                                                <h5 class="card-title">Карточка</h5>
                                                <p class="card-text">Текст карточки</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="theme-settings">
                                    <div class="mb-3">
                                        <label class="form-label">Название темы</label>
                                        <input type="text" class="form-control" id="themeName" placeholder="Моя тема">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Основной цвет</label>
                                        <div class="input-group">
                                            <input type="color" class="form-control form-control-color" id="primaryColor">
                                            <input type="text" class="form-control" id="primaryColorText">
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Дополнительный цвет</label>
                                        <div class="input-group">
                                            <input type="color" class="form-control form-control-color" id="secondaryColor">
                                            <input type="text" class="form-control" id="secondaryColorText">
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Акцентный цвет</label>
                                        <div class="input-group">
                                            <input type="color" class="form-control form-control-color" id="accentColor">
                                            <input type="text" class="form-control" id="accentColorText">
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Цвет текста</label>
                                        <div class="input-group">
                                            <input type="color" class="form-control form-control-color" id="textColor">
                                            <input type="text" class="form-control" id="textColorText">
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Цвет фона</label>
                                        <div class="input-group">
                                            <input type="color" class="form-control form-control-color" id="backgroundColor">
                                            <input type="text" class="form-control" id="backgroundColorText">
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Цвет светлого фона</label>
                                        <div class="input-group">
                                            <input type="color" class="form-control form-control-color" id="bgLightColor">
                                            <input type="text" class="form-control" id="bgLightColorText">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" id="saveCustomTheme">Сохранить тему</button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в DOM
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);

        // Инициализация цветов
        const colorInputs = {
            primary: document.getElementById('primaryColor'),
            secondary: document.getElementById('secondaryColor'),
            accent: document.getElementById('accentColor'),
            text: document.getElementById('textColor'),
            background: document.getElementById('backgroundColor'),
            bgLight: document.getElementById('bgLightColor')
        };

        const colorTexts = {
            primary: document.getElementById('primaryColorText'),
            secondary: document.getElementById('secondaryColorText'),
            accent: document.getElementById('accentColorText'),
            text: document.getElementById('textColorText'),
            background: document.getElementById('backgroundColorText'),
            bgLight: document.getElementById('bgLightColorText')
        };

        // Загружаем текущие цвета
        const currentTheme = JSON.parse(localStorage.getItem('selectedTheme')) || this.themes.classic;
        colorInputs.primary.value = currentTheme.colors.primary;
        colorInputs.secondary.value = currentTheme.colors.secondary;
        colorInputs.accent.value = currentTheme.colors.accent;
        colorInputs.text.value = currentTheme.colors.text;
        colorInputs.background.value = currentTheme.colors.background;
        colorInputs.bgLight.value = currentTheme.colors['bg-light'];

        // Обновляем текстовые поля
        Object.keys(colorInputs).forEach(key => {
            colorTexts[key].value = colorInputs[key].value;
            
            // Добавляем обработчики событий
            colorInputs[key].addEventListener('input', (e) => {
                colorTexts[key].value = e.target.value;
                this.updateThemePreview();
            });

            colorTexts[key].addEventListener('input', (e) => {
                if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    colorInputs[key].value = e.target.value;
                    this.updateThemePreview();
                }
            });
        });

        // Обработчик сохранения темы
        document.getElementById('saveCustomTheme').addEventListener('click', () => {
            const themeName = document.getElementById('themeName').value || 'Пользовательская тема';
            const customTheme = {
                name: themeName,
                colors: {
                    primary: colorInputs.primary.value,
                    secondary: colorInputs.secondary.value,
                    accent: colorInputs.accent.value,
                    text: colorInputs.text.value,
                    background: colorInputs.background.value,
                    'bg-light': colorInputs.bgLight.value
                }
            };

            // Сохраняем тему
            this.themes.custom = customTheme;
            localStorage.setItem('customTheme', JSON.stringify(customTheme));
            this.applyTheme('custom');
            modalInstance.hide();
            this.showToast('Пользовательская тема сохранена', 'success');
        });

        modalInstance.show();
    }

    updateThemePreview() {
        const previewElements = document.querySelector('.preview-elements');
        if (!previewElements) return;

        const colors = {
            primary: document.getElementById('primaryColor').value,
            secondary: document.getElementById('secondaryColor').value,
            accent: document.getElementById('accentColor').value,
            text: document.getElementById('textColor').value,
            background: document.getElementById('backgroundColor').value,
            'bg-light': document.getElementById('bgLightColor').value
        };

        Object.entries(colors).forEach(([key, value]) => {
            previewElements.style.setProperty(`--${key}-color`, value);
        });
    }
}

// Initialize the command palette
const commandPalette = new CommandPalette();

// Global function for adding options to choice questions
function addOption(button, type) {
    const optionsDiv = button.previousElementSibling;
    const newOption = document.createElement('div');
    newOption.className = 'option-wrapper mb-2';
    newOption.innerHTML = `
        <div class="input-group">
            <div class="input-group-text correct-answer-toggle" onclick="toggleCorrectAnswer(this)">
                <input type="${type}" class="form-check-input">
            </div>
            <input type="text" class="form-control" placeholder="Вариант ответа">
            <button class="btn btn-outline-danger" onclick="removeOption(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add with animation
    newOption.style.opacity = '0';
    newOption.style.transform = 'translateY(20px)';
    optionsDiv.appendChild(newOption);
    
    requestAnimationFrame(() => {
        newOption.style.opacity = '1';
        newOption.style.transform = 'translateY(0)';
    });

    showToast('Добавлен новый вариант ответа', 'info');
}

// Global function for toggling correct answers
function toggleCorrectAnswer(button) {
    if (!button) return;
    
    const questionBlock = button.closest('.question-block');
    if (!questionBlock) return;
    
    const type = questionBlock.querySelector('input[type="radio"]') ? 'single' : 'multiple';
    const optionWrapper = button.closest('.option-wrapper');
    if (!optionWrapper) return;
    
    const optionInput = optionWrapper.querySelector('input[type="text"]');
    const optionText = optionInput ? (optionInput.value || 'Этот вариант') : 'Этот вариант';
    const checkbox = button.querySelector('input[type="radio"], input[type="checkbox"]');
    
    if (type === 'single') {
        // Remove active class from all toggles in this question
        questionBlock.querySelectorAll('.correct-answer-toggle').forEach(toggle => {
            toggle.classList.remove('active');
            toggle.querySelector('input').checked = false;
        });
        button.classList.add('active');
        checkbox.checked = true;
        showToast(`"${optionText}" установлен как правильный ответ`, 'success');
    } else {
        button.classList.toggle('active');
        checkbox.checked = !checkbox.checked;
        if (button.classList.contains('active')) {
            showToast(`"${optionText}" добавлен как правильный ответ`, 'success');
        } else {
            showToast(`"${optionText}" больше не является правильным ответом`, 'info');
        }
    }
}

// Global function for removing options
function removeOption(button) {
    if (!button) return;
    
    const optionWrapper = button.closest('.option-wrapper');
    if (!optionWrapper) return;
    
    optionWrapper.remove();
    showToast('Вариант ответа удален', 'info');
} 