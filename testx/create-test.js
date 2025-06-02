document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const AUTOSAVE_INTERVAL = 30000; // 30 seconds
    
    // DOM Elements
    const testContent = document.getElementById('test-content');
    const toolItems = document.querySelectorAll('.tool-item');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
    const exportResult = document.getElementById('exportResult');
    const copyExport = document.getElementById('copyExport');
    const testTitleInput = document.getElementById('test-title');

    // State
    let questionCounter = 0;
    let isAutosaving = false;
    let testSettings = {
        timeLimit: 0,
        shuffleQuestions: false,
        showResults: 'end',
        gradingCriteria: {
            A: 90,
            B: 75,
            C: 60
        },
        showGrade: true,
        showCriteria: true
    };

    // Load saved settings if they exist
    const savedSettings = localStorage.getItem('testSettings');
    if (savedSettings) {
        try {
            testSettings = JSON.parse(savedSettings);
            applySettings();
        } catch (e) {
            console.error('Failed to load saved settings:', e);
        }
    }

    // Initialize features
    initializeTooltips();
    initializeDarkMode();
    initializeShortcuts();
    initializeToolItems();

    // Add placeholder if content is empty
    if (!testContent.children.length) {
        addPlaceholder();
    }

    // Event listeners
    document.getElementById('downloadHtml').addEventListener('click', function() {
        downloadTestAsHtml();
    });

    // Clear functionality
    clearBtn.addEventListener('click', function() {
        if (testContent.children.length === 0) {
            showToast('Нечего очищать', 'info');
            return;
        }

        if (confirm('Вы уверены, что хотите очистить все вопросы?')) {
            // Анимация удаления всех вопросов
            const questions = Array.from(testContent.querySelectorAll('.question-block'));
            questions.forEach((question, index) => {
                setTimeout(() => {
                    question.style.opacity = '0';
                    question.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        question.remove();
                        if (index === questions.length - 1) {
                            addPlaceholder();
                            testTitleInput.value = '';
                            showToast('Все вопросы удалены', 'success');
                        }
                    }, 300);
                }, index * 100);
            });
        }
    });

    function initializeToolItems() {
        toolItems.forEach(item => {
            item.addEventListener('click', () => addQuestionBlock(item.dataset.type));
        });
    }

    function addQuestionBlock(type) {
        const block = document.createElement('div');
        block.className = 'question-block fade-in';

        const handle = document.createElement('div');
        handle.className = 'handle';
        handle.innerHTML = `
            <span><i class="fas fa-grip-lines"></i> Вопрос ${document.querySelectorAll('.question-block').length + 1}</span>
            <button class="btn btn-outline-danger btn-sm delete-question" onclick="deleteQuestion(this)">
                <i class="fas fa-times"></i>
            </button>
        `;

        const content = document.createElement('div');
        content.className = 'question-content';

        switch(type) {
            case 'single-choice':
                content.innerHTML = `
                    <input type="text" class="form-control mb-3" placeholder="Введите вопрос">
                    <div class="options">
                        <div class="option-wrapper mb-2">
                            <div class="input-group">
                                <div class="input-group-text">
                                    <input type="radio" disabled>
                                </div>
                                <input type="text" class="form-control" placeholder="Вариант ответа">
                                <button class="btn btn-outline-danger" onclick="this.closest('.option-wrapper').remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <i class="fas fa-check correct-answer-toggle" onclick="toggleCorrectAnswer(this)"></i>
                        </div>
                    </div>
                    <button class="btn btn-outline-primary btn-sm" onclick="addOption(this, 'radio')">
                        <i class="fas fa-plus"></i> Добавить вариант
                    </button>
                `;
                break;

            case 'multiple-choice':
                content.innerHTML = `
                    <input type="text" class="form-control mb-3" placeholder="Введите вопрос">
                    <div class="options">
                        <div class="option-wrapper mb-2">
                            <div class="input-group">
                                <div class="input-group-text">
                                    <input type="checkbox" disabled>
                                </div>
                                <input type="text" class="form-control" placeholder="Вариант ответа">
                                <button class="btn btn-outline-danger" onclick="this.closest('.option-wrapper').remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <i class="fas fa-check correct-answer-toggle" onclick="toggleCorrectAnswer(this)"></i>
                        </div>
                    </div>
                    <button class="btn btn-outline-primary btn-sm" onclick="addOption(this, 'checkbox')">
                        <i class="fas fa-plus"></i> Добавить вариант
                    </button>
                `;
                break;

            case 'text':
                content.innerHTML = `
                    <input type="text" class="form-control mb-3" placeholder="Введите вопрос">
                    <input type="text" class="form-control" placeholder="Правильный ответ">
                `;
                break;

            case 'image':
                content.innerHTML = `
                    <input type="text" class="form-control mb-3" placeholder="Введите вопрос">
                    <input type="url" class="form-control mb-3" placeholder="URL изображения">
                    <input type="text" class="form-control" placeholder="Правильный ответ">
                `;
                break;
        }

        block.appendChild(handle);
        block.appendChild(content);

        // Remove placeholder if it exists
        const placeholder = testContent.querySelector('.text-center.text-muted');
        if (placeholder) {
            placeholder.remove();
        }

        // Add with animation
        block.style.opacity = '0';
        testContent.appendChild(block);
        requestAnimationFrame(() => {
            block.style.opacity = '1';
            block.style.transform = 'translateY(0)';
        });

        // Add delete functionality
        handle.querySelector('.delete-question').addEventListener('click', function() {
            block.style.opacity = '0';
            block.style.transform = 'translateY(20px)';
            setTimeout(() => {
                block.remove();
                if (testContent.children.length === 0) {
                    addPlaceholder();
                }
            }, 300);
        });
    }

    function addPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'text-center text-muted mt-5';
        placeholder.innerHTML = `
            <i class="fas fa-arrow-left fa-2x"></i>
            <p>Выберите тип вопроса из меню слева</p>
        `;
        placeholder.style.opacity = '0';
        testContent.appendChild(placeholder);
        requestAnimationFrame(() => {
            placeholder.style.opacity = '1';
        });
    }

    // Export functionality
    exportBtn.addEventListener('click', function() {
        exportModal.show();
        updateExport();
    });

    function updateExport() {
        const testData = {
            title: testTitleInput.value || 'Без названия',
            settings: testSettings,
            questions: Array.from(document.querySelectorAll('.question-block')).map(block => {
                const question = block.querySelector('input[placeholder="Введите вопрос"]').value;
                const type = getQuestionType(block);
                
                let options, value, imageUrl;
                if (type === 'single-choice' || type === 'multiple-choice') {
                    const optionElements = block.querySelectorAll('.option-wrapper');
                    options = Array.from(optionElements).map(wrapper => 
                        wrapper.querySelector('input[type="text"]').value
                    );
                    if (type === 'single-choice') {
                        const correctIndex = Array.from(optionElements).findIndex(wrapper => 
                            wrapper.querySelector('.correct-answer-toggle').classList.contains('active')
                        );
                        value = correctIndex >= 0 ? correctIndex : 0;
                    } else {
                        value = Array.from(optionElements).map(wrapper => 
                            wrapper.querySelector('.correct-answer-toggle').classList.contains('active')
                        );
                    }
                } else if (type === 'text') {
                    value = block.querySelector('input[placeholder="Правильный ответ"]').value;
                    return { question, type, value };
                } else if (type === 'image') {
                    imageUrl = block.querySelector('input[type="url"]').value;
                    value = block.querySelector('input[placeholder="Правильный ответ"]').value;
                    return { question, type, imageUrl, value };
                }
                
                return { question, type, options, value };
            })
        };

        // Validate test data
        if (!testData.questions.length) {
            showToast('Добавьте хотя бы один вопрос', 'error');
            return;
        }

        const invalidQuestions = testData.questions.filter(q => !q.question.trim());
        if (invalidQuestions.length > 0) {
            showToast('Заполните текст всех вопросов', 'error');
            return;
        }

        try {
            const jsonString = JSON.stringify(testData);
            const compressedData = LZString.compressToBase64(jsonString);
            exportResult.value = compressedData;
            
            // Enable copy button
            copyExport.disabled = false;
        } catch (error) {
            console.error('Error during export:', error);
            showToast('Ошибка при экспорте теста', 'error');
        }
    }

    copyExport.addEventListener('click', function() {
        // Create a temporary textarea for copying
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = exportResult.value;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        showToast('Ключ скопирован в буфер обмена!', 'success');
    });

    function initializeTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.dataset.tooltip;
            element.appendChild(tooltip);
        });
    }

    function initializeDarkMode() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', darkMode);
    }

    function initializeShortcuts() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'e') {
                    e.preventDefault();
                    exportBtn.click();
                }
            }
        });
    }

    function getQuestionType(block) {
        if (block.querySelector('input[type="radio"]')) return 'single-choice';
        if (block.querySelector('input[type="checkbox"]')) return 'multiple-choice';
        if (block.querySelector('input[type="url"]')) return 'image';
        return 'text';
    }

    function downloadTestAsHtml() {
        const testData = {
            title: testTitleInput.value || 'Без названия',
            questions: Array.from(document.querySelectorAll('.question-block')).map(block => {
                const question = block.querySelector('input[placeholder="Введите вопрос"]').value;
                const type = getQuestionType(block);
                
                let options, value, imageUrl;
                if (type === 'single-choice' || type === 'multiple-choice') {
                    const optionElements = block.querySelectorAll('.option-wrapper');
                    options = Array.from(optionElements).map(wrapper => 
                        wrapper.querySelector('input[type="text"]').value
                    );
                    if (type === 'single-choice') {
                        const correctIndex = Array.from(optionElements).findIndex(wrapper => 
                            wrapper.querySelector('.correct-answer-toggle').classList.contains('active')
                        );
                        value = correctIndex >= 0 ? correctIndex : 0;
                    } else {
                        value = Array.from(optionElements).map(wrapper => 
                            wrapper.querySelector('.correct-answer-toggle').classList.contains('active')
                        );
                    }
                } else if (type === 'text') {
                    value = block.querySelector('input[placeholder="Правильный ответ"]').value;
                    return { question, type, value };
                } else if (type === 'image') {
                    imageUrl = block.querySelector('input[type="url"]').value;
                    value = block.querySelector('input[placeholder="Правильный ответ"]').value;
                    return { question, type, imageUrl, value };
                }
                
                return { question, type, options, value };
            })
        };

        // Проверяем данные теста перед экспортом
        if (!testData.questions.length) {
            showToast('Добавьте хотя бы один вопрос', 'error');
            return;
        }

        // Проверяем каждый вопрос
        const invalidQuestions = testData.questions.filter(q => !q.question.trim());
        if (invalidQuestions.length > 0) {
            showToast('Заполните текст всех вопросов', 'error');
            return;
        }

        try {
            // Получаем встроенные стили
            const styles = `
                :root {
                    --primary-color: #3a86ff;
                    --secondary-color: #8338ec;
                    --accent-color: #ff006e;
                    --background-color: #f8f9fa;
                    --text-color: #2b2d42;
                }

                body {
                    font-family: 'Inter', sans-serif;
                    color: var(--text-color);
                    background: linear-gradient(45deg, rgba(58, 134, 255, 0.05) 0%, rgba(131, 56, 236, 0.05) 100%);
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                }

                /* Animated background */
                .animated-bg {
                    position: fixed;
                    width: 100vw;
                    height: 100vh;
                    top: 0;
                    left: 0;
                    z-index: -1;
                    overflow: hidden;
                }

                .animated-bg::before {
                    content: '';
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    top: -50%;
                    left: -50%;
                    background: radial-gradient(
                        circle at center,
                        rgba(58, 134, 255, 0.1) 0%,
                        rgba(131, 56, 236, 0.1) 30%,
                        transparent 70%
                    );
                    animation: rotate 30s linear infinite;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 2rem;
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .test-key-container {
                    text-align: center;
                    margin: 3rem 0;
                }

                .btn {
                    padding: 0.75rem 2rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    border: none;
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                }

                .btn-lg {
                    font-size: 1.2rem;
                }

                .btn-primary {
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }

                .btn-outline-primary {
                    border: 2px solid var(--primary-color);
                    color: var(--primary-color);
                    background: transparent;
                }

                .btn-outline-primary:hover {
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    border-color: transparent;
                }

                .question {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 15px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .question h3 {
                    color: var(--primary-color);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                .question-text {
                    font-size: 1.25rem;
                    margin-bottom: 1.5rem;
                    color: var(--text-color);
                }

                .option-label {
                    display: block;
                    padding: 1rem 1.5rem;
                    margin: 0.75rem 0;
                    border: 2px solid rgba(131, 56, 236, 0.1);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.5);
                }

                .option-label:hover {
                    background: rgba(58, 134, 255, 0.05);
                    border-color: var(--primary-color);
                    transform: translateX(5px);
                }

                .option-label input[type="radio"],
                .option-label input[type="checkbox"] {
                    margin-right: 10px;
                }

                .navigation {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 2rem;
                    gap: 1rem;
                }

                .navigation button {
                    min-width: 120px;
                }

                .progress {
                    height: 8px;
                    border-radius: 4px;
                    margin: 2rem 0;
                    background: rgba(131, 56, 236, 0.1);
                    overflow: hidden;
                }

                .progress-bar {
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    transition: width 0.3s ease;
                }

                /* Результаты */
                .results-container {
                    text-align: center;
                    padding: 2rem;
                    animation: fadeIn 0.5s ease-out;
                }

                .score-circle {
                    width: 180px;
                    height: 180px;
                    margin: 0 auto 2rem;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: bold;
                    color: white;
                    box-shadow: 0 10px 25px rgba(58, 134, 255, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                .score-circle::before {
                    content: '';
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(
                        45deg,
                        rgba(255, 255, 255, 0.1),
                        rgba(255, 255, 255, 0.2)
                    );
                    animation: rotate 10s linear infinite;
                }

                .score-circle span {
                    position: relative;
                    z-index: 1;
                }

                .details {
                    margin-top: 3rem;
                }

                .answer-review {
                    text-align: left;
                    padding: 1.5rem;
                    margin: 1rem 0;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.9);
                    border-left: 4px solid;
                    animation: slideIn 0.3s ease-out forwards;
                    opacity: 0;
                    transform: translateX(-20px);
                }

                @keyframes slideIn {
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .answer-review:nth-child(n) {
                    animation-delay: calc(0.1s * var(--i, 0));
                }

                .answer-correct {
                    border-color: var(--primary-color);
                    background: rgba(58, 134, 255, 0.05);
                }

                .answer-incorrect {
                    border-color: var(--accent-color);
                    background: rgba(255, 0, 110, 0.05);
                }

                .answer-review h4 {
                    color: var(--text-color);
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .question-image {
                    margin: 1.5rem 0;
                }

                .question-image img {
                    max-width: 100%;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                /* Адаптивность */
                @media (max-width: 768px) {
                    .container {
                        padding: 1rem;
                        margin: 1rem;
                    }

                    h1 {
                        font-size: 2rem;
                    }

                    .question {
                        padding: 1.5rem;
                    }

                    .option-label {
                        padding: 1rem;
                    }

                    .score-circle {
                        width: 150px;
                        height: 150px;
                        font-size: 2.5rem;
                    }

                    .navigation {
                        flex-direction: column;
                    }

                    .navigation button {
                        width: 100%;
                    }
                }
            `;

            // Встраиваемый JavaScript код для прохождения теста
            const takeTestJs = `
// Функция для декодирования UTF-8 из base64
function b64_to_utf8(str) {
    try {
        console.log('Декодирование base64 строки длиной:', str.length);
        const decoded = decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        console.log('Успешно декодировано в UTF-8');
        return decoded;
    } catch (e) {
        console.error('Ошибка декодирования:', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация теста...');
    
    // Получаем данные теста
    const testKey = document.getElementById('testKey').value;
    console.log('Получен ключ теста длиной:', testKey.length);
    let testData;
    
    try {
        const decodedData = b64_to_utf8(testKey);
        if (!decodedData) {
            throw new Error('Не удалось декодировать данные теста');
        }
        console.log('Декодированные данные:', decodedData);
        testData = JSON.parse(decodedData);
        console.log('Данные теста успешно загружены:', testData);
    } catch (error) {
        console.error('Ошибка при загрузке теста:', error);
        alert('Ошибка при загрузке теста');
        return;
    }

    // DOM Elements
    const startTestBtn = document.getElementById('startTest');
    const testContainer = document.getElementById('testContainer');
    const resultContainer = document.getElementById('resultContainer');
    const progressBar = document.getElementById('progressBar');

    // State
    let currentQuestionIndex = 0;
    let userAnswers = new Array(testData.questions.length).fill(null);
    console.log('Инициализирован массив ответов:', userAnswers);

    // Event Listeners
    startTestBtn.addEventListener('click', () => {
        console.log('Начало теста');
        document.querySelector('.test-key-container').style.display = 'none';
        testContainer.style.display = 'block';
        showQuestion(currentQuestionIndex);
    });

    function showQuestion(index) {
        console.log('Показываем вопрос', index + 1);
        const question = testData.questions[index];
        console.log('Данные вопроса:', question);
        
        testContainer.innerHTML = \`
            <div class="question">
                <h3>Вопрос \${index + 1} из \${testData.questions.length}</h3>
                <p class="question-text">\${question.question}</p>
                \${question.type === 'image' ? \`
                    <div class="question-image">
                        <img src="\${question.imageUrl}" alt="Изображение к вопросу">
                    </div>
                \` : ''}
                <div class="answers">
                    \${getAnswerHTML(question, index)}
                </div>
                <div class="navigation">
                    \${index > 0 ? \`
                        <button class="btn btn-outline-primary" onclick="window.testHandler.navigate(-1)">Назад</button>
                    \` : ''}
                    \${index < testData.questions.length - 1 ? \`
                        <button class="btn btn-primary" onclick="window.testHandler.navigate(1)">Далее</button>
                    \` : \`
                        <button class="btn btn-success" onclick="window.testHandler.finishTest()">Завершить</button>
                    \`}
                </div>
            </div>
        \`;
        
        // Добавляем обработчики событий для ответов
        if (question.type === 'single-choice' || question.type === 'multiple-choice') {
            const inputs = testContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            inputs.forEach(input => {
                input.addEventListener('change', function() {
                    if (question.type === 'single-choice') {
                        userAnswers[index] = parseInt(this.value);
                    } else {
                        userAnswers[index] = Array.from(inputs).map(inp => inp.checked);
                    }
                    console.log('Сохранен ответ для вопроса', index + 1, ':', userAnswers[index]);
                    updateProgress();
                });
            });
        }
        
        updateProgress();
    }

    function getAnswerHTML(question, index) {
        console.log('Генерация HTML для ответов, тип:', question.type);
        if (question.type === 'single-choice' || question.type === 'multiple-choice') {
            const type = question.type === 'single-choice' ? 'radio' : 'checkbox';
            return question.options.map((option, i) => \`
                <label class="option-label">
                    <input type="\${type}" name="q\${index}" value="\${i}"
                           \${Array.isArray(userAnswers[index]) ? 
                             (userAnswers[index]?.[i] ? 'checked' : '') : 
                             (userAnswers[index] === i ? 'checked' : '')}>
                    <span>\${option}</span>
                </label>
            \`).join('');
        } else {
            return \`
                <input type="text" class="form-control" 
                       value="\${userAnswers[index] || ''}"
                       onchange="window.testHandler.saveAnswer(\${index}, this.value)">
            \`;
        }
    }

    function updateProgress() {
        const answered = userAnswers.filter(a => a !== null).length;
        const progress = (answered / testData.questions.length) * 100;
        console.log('Прогресс:', progress + '%', '(', answered, '/', testData.questions.length, ')');
        progressBar.style.width = \`\${progress}%\`;
    }

    function saveAnswer(index, value) {
        console.log('Сохранение ответа для вопроса', index + 1, ':', value);
        userAnswers[index] = value;
        updateProgress();
    }

    function navigate(direction) {
        console.log('Навигация:', direction > 0 ? 'вперед' : 'назад');
        currentQuestionIndex += direction;
        showQuestion(currentQuestionIndex);
    }

    function finishTest() {
        if (!confirm('Вы уверены, что хотите завершить тест?')) return;
        console.log('Завершение теста');
        console.log('Итоговые ответы:', userAnswers);

        const results = calculateResults();
        console.log('Результаты теста:', results);
        
        testContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        showResults(results);
    }

    function calculateResults() {
        console.log('Подсчет результатов');
        let correct = 0;
        const details = testData.questions.map((q, i) => {
            const userAnswer = userAnswers[i];
            console.log('Проверка вопроса', i + 1);
            console.log('Тип вопроса:', q.type);
            console.log('Ответ пользователя:', userAnswer);
            console.log('Правильный ответ:', q.value);
            
            let isCorrect = false;

            if (q.type === 'single-choice') {
                isCorrect = userAnswer === q.value;
                console.log('Сравнение single-choice:', userAnswer, '===', q.value, '=>', isCorrect);
            } else if (q.type === 'multiple-choice') {
                isCorrect = compareArrays(userAnswer, q.value);
                console.log('Сравнение multiple-choice:', userAnswer, 'с', q.value, '=>', isCorrect);
            } else {
                // Для текстовых вопросов и вопросов с изображениями
                const normalizedUserAnswer = (userAnswer || '').toLowerCase().trim();
                const normalizedCorrectAnswer = (q.value || '').toLowerCase().trim();
                isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
                console.log('Сравнение текста:', 
                    'Пользователь:', normalizedUserAnswer,
                    'Правильно:', normalizedCorrectAnswer,
                    '=>', isCorrect
                );
            }

            if (isCorrect) correct++;

            return {
                question: q.question,
                userAnswer: userAnswer,
                correctAnswer: q.value,
                isCorrect
            };
        });

        const score = (correct / testData.questions.length) * 100;
        console.log('Итоговый результат:', score + '%', '(', correct, '/', testData.questions.length, ')');
        
        return {
            score,
            details
        };
    }

    function showResults(results) {
        console.log('Отображение результатов');
        resultContainer.innerHTML = \`
            <div class="results-container">
                <h2>Результаты теста</h2>
                <div class="score-circle">
                    <span>\${Math.round(results.score)}%</span>
                </div>
                <div class="details">
                    \${results.details.map((d, i) => \`
                        <div class="answer-review \${d.isCorrect ? 'answer-correct' : 'answer-incorrect'}">
                            <h4>Вопрос \${i + 1}</h4>
                            <p>\${d.question}</p>
                            <div>Ваш ответ: \${formatAnswer(d.userAnswer)}</div>
                            \${!d.isCorrect ? \`<div>Правильный ответ: \${formatAnswer(d.correctAnswer)}</div>\` : ''}
                        </div>
                    \`).join('')}
                </div>
                <button class="btn btn-primary mt-4" onclick="location.reload()">
                    Пройти тест заново
                </button>
            </div>
        \`;
    }

    function formatAnswer(answer) {
        console.log('Форматирование ответа:', answer);
        if (Array.isArray(answer)) {
            if (answer.every(item => typeof item === 'boolean')) {
                // Для multiple-choice вопросов показываем выбранные опции
                const selectedOptions = answer
                    .map((selected, index) => selected ? (index + 1) : null)
                    .filter(item => item !== null)
                    .join(', ');
                return selectedOptions || 'Нет ответа';
            }
            return answer.join(', ');
        }
        if (answer === null || answer === undefined || answer === '') {
            return 'Нет ответа';
        }
        return answer.toString();
    }

    function compareArrays(arr1, arr2) {
        if (!arr1 || !arr2) {
            console.log('compareArrays: один из массивов null/undefined');
            return false;
        }
        if (arr1.length !== arr2.length) {
            console.log('compareArrays: разная длина массивов');
            return false;
        }
        const result = arr1.every((item, i) => item === arr2[i]);
        console.log('compareArrays:', arr1, 'vs', arr2, '=>', result);
        return result;
    }

    // Make functions available globally through a single handler object
    window.testHandler = {
        navigate,
        saveAnswer,
        finishTest
    };
    
    console.log('Инициализация теста завершена');
});`;

            // Создаем HTML файл для скачивания
            const templateHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testData.title} - TestX</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        ${styles}
    </style>
</head>
<body>
    <div class="animated-bg"></div>
    <div class="container mt-5">
        <h1>${testData.title}</h1>
        <div class="test-key-container">
            <div class="form-group">
                <input type="hidden" id="testKey" value="${utf8_to_b64(JSON.stringify(testData))}">
            </div>
            <button id="startTest" class="btn btn-primary btn-lg">
                <i class="fas fa-play me-2"></i> Начать тест
            </button>
        </div>
        <div id="testContainer" style="display: none;"></div>
        <div id="resultContainer" style="display: none;"></div>
        <div class="progress">
            <div id="progressBar" class="progress-bar" role="progressbar" style="width: 0%"></div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        ${takeTestJs}
    </script>
    <script>
// Предупреждение при открытии DevTools
let devToolsOpened = false;

Object.defineProperty(window, 'devtools', {
    get: function() {
        if(!devToolsOpened) {
            devToolsOpened = true;
            alert('Использование инструментов разработчика запрещено!');
            // Можно также перенаправить пользователя или заблокировать доступ
            // window.location.href = '/blocked.html';
        }
        return true;
    }
});

// Дополнительная проверка размера окна (часто меняется при открытии DevTools)
let width = window.outerWidth - window.innerWidth;
let height = window.outerHeight - window.innerHeight;
setInterval(() => {
    if(width !== window.outerWidth - window.innerWidth || 
       height !== window.outerHeight - window.innerHeight) {
        // DevTools, вероятно, открыты
        alert('Пожалуйста, закройте инструменты разработчика');
    }
}, 1000);
    </script>
    

<script>
// Отключаем контекстное меню (ПКМ)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

// Отключаем клавиши
document.addEventListener('keydown', (e) => {
    // Отключаем F12
    if(e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    
    // Отключаем Ctrl+Shift+I/J/C
    if(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
    }
    
    // Отключаем Ctrl+U (просмотр исходного кода)
    if(e.ctrlKey && e.key === 'U') {
        e.preventDefault();
        return false;
    }
});

// Отключаем выделение текста
document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
});

// Отключаем перетаскивание
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
});

// Отключаем копирование
document.addEventListener('copy', (e) => {
    e.preventDefault();
    return false;
});

// Дополнительная защита от DevTools
setInterval(() => {
    const devtools = /./;
    devtools.toString = function() {
        this.opened = true;
    }
    console.log('%c', devtools);
}, 1000);

// Можно также добавить CSS
</script>

<style>
/* Отключаем выделение текста через CSS */
* {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

/* Отключаем перетаскивание изображений */
img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
}
</style>
</body>
</html>`;

            // Создаем ссылку для скачивания
            const downloadBtn = document.createElement('a');
            downloadBtn.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(templateHtml);
            downloadBtn.download = `${testData.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_test.html`;
            downloadBtn.style.display = 'none';
            document.body.appendChild(downloadBtn);
            downloadBtn.click();
            document.body.removeChild(downloadBtn);
            
            showToast('Тест успешно сохранен как HTML файл', 'success');
        } catch (error) {
            console.error('Ошибка при создании HTML файла:', error);
            showToast('Ошибка при создании HTML файла', 'error');
        }
    }
});

// Global function for adding options to choice questions
function addOption(button, type) {
    const optionsDiv = button.previousElementSibling;
    const newOption = document.createElement('div');
    newOption.className = 'option-wrapper mb-2';
    newOption.innerHTML = `
        <div class="input-group">
            <div class="input-group-text">
                <input type="${type}" disabled>
            </div>
            <input type="text" class="form-control" placeholder="Вариант ответа">
            <button class="btn btn-outline-danger" onclick="removeOption(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <i class="fas fa-check correct-answer-toggle" onclick="toggleCorrectAnswer(this)"></i>
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

// Глобальная функция для показа уведомлений
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    
    // Add icon based on type
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i> ';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i> ';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i> ';
            break;
    }
    
    toast.innerHTML = icon + message;
    document.body.appendChild(toast);
    
    // Position the toast
    const toasts = document.querySelectorAll('.toast-message');
    const offset = (toasts.length - 1) * 60;
    toast.style.bottom = `${20 + offset}px`;
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                toast.remove();
                // Reposition remaining toasts
                document.querySelectorAll('.toast-message').forEach((t, i) => {
                    t.style.bottom = `${20 + i * 60}px`;
                });
            }, 300);
        }, 3000);
    });
}

// Global function for toggling correct answers
function toggleCorrectAnswer(element) {
    if (!element) return;
    
    const questionBlock = element.closest('.question-block');
    if (!questionBlock) return;
    
    const type = questionBlock.querySelector('input[type="radio"]') ? 'single' : 'multiple';
    const optionWrapper = element.closest('.option-wrapper');
    if (!optionWrapper) return;
    
    const optionInput = optionWrapper.querySelector('input[type="text"]');
    const optionText = optionInput ? (optionInput.value || 'Этот вариант') : 'Этот вариант';
    
    if (type === 'single') {
        // Remove active class from all toggles in this question
        questionBlock.querySelectorAll('.correct-answer-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
        element.classList.add('active');
        showToast(`"${optionText}" установлен как правильный ответ`, 'success');
    } else {
        element.classList.toggle('active');
        if (element.classList.contains('active')) {
            showToast(`"${optionText}" добавлен как правильный ответ`, 'success');
        } else {
            showToast(`"${optionText}" больше не является правильным ответом`, 'info');
        }
    }
}

// Add new function for removing options
function removeOption(button) {
    const wrapper = button.closest('.option-wrapper');
    const optionText = wrapper.querySelector('input[type="text"]').value || 'Вариант';
    
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(20px)';
    setTimeout(() => {
        wrapper.remove();
        showToast(`"${optionText}" удален`, 'info');
    }, 300);
}

// Функция для кодирования UTF-8 строки в base64
function utf8_to_b64(str) {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    } catch (e) {
        console.error('Ошибка кодирования:', e);
        return '';
    }
}

// Функция для получения встроенных стилей
function getEmbeddedStyles() {
    try {
        // Создаем временный стиль с нашими правилами
        const style = document.createElement('style');
        style.textContent = `
            /* Основные стили */
            body { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .test-key-container { text-align: center; margin: 2rem 0; }
            .question { margin-bottom: 2rem; padding: 1.5rem; border-radius: 8px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .question-text { font-size: 1.2rem; margin-bottom: 1rem; }
            .option-label { display: block; padding: 0.75rem; margin: 0.5rem 0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
            .option-label:hover { background: #f8f9fa; }
            .progress { height: 0.5rem; }
            .progress-bar { transition: width 0.3s ease; }
            .results-container { text-align: center; padding: 2rem; }
            .score-circle { width: 150px; height: 150px; margin: 0 auto 2rem; border-radius: 50%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; }
            .answer-review { padding: 1rem; margin: 1rem 0; border-radius: 4px; }
            .answer-correct { background-color: #d4edda; }
            .answer-incorrect { background-color: #f8d7da; }
            .question-image img { max-width: 100%; height: auto; margin: 1rem 0; border-radius: 4px; }
            
            /* Темная тема */
            body.dark-mode { background-color: #1a1a1a; color: #fff; }
            body.dark-mode .question { background: #2d2d2d; }
            body.dark-mode .option-label { border-color: #444; }
            body.dark-mode .option-label:hover { background: #3d3d3d; }
        `;
        return style.textContent;
    } catch (e) {
        console.warn('Не удалось получить встроенные стили:', e);
        return '';
    }
}

// Global function for deleting questions
function deleteQuestion(button) {
    const block = button.closest('.question-block');
    if (!block) return;

    block.style.opacity = '0';
    block.style.transform = 'translateY(20px)';
    setTimeout(() => {
        block.remove();
        if (document.querySelectorAll('.question-block').length === 0) {
            addPlaceholder();
        }
        // Обновляем нумерацию вопросов
        updateQuestionNumbers();
        showToast('Вопрос удален', 'info');
    }, 300);
}

function saveSettings() {
    // Get values from form
    testSettings.timeLimit = parseInt(document.getElementById('timeLimit').value) || 0;
    testSettings.shuffleQuestions = document.getElementById('shuffleQuestions').checked;
    testSettings.showResults = document.querySelector('input[name="showResults"]:checked')?.value || 'end';
    testSettings.gradingCriteria = {
        A: parseInt(document.getElementById('gradeA').value) || 90,
        B: parseInt(document.getElementById('gradeB').value) || 75,
        C: parseInt(document.getElementById('gradeC').value) || 60
    };
    testSettings.showGrade = document.getElementById('showGrade').checked;
    testSettings.showCriteria = document.getElementById('showCriteria').checked;

    // Validate grading criteria
    if (testSettings.gradingCriteria.A <= testSettings.gradingCriteria.B ||
        testSettings.gradingCriteria.B <= testSettings.gradingCriteria.C) {
        showToast('Критерии оценивания должны быть в убывающем порядке', 'error');
        return;
    }

    // Save to localStorage
    localStorage.setItem('testSettings', JSON.stringify(testSettings));

    // Update export data
    updateExport();

    // Close modal and show confirmation
    bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
    showToast('Настройки сохранены', 'success');
}

function applySettings() {
    // Apply values to form
    document.getElementById('timeLimit').value = testSettings.timeLimit;
    document.getElementById('shuffleQuestions').checked = testSettings.shuffleQuestions;
    
    const showResultsRadio = document.getElementById(
        testSettings.showResults === 'immediately' ? 'showResultsImmediate' : 'showResultsEnd'
    );
    if (showResultsRadio) showResultsRadio.checked = true;

    document.getElementById('gradeA').value = testSettings.gradingCriteria.A;
    document.getElementById('gradeB').value = testSettings.gradingCriteria.B;
    document.getElementById('gradeC').value = testSettings.gradingCriteria.C;
    
    document.getElementById('showGrade').checked = testSettings.showGrade;
    document.getElementById('showCriteria').checked = testSettings.showCriteria;
}

// Add event listeners for grading criteria validation
['gradeA', 'gradeB', 'gradeC'].forEach(id => {
    document.getElementById(id).addEventListener('change', function() {
        const a = parseInt(document.getElementById('gradeA').value) || 90;
        const b = parseInt(document.getElementById('gradeB').value) || 75;
        const c = parseInt(document.getElementById('gradeC').value) || 60;

        if (a <= b || b <= c) {
            showToast('Критерии оценивания должны быть в убывающем порядке', 'error');
            this.value = testSettings.gradingCriteria[id.slice(-1)];
        }
    });
});

// Функция для экспорта HTML с поддержкой тем
function exportToHTML() {
    const testTitle = document.getElementById('test-title').value || 'Тест без названия';
    const testContent = document.getElementById('test-content').innerHTML;
    
    // Получаем текущую тему
    const currentTheme = getCurrentTheme();
    
    // Генерируем CSS переменные для темы
    const themeCSS = generateThemeCSS(currentTheme);

    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testTitle}</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <style>
        /* Theme Variables */
        :root {
            ${themeCSS}
        }

        /* Rest of your CSS */
        ${document.querySelector('link[href="create-test.css"]').sheet.cssRules
            .map(rule => rule.cssText)
            .join('\n')}
    </style>
</head>
<body class="test-page">
    <div class="container mt-4">
        <h1 class="test-title mb-4">${testTitle}</h1>
        <div class="test-content">
            ${testContent}
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Добавляем скрипт для работы с темой
        const currentTheme = ${JSON.stringify(currentTheme)};
        
        function applyTheme(theme) {
            Object.entries(theme.colors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(\`--\${key}-color\`, value);
            });
        }

        // Применяем тему при загрузке
        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(currentTheme);
        });
    </script>
</body>
</html>`;

    // Создаем Blob и скачиваем файл
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Функция для получения текущей темы
function getCurrentTheme() {
    const defaultTheme = {
        name: 'Классическая',
        colors: {
            primary: '#3a86ff',
            secondary: '#8338ec',
            accent: '#ff006e',
            text: '#2d3436',
            background: '#ffffff',
            'bg-light': '#f8f9fa'
        }
    };

    // Пытаемся получить сохраненную тему
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        try {
            return JSON.parse(savedTheme);
        } catch (e) {
            console.error('Ошибка при загрузке темы:', e);
        }
    }

    return defaultTheme;
}

// Функция для генерации CSS переменных темы
function generateThemeCSS(theme) {
    return Object.entries(theme.colors)
        .map(([key, value]) => `--${key}-color: ${value};`)
        .join('\n            ');
}

// Добавляем обработчик для кнопки экспорта
document.getElementById('downloadHtml').addEventListener('click', exportToHTML); 