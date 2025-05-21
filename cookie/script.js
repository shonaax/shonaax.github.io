// Игровые переменные
let gameData = {
    cookies: 0,
    cookiesPerClick: 1,
    cookiesPerSecond: 0,
    lastSave: Date.now(),
    upgrades: [
        {
            id: 'better-click',
            name: 'Улучшенный клик',
            description: 'Увеличивает количество печенек за клик',
            basePrice: 10,
            level: 0,
            maxLevel: 10,
            effect: 1,
            icon: 'https://cdn-icons-png.flaticon.com/512/2145/2145218.png',
            type: 'click'
        },
        {
            id: 'faster-production',
            name: 'Быстрое производство',
            description: 'Увеличивает количество печенек в секунду от всех построек',
            basePrice: 100,
            level: 0,
            maxLevel: 10,
            effect: 0.1,
            icon: 'https://cdn-icons-png.flaticon.com/512/2413/2413042.png',
            type: 'production'
        },
        {
            id: 'golden-cookie',
            name: 'Золотая печенька',
            description: 'Шанс получить х2 печенек за клик',
            basePrice: 50,
            level: 0,
            maxLevel: 10,
            effect: 0.05, // увеличение шанса на 5% за уровень
            icon: 'https://cdn-icons-png.flaticon.com/512/3732/3732171.png',
            type: 'chance'
        },
        {
            id: 'cursor-boost',
            name: 'Улучшение курсора',
            description: 'Увеличивает производство курсоров на 50%',
            basePrice: 200,
            level: 0,
            maxLevel: 10,
            effect: 0.5,
            icon: 'https://cdn-icons-png.flaticon.com/512/1536/1536032.png',
            type: 'building',
            target: 'cursor'
        },
        {
            id: 'grandma-boost',
            name: 'Супер-бабушка',
            description: 'Бабушки производят на 75% больше печенек',
            basePrice: 500,
            level: 0,
            maxLevel: 10, 
            effect: 0.75,
            icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991551.png',
            type: 'building',
            target: 'grandma'
        },
        {
            id: 'discount',
            name: 'Скидка',
            description: 'Снижает стоимость всех построек на 5%',
            basePrice: 1000,
            level: 0,
            maxLevel: 10,
            effect: 0.05,
            icon: 'https://cdn-icons-png.flaticon.com/512/3498/3498695.png',
            type: 'discount'
        }
    ],
    buildings: [
        {
            id: 'cursor',
            name: 'Курсор',
            description: 'Автоматически кликает по печеньке',
            basePrice: 15,
            count: 0,
            baseProduction: 0.1,
            icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828365.png'
        },
        {
            id: 'grandma',
            name: 'Бабушка',
            description: 'Печет печеньки по старинному рецепту',
            basePrice: 100,
            count: 0,
            baseProduction: 1,
            icon: 'https://cdn-icons-png.flaticon.com/512/4486/4486668.png'
        },
        {
            id: 'bakery',
            name: 'Пекарня',
            description: 'Производит много печенек',
            basePrice: 500,
            count: 0,
            baseProduction: 5,
            icon: 'https://cdn-icons-png.flaticon.com/512/992/992747.png'
        },
        {
            id: 'factory',
            name: 'Фабрика',
            description: 'Массовое производство печенек',
            basePrice: 3000,
            count: 0,
            baseProduction: 20,
            icon: 'https://cdn-icons-png.flaticon.com/512/2361/2361430.png'
        }
    ],
    goldenCookieChance: 0 // базовый шанс получения золотой печеньки
};

// DOM элементы
const cookieClicker = document.getElementById('cookie-clicker');
const cookieCountElement = document.getElementById('cookie-count');
const cookiesPerSecondElement = document.getElementById('cookies-per-second');
const cookiesPerClickElement = document.getElementById('cookies-per-click');
const upgradesList = document.getElementById('upgrades-list');
const shopItems = document.getElementById('shop-items');
const saveButton = document.getElementById('save-button');
const resetButton = document.getElementById('reset-button');
const notification = document.getElementById('notification');

// Инициализация игры
function initGame() {
    loadGame();
    renderUpgrades();
    renderShop();
    updateStats();
    
    // Запускаем таймер для автоматического производства
    setInterval(produceAutomatic, 1000);
    
    // Запускаем автосохранение
    setInterval(saveGame, 30000);
}

// Обработчик клика по печеньке
cookieClicker.addEventListener('click', (event) => {
    let cookiesEarned = gameData.cookiesPerClick;
    let isGolden = false;
    
    // Проверка на золотую печеньку
    if (Math.random() < gameData.goldenCookieChance) {
        cookiesEarned *= 2;
        isGolden = true;
        
        // Показываем золотое уведомление
        const goldenNotification = document.createElement('div');
        goldenNotification.textContent = 'Золотая печенька! x2 бонус!';
        goldenNotification.className = 'notification golden show';
        document.body.appendChild(goldenNotification);
        
        setTimeout(() => {
            document.body.removeChild(goldenNotification);
        }, 3000);
    }
    
    gameData.cookies += cookiesEarned;
    updateStats();
    
    // Анимация клика
    const clickEffect = document.createElement('div');
    clickEffect.classList.add('click-effect');
    if (isGolden) clickEffect.classList.add('golden');
    clickEffect.textContent = `+${cookiesEarned}`;
    clickEffect.style.position = 'absolute';
    clickEffect.style.left = `${event.clientX - 10}px`;
    clickEffect.style.top = `${event.clientY - 20}px`;
    document.body.appendChild(clickEffect);
    
    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        document.body.removeChild(clickEffect);
    }, 1000);
    
    // Анимация печеньки
    if (isGolden) {
        cookieClicker.classList.add('golden-bounce');
        setTimeout(() => {
            cookieClicker.classList.remove('golden-bounce');
        }, 300);
    } else {
        cookieClicker.style.animation = 'pop 0.2s ease-out';
        setTimeout(() => {
            cookieClicker.style.animation = '';
        }, 200);
    }
});

// Автоматическое производство
function produceAutomatic() {
    gameData.cookies += gameData.cookiesPerSecond;
    updateStats();
}

// Обновление статистики
function updateStats() {
    cookieCountElement.textContent = formatNumber(gameData.cookies);
    cookiesPerSecondElement.textContent = formatNumber(gameData.cookiesPerSecond);
    cookiesPerClickElement.textContent = formatNumber(gameData.cookiesPerClick);
    
    // Обновляем доступность улучшений и построек
    updateUpgradesAvailability();
    updateShopAvailability();
}

// Форматирование числа
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return Math.floor(num);
    }
}

// Расчет стоимости улучшения с учетом скидки
function calculateUpgradePrice(upgrade) {
    return Math.floor(upgrade.basePrice * Math.pow(1.5, upgrade.level));
}

// Расчет стоимости постройки с учетом скидки
function calculateBuildingPrice(building) {
    let price = Math.floor(building.basePrice * Math.pow(1.15, building.count));
    
    // Применяем скидку, если есть
    const discountUpgrade = gameData.upgrades.find(u => u.id === 'discount');
    if (discountUpgrade && discountUpgrade.level > 0) {
        const discountMultiplier = 1 - (discountUpgrade.level * discountUpgrade.effect);
        price = Math.floor(price * discountMultiplier);
    }
    
    return price;
}

// Расчет общего производства в секунду
function calculateCookiesPerSecond() {
    let cps = 0;
    
    // Базовое производство от построек с учетом улучшений для конкретных зданий
    for (const building of gameData.buildings) {
        let buildingProduction = building.baseProduction;
        
        // Проверяем, есть ли улучшения для этого здания
        const buildingUpgrades = gameData.upgrades.filter(u => 
            u.type === 'building' && u.target === building.id && u.level > 0
        );
        
        // Применяем множители от улучшений зданий
        for (const upgrade of buildingUpgrades) {
            buildingProduction *= (1 + upgrade.effect * upgrade.level);
        }
        
        cps += buildingProduction * building.count;
    }
    
    // Множитель от улучшения 'faster-production'
    const productionUpgrade = gameData.upgrades.find(u => u.id === 'faster-production');
    if (productionUpgrade && productionUpgrade.level > 0) {
        cps *= (1 + productionUpgrade.effect * productionUpgrade.level);
    }
    
    return cps;
}

// Покупка улучшения
function buyUpgrade(upgradeId) {
    const upgrade = gameData.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const price = calculateUpgradePrice(upgrade);
    
    if (gameData.cookies >= price && upgrade.level < upgrade.maxLevel) {
        gameData.cookies -= price;
        upgrade.level++;
        
        // Применяем эффект улучшения в зависимости от типа
        applyUpgradeEffect(upgrade);
        
        updateStats();
        renderUpgrades();
        
        showNotification(`Улучшение "${upgrade.name}" куплено!`);
    }
}

// Применение эффекта улучшения
function applyUpgradeEffect(upgrade) {
    switch(upgrade.type) {
        case 'click':
            gameData.cookiesPerClick += upgrade.effect;
            break;
        case 'chance':
            gameData.goldenCookieChance = upgrade.level * upgrade.effect;
            break;
        case 'production':
        case 'building':
        case 'discount':
            // Эти эффекты применяются при расчете CPS или цены
            gameData.cookiesPerSecond = calculateCookiesPerSecond();
            break;
        default:
            console.log(`Неизвестный тип улучшения: ${upgrade.type}`);
    }
}

// Покупка постройки
function buyBuilding(buildingId) {
    const building = gameData.buildings.find(b => b.id === buildingId);
    if (!building) return;
    
    const price = calculateBuildingPrice(building);
    
    if (gameData.cookies >= price) {
        gameData.cookies -= price;
        building.count++;
        
        // Обновляем производство в секунду
        gameData.cookiesPerSecond = calculateCookiesPerSecond();
        
        updateStats();
        renderShop();
        
        showNotification(`Постройка "${building.name}" куплена!`);
    }
}

// Отображение улучшений
function renderUpgrades() {
    upgradesList.innerHTML = '';
    
    for (const upgrade of gameData.upgrades) {
        const price = calculateUpgradePrice(upgrade);
        const isMaxed = upgrade.level >= upgrade.maxLevel;
        const canAfford = gameData.cookies >= price;
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade-item ${isMaxed ? 'disabled' : canAfford ? '' : 'disabled'}`;
        upgradeElement.setAttribute('data-id', upgrade.id);
        upgradeElement.setAttribute('data-type', upgrade.type);
        
        upgradeElement.innerHTML = `
            <div class="item-info">
                <img src="${upgrade.icon}" alt="${upgrade.name}" class="item-icon">
                <div>
                    <div class="item-name">${upgrade.name}</div>
                    <div class="item-description">${upgrade.description}</div>
                    <div class="item-level">Уровень: ${upgrade.level}/${upgrade.maxLevel}</div>
                </div>
            </div>
            <div class="${isMaxed ? 'item-maxed' : 'item-price'}">${isMaxed ? 'МАКС' : formatNumber(price)}</div>
        `;
        
        // Фиксим проблему с событиями клика!
        if (!isMaxed && canAfford) {
            upgradeElement.onclick = function() {
                buyUpgrade(upgrade.id);
            };
        }
        
        upgradesList.appendChild(upgradeElement);
    }
}

// Отображение магазина построек
function renderShop() {
    shopItems.innerHTML = '';
    
    for (const building of gameData.buildings) {
        const price = calculateBuildingPrice(building);
        const canAfford = gameData.cookies >= price;
        
        const shopItem = document.createElement('div');
        shopItem.className = `shop-item ${canAfford ? '' : 'disabled'}`;
        shopItem.setAttribute('data-id', building.id);
        
        shopItem.innerHTML = `
            <div class="item-info">
                <img src="${building.icon}" alt="${building.name}" class="item-icon">
                <div>
                    <div class="item-name">${building.name} (${building.count})</div>
                    <div class="item-description">${building.description}</div>
                    <div class="item-level">Производит ${formatNumber(building.baseProduction)} печенек/сек</div>
                </div>
            </div>
            <div class="item-price">${formatNumber(price)}</div>
        `;
        
        // Фиксим проблему с событиями клика!
        if (canAfford) {
            shopItem.onclick = function() {
                buyBuilding(building.id);
            };
        }
        
        shopItems.appendChild(shopItem);
    }
}

// Обновление доступности улучшений
function updateUpgradesAvailability() {
    const upgradeItems = document.querySelectorAll('.upgrade-item');
    
    upgradeItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const upgrade = gameData.upgrades.find(u => u.id === id);
        
        if (!upgrade) return;
        
        const price = calculateUpgradePrice(upgrade);
        const isMaxed = upgrade.level >= upgrade.maxLevel;
        const canAfford = gameData.cookies >= price;
        
        if (isMaxed) {
            item.classList.add('disabled');
            item.querySelector('[class^="item-price"]').className = 'item-maxed';
            item.querySelector('[class^="item-price"]').textContent = 'МАКС';
            item.onclick = null;
        } else {
            if (canAfford) {
                item.classList.remove('disabled');
                item.onclick = function() {
                    buyUpgrade(upgrade.id);
                };
            } else {
                item.classList.add('disabled');
                item.onclick = null;
            }
            item.querySelector('[class^="item-price"]').textContent = formatNumber(price);
        }
    });
}

// Обновление доступности построек
function updateShopAvailability() {
    const shopItems = document.querySelectorAll('.shop-item');
    
    shopItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const building = gameData.buildings.find(b => b.id === id);
        
        if (!building) return;
        
        const price = calculateBuildingPrice(building);
        const canAfford = gameData.cookies >= price;
        
        if (canAfford) {
            item.classList.remove('disabled');
            item.onclick = function() {
                buyBuilding(building.id);
            };
        } else {
            item.classList.add('disabled');
            item.onclick = null;
        }
        
        item.querySelector('.item-price').textContent = formatNumber(price);
    });
}

// Отображение уведомления
function showNotification(message, isGolden = false) {
    notification.textContent = message;
    notification.className = isGolden ? 'notification golden show' : 'notification show';
    
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.remove('golden');
    }, 3000);
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('cookieClickerData', JSON.stringify(gameData));
    gameData.lastSave = Date.now();
    showNotification('Игра сохранена!');
}

// Загрузка игры
function loadGame() {
    const savedData = localStorage.getItem('cookieClickerData');
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            
            // Обновляем данные, сохраняя структуру
            gameData.cookies = parsedData.cookies || 0;
            gameData.cookiesPerClick = parsedData.cookiesPerClick || 1;
            gameData.cookiesPerSecond = parsedData.cookiesPerSecond || 0;
            gameData.lastSave = parsedData.lastSave || Date.now();
            gameData.goldenCookieChance = parsedData.goldenCookieChance || 0;
            
            // Обновляем улучшения
            if (parsedData.upgrades) {
                for (const upgrade of gameData.upgrades) {
                    const savedUpgrade = parsedData.upgrades.find(u => u.id === upgrade.id);
                    if (savedUpgrade) {
                        upgrade.level = savedUpgrade.level || 0;
                    }
                }
            }
            
            // Обновляем постройки
            if (parsedData.buildings) {
                for (const building of gameData.buildings) {
                    const savedBuilding = parsedData.buildings.find(b => b.id === building.id);
                    if (savedBuilding) {
                        building.count = savedBuilding.count || 0;
                    }
                }
            }
            
            // Пересчитываем значения
            gameData.cookiesPerSecond = calculateCookiesPerSecond();
            
            showNotification('Игра загружена!');
            
        } catch (error) {
            console.error('Ошибка загрузки игры:', error);
            showNotification('Ошибка загрузки игры!');
        }
    }
}

// Сброс игры
function resetGame() {
    if (confirm('Вы уверены, что хотите сбросить игру? Весь прогресс будет потерян!')) {
        localStorage.removeItem('cookieClickerData');
        location.reload();
    }
}

// Обработчики кнопок
saveButton.addEventListener('click', saveGame);
resetButton.addEventListener('click', resetGame);

// Запуск игры при загрузке страницы
window.addEventListener('load', initGame); 