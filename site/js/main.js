document.addEventListener('DOMContentLoaded', function() {
    // Управление фиксированным хедером при скролле
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Мобильное меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navigation = document.querySelector('.navigation');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navigation.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Плавный скролл к секциям
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Закрыть мобильное меню после клика
                if (navigation.classList.contains('active')) {
                    navigation.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    });

    // Переключение табов с тарифами
    const pricingTabs = document.querySelectorAll('.pricing-tab');
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    if (pricingTabs.length > 0) {
        pricingTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Активация таба
                pricingTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Период тарифа
                const period = tab.getAttribute('data-period');
                
                // Обновление цен в карточках
                updatePrices(period);
            });
        });
    }
    
    // Функция обновления цен в зависимости от периода
    function updatePrices(period) {
        const priceData = {
            'month': [
                { price: '1200 ₽', period: '/ месяц' },
                { price: '2500 ₽', period: '/ месяц' },
                { price: '4000 ₽', period: '/ месяц' }
            ],
            'quarter': [
                { price: '3000 ₽', period: '/ 3 месяца' },
                { price: '6500 ₽', period: '/ 3 месяца' },
                { price: '10000 ₽', period: '/ 3 месяца' }
            ],
            'year': [
                { price: '10000 ₽', period: '/ год' },
                { price: '22000 ₽', period: '/ год' },
                { price: '36000 ₽', period: '/ год' }
            ]
        };
        
        const prices = priceData[period];
        
        pricingCards.forEach((card, index) => {
            const priceElement = card.querySelector('.price');
            const periodElement = card.querySelector('.period');
            
            if (priceElement && periodElement && prices[index]) {
                // Анимация обновления цены
                fadeAnimation(priceElement, () => {
                    priceElement.textContent = prices[index].price;
                });
                
                fadeAnimation(periodElement, () => {
                    periodElement.textContent = prices[index].period;
                });
            }
        });
    }
    
    // Анимация для обновления элементов с затуханием
    function fadeAnimation(element, callback) {
        element.style.opacity = '0';
        
        setTimeout(() => {
            callback();
            element.style.opacity = '1';
        }, 200);
    }

    // FAQ аккордеон
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Закрыть все активные элементы
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Если элемент не был активен, открыть его
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Параллакс эффект для фоновых элементов
    document.addEventListener('mousemove', function(e) {
        const circles = document.querySelectorAll('.gradient-circle');
        
        circles.forEach((circle, index) => {
            const speed = (index + 1) * 0.03;
            const x = (window.innerWidth - e.pageX * speed) / 100;
            const y = (window.innerHeight - e.pageY * speed) / 100;
            
            circle.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });

    // Анимация появления элементов при прокрутке
    const animateElements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card, .faq-item');
    
    // Функция проверки видимости элемента в области видимости
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
        );
    }
    
    // Первоначальная проверка элементов
    checkVisibility();
    
    // Проверка при прокрутке
    window.addEventListener('scroll', checkVisibility);
    
    function checkVisibility() {
        animateElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('animate');
            }
        });
    }

    // Добавление класса анимации к картам при загрузке страницы
    document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate');
        }, 100 * index);
    });

    // Подписка на новости (предотвращение отправки формы)
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (emailInput.value.trim() !== '') {
                // Показать сообщение об успешной подписке
                showNotification('Вы успешно подписались на новости!', 'success');
                emailInput.value = '';
            }
        });
    }

    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        // Создание элемента уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Добавление на страницу
        document.body.appendChild(notification);
        
        // Появление уведомления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Закрытие уведомления по клику на крестик
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Добавление стилей для уведомлений
    addNotificationStyles();
    
    function addNotificationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 350px;
                transform: translateY(100px);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            
            .notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .notification-content {
                background: var(--darker-color);
                color: var(--light-color);
                border-radius: var(--border-radius);
                padding: 15px 20px;
                box-shadow: var(--box-shadow);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-left: 4px solid var(--primary-color);
            }
            
            .notification.success .notification-content {
                border-left-color: #2ecc71;
            }
            
            .notification.error .notification-content {
                border-left-color: #e74c3c;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--gray-color);
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
                padding: 0;
                line-height: 1;
            }
            
            .notification p {
                margin: 0;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Добавление CSS для анимаций
    addAnimationStyles();
    
    function addAnimationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .feature-card, 
            .pricing-card, 
            .testimonial-card,
            .faq-item {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            
            .feature-card.animate, 
            .pricing-card.animate, 
            .testimonial-card.animate,
            .faq-item.animate {
                opacity: 1;
                transform: translateY(0);
            }
            
            .pricing-price .price,
            .pricing-price .period {
                transition: opacity 0.2s ease;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Имитация предзагрузки сайта
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">NEVERLOSE</div>
            <div class="loader-spinner"></div>
        </div>
    `;
    document.body.appendChild(loader);
    
    // Стили для прелоадера
    const loaderStyles = document.createElement('style');
    loaderStyles.textContent = `
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--darker-color);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        
        .loader-content {
            text-align: center;
        }
        
        .loader-logo {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 20px;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        
        .loader-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto;
            border: 3px solid rgba(0, 200, 255, 0.2);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(loaderStyles);
    
    // Скрытие прелоадера после загрузки страницы
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            
            // Удаление прелоадера со страницы после завершения анимации
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000);
    });
}); 