// Инициализация базы данных
let db;

const initDB = async () => {
    if (db) return db;
    try {
        if (!window.db) {
            window.db = new window.MusicDatabase();
        }
        db = window.db;
        await db.initPromise;
        return db;
    } catch (error) {
        console.error('Ошибка инициализации базы данных:', error);
        throw error;
    }
};

// Регистрация пользователя
const register = async (name, email, password) => {
    try {
        await initDB();

        const user = {
            name,
            email,
            password, // В реальном приложении пароль должен быть захеширован
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readwrite');
            const userStore = transaction.objectStore('users');

            // Проверка существования email
            const emailCheck = userStore.index('email').get(email);
            
            emailCheck.onsuccess = () => {
                if (emailCheck.result) {
                    reject(new Error('Пользователь с таким email уже существует'));
                    return;
                }

                const request = userStore.add(user);
                
                request.onsuccess = () => {
                    user.id = request.result;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    resolve(user);
                };
                
                request.onerror = () => reject(request.error);
            };

            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        throw error;
    }
};

// Вход пользователя
const login = async (email, password) => {
    try {
        await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            const request = userStore.index('email').get(email);

            request.onsuccess = () => {
                const user = request.result;
                if (!user) {
                    reject(new Error('Пользователь не найден'));
                    return;
                }

                if (user.password !== password) { // В реальном приложении сравнивать хеши
                    reject(new Error('Неверный пароль'));
                    return;
                }

                localStorage.setItem('currentUser', JSON.stringify(user));
                resolve(user);
            };

            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        throw error;
    }
};

// Проверка авторизации
const checkAuth = async () => {
    try {
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) return null;

        const user = JSON.parse(userJson);
        await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            const request = userStore.get(user.id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                localStorage.removeItem('currentUser');
                reject(request.error);
            };
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        localStorage.removeItem('currentUser');
        return null;
    }
};

// Выход из системы
const logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
};

// Обновление подписки пользователя
const updateSubscription = async (userId, plan) => {
    try {
        await initDB();

        const subscription = {
            userId,
            plan,
            startDate: new Date(),
            expiryDate: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
            status: 'active'
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['subscriptions'], 'readwrite');
            const subscriptionStore = transaction.objectStore('subscriptions');
            
            const request = subscriptionStore.put(subscription);
            
            request.onsuccess = () => resolve(subscription);
            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Ошибка при обновлении подписки:', error);
        throw error;
    }
};

// Проверка подписки пользователя
const checkSubscription = async (userId) => {
    try {
        await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['subscriptions'], 'readonly');
            const subscriptionStore = transaction.objectStore('subscriptions');
            const request = subscriptionStore.get(userId);

            request.onsuccess = () => {
                const subscription = request.result;
                if (!subscription) {
                    resolve(null);
                    return;
                }

                // Проверка срока действия подписки
                if (new Date(subscription.expiryDate) < new Date()) {
                    subscription.status = 'expired';
                }

                resolve(subscription);
            };

            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Ошибка при проверке подписки:', error);
        return null;
    }
}; 