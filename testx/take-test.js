// Современные функции для прохождения тестов
document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const TIMER_UPDATE_INTERVAL = 1000; // 1 second

    // DOM Elements
    const testKeyInput = document.getElementById('testKey');
    const startTestBtn = document.getElementById('startTest');
    const testContainer = document.getElementById('testContainer');
    const resultContainer = document.getElementById('resultContainer');
    const progressBar = document.getElementById('progressBar');
    const timerDisplay = document.getElementById('timer');

    // State
    let testData = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let timer = null;
    let timeLeft = 0;

    // Initialize features
    initializeAnimations();

    // Event listeners
    startTestBtn.addEventListener('click', startTest);
    testKeyInput.addEventListener('input', validateTestKey);
    
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
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        });
    }
    
    // Validate test key
    function validateTestKey() {
        const input = testKeyInput.value.trim();
        
        // Проверяем, является ли ввод JSON
        try {
            const jsonData = JSON.parse(input);
            startTestBtn.disabled = !isValidTestData(jsonData);
            return;
        } catch (e) {
            // Если не JSON, проверяем как ключ теста
            startTestBtn.disabled = !input;
        }
    }
    
    // Функция запуска теста
    async function startTest() {
        const input = testKeyInput.value.trim();
        console.log('Начало startTest. Исходный ввод:', input);
        
        if (!input) {
            console.log('Ошибка: пустой ввод');
            showToast('Введите ключ теста или JSON данные', 'error');
            return;
        }

        try {
            let testData;
            
            // Сначала проверяем, является ли ввод JSON
            try {
                console.log('Пробуем распарсить как JSON. Длина ввода:', input.length);
                console.log('Первые 100 символов ввода:', input.substring(0, 100));
                
                // Удаляем комментарии и лишние пробелы
                const cleanedInput = input.replace(/\/\/.*$/gm, '') // Удаляем однострочные комментарии
                                        .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
                                        .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
                                        .trim();
                
                console.log('Очищенный JSON для парсинга:', cleanedInput);
                testData = JSON.parse(cleanedInput);
                console.log('Успешно распарсили JSON. Структура:', {
                    hasTitle: !!testData.title,
                    questionsCount: testData.questions?.length,
                    firstQuestionType: testData.questions?.[0]?.type
                });
            } catch (jsonError) {
                // Если не JSON, пробуем декодировать как ключ теста
                console.log('Не удалось распарсить как JSON. Ошибка:', jsonError.message);
                console.log('Пробуем декодировать как ключ теста');
                
                const cleanKey = input.replace(/\s+/g, '');
                console.log('Очищенный ключ (первые 50 символов):', cleanKey.substring(0, 50));
                
                // Пробуем сначала простой base64
                try {
                    console.log('Пробуем декодировать как обычный base64');
                    const decodedBase64 = atob(cleanKey);
                    console.log('Успешно декодировали base64. Пробуем распарсить как JSON');
                    testData = JSON.parse(decodedBase64);
                    console.log('Успешно распарсили base64 как JSON');
                } catch (base64Error) {
                    console.log('Не удалось декодировать как base64:', base64Error.message);
                    console.log('Пробуем LZString декодирование');
                    
                    const decompressed = LZString.decompressFromBase64(cleanKey);
                    console.log('Результат LZString декодирования:', decompressed ? 'Получены данные' : 'null');
                    
                    if (!decompressed) {
                        console.log('LZString вернул null');
                        showToast('Неверный формат данных теста', 'error');
                        return;
                    }
                    
                    try {
                        console.log('Пробуем распарсить декодированные LZString данные как JSON');
                        testData = JSON.parse(decompressed);
                        console.log('Успешно распарсили декодированные данные:', {
                            hasTitle: !!testData.title,
                            questionsCount: testData.questions?.length,
                            firstQuestionType: testData.questions?.[0]?.type
                        });
                    } catch (error) {
                        console.error('Ошибка при парсинге декодированных данных:', error);
                        showToast('Ошибка в формате данных теста', 'error');
                        return;
                    }
                }
            }

            // Преобразуем формат value для single-choice вопросов
            if (testData.questions) {
                testData.questions = testData.questions.map(q => {
                    if (q.type === 'single-choice' && typeof q.value === 'number') {
                        // Преобразуем числовой индекс в массив boolean
                        const correctIndex = q.value;
                        q.correctAnswers = q.options.map((_, index) => index === correctIndex);
                    } else if (q.type === 'multiple-choice') {
                        q.correctAnswers = q.value;
                    } else if (q.type === 'text' || q.type === 'image') {
                        q.correctAnswers = q.value;
                    }
                    return q;
                });
            }

            // Проверяем структуру данных
            console.log('Проверяем структуру данных теста');
            if (!isValidTestData(testData)) {
                console.log('Данные теста не прошли валидацию');
                return; // isValidTestData сам покажет сообщение об ошибке
            }

            console.log('Данные теста прошли валидацию:', {
                title: testData.title,
                questionsCount: testData.questions.length,
                questionTypes: testData.questions.map(q => q.type)
            });

            // Преобразуем данные в нужный формат
            testData.questions = testData.questions.map(q => {
                if (q.type === 'single-choice' || q.type === 'multiple-choice') {
                    // Преобразуем options в объекты с флагом isCorrect
                    const options = q.options.map((text, index) => {
                        const isCorrect = Array.isArray(q.value) && q.value[index] === true;
                        return { text, isCorrect };
                    });
                    return { ...q, options };
                } else if (q.type === 'text' || q.type === 'image') {
                    // Для текстовых вопросов и вопросов с изображениями
                    q.correctAnswers = q.value;
                    delete q.value;
                }
                return q;
            });

            // Инициализация теста
            userAnswers = new Array(testData.questions.length).fill(null);
            currentQuestionIndex = 0;
            
            // Настройка таймера
            if (testData.settings?.timeLimit) {
                timeLeft = testData.settings.timeLimit * 60;
                startTimer();
            }

            // Анимация перехода
            await animateTransition(() => {
                document.querySelector('.test-key-container').style.display = 'none';
                testContainer.style.display = 'block';
                showQuestion(currentQuestionIndex);
                updateProgress();
            });

        } catch (error) {
            console.error('Ошибка при загрузке теста:', error);
            showToast('Ошибка при загрузке теста', 'error');
        }
    }

    // Функция показа вопроса
    function showQuestion(index) {
        const question = testData.questions[index];
        if (!question) {
            showToast('Ошибка при загрузке вопроса', 'error');
            return;
        }

        const questionElement = document.createElement('div');
        questionElement.className = 'question fade-in';
        
        // Формирование HTML вопроса
        let questionHTML = `
            <div class="question-header">
                <span class="question-number">Вопрос ${index + 1} из ${testData.questions.length}</span>
            </div>
            <div class="question-text">${question.question || 'Без вопроса'}</div>
        `;

        // Добавление изображения, если есть
        if (question.type === 'image' && question.imageUrl) {
            // Убедимся, что URL начинается с http:// или https://
            const imageUrl = question.imageUrl.startsWith('http') ? 
                question.imageUrl : 
                `https://${question.imageUrl}`;
                
            questionHTML += `
                <div class="question-image">
                    <img src="${imageUrl}" alt="Изображение к вопросу" 
                         loading="lazy" onload="this.style.opacity='1'"
                         onerror="this.src='placeholder.jpg'; this.onerror=null;">
                </div>
            `;
        }

        // Добавление поля для ответа в зависимости от типа
        switch(question.type) {
            case 'single-choice':
            case 'multiple-choice':
                questionHTML += createOptionsHTML(question, index);
                break;
            case 'text':
            case 'image':
                questionHTML += createTextInputHTML(index);
                break;
        }

        // Добавление навигации
        questionHTML += createNavigationHTML(index);

        questionElement.innerHTML = questionHTML;
        
        // Анимация смены вопроса
        animateQuestionChange(() => {
            testContainer.innerHTML = '';
            testContainer.appendChild(questionElement);
            initializeQuestionInteractions(questionElement, index);
        });
    }

    // Создание HTML для вариантов ответа
    function createOptionsHTML(question, index) {
        if (!question.options || !Array.isArray(question.options)) {
            return '<div class="error-message">Ошибка: варианты ответов не найдены</div>';
        }

        const type = question.type === 'single-choice' ? 'radio' : 'checkbox';
        const name = `question${index}`;
        
        return `
            <div class="options-container">
                ${question.options.map((option, optIndex) => `
                    <label class="option-label">
                        <input type="${type}" name="${name}" value="${optIndex}"
                               ${userAnswers[index]?.includes(optIndex) ? 'checked' : ''}>
                        <span class="option-text">${option.text || 'Пустой вариант'}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }

    // Создание HTML для текстового ввода
    function createTextInputHTML(index) {
        return `
            <div class="text-answer-container">
                <input type="text" class="form-control" 
                       placeholder="Введите ответ"
                       value="${userAnswers[index] || ''}"
                       onchange="saveTextAnswer(this, ${index})">
            </div>
        `;
    }

    // Создание HTML для навигации
    function createNavigationHTML(index) {
        return `
            <div class="question-navigation">
                ${index > 0 ? `
                    <button class="btn btn-outline-primary prev-question">
                        <i class="fas fa-arrow-left"></i> Назад
                    </button>
                ` : ''}
                ${index < testData.questions.length - 1 ? `
                    <button class="btn btn-primary next-question">
                        Далее <i class="fas fa-arrow-right"></i>
                    </button>
                ` : `
                    <button class="btn btn-success finish-test">
                        Завершить тест <i class="fas fa-check"></i>
                    </button>
                `}
            </div>
        `;
    }

    // Инициализация взаимодействия с вопросом
    function initializeQuestionInteractions(questionElement, index) {
        const prevBtn = questionElement.querySelector('.prev-question');
        const nextBtn = questionElement.querySelector('.next-question');
        const finishBtn = questionElement.querySelector('.finish-test');

        if (prevBtn) prevBtn.addEventListener('click', () => navigateQuestion('prev'));
        if (nextBtn) nextBtn.addEventListener('click', () => navigateQuestion('next'));
        if (finishBtn) finishBtn.addEventListener('click', finishTest);

        const question = testData.questions[index];
        if (question.type === 'single-choice' || question.type === 'multiple-choice') {
            const inputs = questionElement.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            inputs.forEach(input => {
                input.addEventListener('change', () => saveAnswer(index, input));
            });
        } else if (question.type === 'text' || question.type === 'image') {
            const input = questionElement.querySelector('input[type="text"]');
            input.addEventListener('input', () => saveAnswer(index, input));
        }
    }

    // Переход между вопросами
    function navigateQuestion(direction) {
        const newIndex = direction === 'next' ? 
            currentQuestionIndex + 1 : currentQuestionIndex - 1;

        if (newIndex >= 0 && newIndex < testData.questions.length) {
            currentQuestionIndex = newIndex;
            showQuestion(currentIndex);
            updateProgress();
        }
    }

    // Сохранение ответа
    function saveAnswer(index, input) {
        const question = testData.questions[index];
        
        if (question.type === 'single-choice') {
            userAnswers[index] = [parseInt(input.value)];
        } else if (question.type === 'multiple-choice') {
            userAnswers[index] = Array.from(
                input.closest('.options-container').querySelectorAll('input:checked')
            ).map(inp => parseInt(inp.value));
        } else if (question.type === 'text' || question.type === 'image') {
            userAnswers[index] = input.value.trim();
        }

        updateProgress();
    }

    // Функция сохранения текстового ответа
    function saveTextAnswer(input, index) {
        userAnswers[index] = input.value.trim();
        updateProgress();
    }

    // Обновление прогресса
    function updateProgress() {
        const answered = userAnswers.filter(answer => 
            answer !== null && 
            (Array.isArray(answer) ? answer.length > 0 : answer !== '')
        ).length;
        
        const progress = (answered / testData.questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    // Завершение теста
    function finishTest() {
        if (!confirm('Вы уверены, что хотите завершить тест?')) return;

        const results = calculateResults();
        testContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        showResults(results);
    }

    // Показать результаты
    function showResults(results) {
        console.log('=== Отображение результатов ===');
        console.log('Результаты:', results);
        
        const percentage = (results.correctAnswers / results.totalQuestions) * 100;

        resultContainer.innerHTML = `
            <div class="results-container">
                <div class="score-circle">
                    <div class="score-number">${Math.round(percentage)}%</div>
                </div>
                
                <div class="results-summary">
                    <div class="summary-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Правильных ответов: ${results.correctAnswers} из ${results.totalQuestions}</span>
                    </div>
                </div>

                <div class="results-details">
                    <h3>Детальный разбор</h3>
                    ${results.questionResults.map((result, index) => {
                        console.log(`\nФорматирование результата вопроса ${index + 1}:`);
                        const userAnswerText = formatAnswer(result.userAnswer, result.question);
                        const correctAnswerText = result.isCorrect ? '' : formatAnswer(result.correctAnswer, result.question);
                        console.log('Отформатированный ответ пользователя:', userAnswerText);
                        console.log('Отформатированный правильный ответ:', correctAnswerText);
                        
                        return `
                        <div class="answer-review ${result.isCorrect ? 'answer-correct' : 'answer-incorrect'}">
                            <div class="question-number">Вопрос ${index + 1}</div>
                                <div class="question-text">${result.question.question}</div>
                            <div class="answer-details">
                                <div class="user-answer">
                                        <strong>Ваш ответ:</strong> ${userAnswerText}
                                </div>
                                ${!result.isCorrect ? `
                                    <div class="correct-answer">
                                            <strong>Правильный ответ:</strong> ${correctAnswerText}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>

                <div class="results-actions">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Пройти другой тест
                    </button>
                </div>
            </div>
        `;
    }

    function formatAnswer(answer, question) {
        console.log('=== Форматирование ответа ===');
        console.log('Ответ для форматирования:', answer);
        console.log('Тип вопроса:', question.type);
        
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            console.log('Пустой ответ');
            return 'Нет ответа';
        }
        
        if (question.type === 'single-choice' || question.type === 'multiple-choice') {
            if (Array.isArray(answer)) {
                const formatted = answer.map(index => question.options[index].text).join(', ');
                console.log('Отформатированный ответ с выбором:', formatted);
                return formatted;
            }
        }
        
        if (question.type === 'text' || question.type === 'image') {
            console.log('Текстовый ответ:', answer.toString());
            return answer.toString();
        }
        
        console.log('Неизвестный формат ответа');
        return 'Нет ответа';
    }

    function compareTextAnswer(userAnswer, correctAnswers) {
        console.log('=== Сравнение текстовых ответов ===');
        console.log('Ответ пользователя:', userAnswer);
        console.log('Правильные ответы:', correctAnswers);
        
        if (!userAnswer || !correctAnswers) {
            console.log('Ответ пользователя или правильные ответы отсутствуют');
            return false;
        }
        
        // Нормализуем ответ пользователя
        const normalizedUserAnswer = userAnswer.toString().toLowerCase().trim();
        console.log('Нормализованный ответ пользователя:', normalizedUserAnswer);

        // Если correctAnswers строка, преобразуем в массив
        const correctAnswersArray = Array.isArray(correctAnswers) ? 
            correctAnswers : [correctAnswers];
        
        // Проверяем на совпадение с любым из правильных ответов
        const result = correctAnswersArray.some(answer => {
            const normalizedCorrectAnswer = answer.toString().toLowerCase().trim();
            console.log('Сравниваем с правильным ответом:', normalizedCorrectAnswer);
            return normalizedCorrectAnswer === normalizedUserAnswer;
        });
        
        console.log('Результат сравнения:', result);
        return result;
    }

    // Расчет результатов
    function calculateResults() {
        console.log('=== Расчет результатов ===');
        let correctAnswers = 0;
        const questionResults = [];

        testData.questions.forEach((question, index) => {
            console.log(`\nПроверка вопроса ${index + 1}:`, question.question);
            const userAnswer = userAnswers[index];
            console.log('Ответ пользователя:', userAnswer);
            
            let isCorrect = false;
            let correctAnswer = question.correctAnswers;

            switch(question.type) {
                case 'single-choice':
                case 'multiple-choice':
                    // Получаем индексы правильных ответов
                    correctAnswer = question.correctAnswers
                        .map((isCorrect, index) => isCorrect ? index : null)
                        .filter(index => index !== null);
                    console.log('Правильные варианты:', correctAnswer);
                    isCorrect = compareArrays(userAnswer || [], correctAnswer);
                    break;
                case 'text':
                case 'image':
                    isCorrect = compareTextAnswer(userAnswer, correctAnswer);
                    break;
            }

            console.log('Ответ верный?', isCorrect);

            if (isCorrect) correctAnswers++;

            questionResults.push({
                question: question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect
            });
        });

        return {
            correctAnswers,
            totalQuestions: testData.questions.length,
            questionResults
        };
    }

    function animateNumber(start, end, duration, callback) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = progress => 1 - Math.pow(1 - progress, 3);
            
            const currentValue = start + (end - start) * easeOut(progress);
            callback(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Initialize shortcuts
    document.addEventListener('keydown', e => {
        // Проверяем, что тест загружен и отображается
        if (testData && testContainer.style.display !== 'none') {
            switch(e.key) {
                case 'ArrowLeft':
                    if (currentQuestionIndex > 0) {
                        navigateQuestion('prev');
                    }
                    break;
                case 'ArrowRight':
                case 'Enter':
                    if (currentQuestionIndex < testData.questions.length - 1) {
                        navigateQuestion('next');
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    const currentQuestion = testData.questions[currentQuestionIndex];
                    if (currentQuestion && (currentQuestion.type === 'single-choice' || currentQuestion.type === 'multiple-choice')) {
                        const options = document.querySelectorAll('.option-label input');
                        const index = parseInt(e.key) - 1;
                        if (options[index]) {
                            options[index].click();
                        }
                    }
                    break;
            }
        }
    });

    // Проверка структуры данных теста
    function isValidTestData(data) {
        console.log('Проверка структуры данных теста:', data);
        
        if (!data) {
            showToast('Данные теста отсутствуют', 'error');
            return false;
        }

        // Проверяем наличие массива вопросов
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
            showToast('Тест не содержит вопросов', 'error');
            return false;
        }

        // Проверяем каждый вопрос
        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];
            console.log(`Проверка вопроса ${i + 1}:`, q);
            
            // Проверяем базовые поля
            if (!q.question || typeof q.question !== 'string') {
                showToast(`Ошибка в вопросе ${i + 1}: текст вопроса отсутствует`, 'error');
                return false;
            }

            // Проверяем тип вопроса
            if (!q.type || !['single-choice', 'multiple-choice', 'text', 'image'].includes(q.type)) {
                showToast(`Ошибка в вопросе ${i + 1}: неверный тип вопроса`, 'error');
                return false;
            }

            // Проверяем варианты ответов для вопросов с выбором
            if (q.type === 'single-choice' || q.type === 'multiple-choice') {
                if (!Array.isArray(q.options) || q.options.length === 0) {
                    showToast(`Ошибка в вопросе ${i + 1}: отсутствуют варианты ответов`, 'error');
                    return false;
                }

                // Проверяем формат ответа
                if (q.type === 'single-choice') {
                    // Для single-choice допускаем как числовой индекс, так и массив boolean
                    if (typeof q.value === 'number') {
                        if (q.value < 0 || q.value >= q.options.length) {
                            showToast(`Ошибка в вопросе ${i + 1}: индекс правильного ответа вне диапазона`, 'error');
                            return false;
                        }
                    } else if (Array.isArray(q.correctAnswers)) {
                        if (q.correctAnswers.length !== q.options.length) {
                            showToast(`Ошибка в вопросе ${i + 1}: неверный формат ответов`, 'error');
                            return false;
                        }
                    } else {
                        showToast(`Ошибка в вопросе ${i + 1}: отсутствует правильный ответ`, 'error');
                        return false;
                    }
                } else {
                    // Для multiple-choice требуем массив boolean
                    if (!Array.isArray(q.value) && !Array.isArray(q.correctAnswers)) {
                        showToast(`Ошибка в вопросе ${i + 1}: неверный формат ответов`, 'error');
                        return false;
                    }
                    const answers = q.correctAnswers || q.value;
                    if (answers.length !== q.options.length) {
                        showToast(`Ошибка в вопросе ${i + 1}: количество ответов не соответствует количеству вариантов`, 'error');
                        return false;
                    }
                }
            }

            // Проверяем текстовые и вопросы с изображениями
            if (q.type === 'text' || q.type === 'image') {
                if (!q.value && !q.correctAnswers) {
                    showToast(`Ошибка в вопросе ${i + 1}: отсутствует ответ`, 'error');
                    return false;
                }
                
                // Дополнительная проверка для вопросов с изображениями
                if (q.type === 'image' && !q.imageUrl) {
                    showToast(`Ошибка в вопросе ${i + 1}: отсутствует URL изображения`, 'error');
                    return false;
                }
            }
        }

        console.log('Проверка данных успешно завершена');
        return true;
    }

    // Функция для декодирования base64 в UTF-8 строку
    function b64_to_utf8(str) {
        try {
            return decodeURIComponent(atob(str).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (e) {
            console.error('Ошибка декодирования:', e);
            return null;
        }
    }

    async function decryptTestData(key) {
        try {
            // Decode base64 with UTF-8 support
            const decoded = b64_to_utf8(key);
            if (!decoded) {
                return null;
            }
            // Parse the decoded string
            const data = JSON.parse(decoded);
            return data;
        } catch (error) {
            console.error('Failed to decrypt test data:', error);
            return null;
        }
    }

    function compareArrays(arr1, arr2) {
        if (!arr1 || !arr2) return false;
        if (arr1.length !== arr2.length) return false;
        return arr1.every(item => arr2.includes(item)) && 
               arr2.every(item => arr1.includes(item));
    }

    // Initialize animations
    function initializeAnimations() {
        document.querySelectorAll('.fade-in').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        });
    }

    // Animate transition between sections
    async function animateTransition(callback) {
        const content = document.querySelector('.container');
        content.style.opacity = '0';
        content.style.transform = 'translateY(-20px)';
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        callback();
        
        requestAnimationFrame(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        });
    }

    // Animate question change
    function animateQuestionChange(callback) {
        const currentQuestion = testContainer.querySelector('.question');
        if (currentQuestion) {
            currentQuestion.style.opacity = '0';
            currentQuestion.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                callback();
                requestAnimationFrame(() => {
                    const newQuestion = testContainer.querySelector('.question');
                    newQuestion.style.opacity = '1';
                    newQuestion.style.transform = 'translateX(0)';
                });
            }, 300);
        } else {
            callback();
        }
    }

    // Добавляем функцию в глобальную область видимости
    window.saveTextAnswer = saveTextAnswer;
}); 