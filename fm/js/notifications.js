class NotificationManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        this.container.id = 'notification-container';
        document.body.appendChild(this.container);

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 1rem;
                border-radius: 0.5rem;
                color: white;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease-out;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 300px;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.success {
                border-left: 4px solid #10B981;
            }

            .notification.error {
                border-left: 4px solid #EF4444;
            }

            .notification.info {
                border-left: 4px solid #3B82F6;
            }

            .notification i {
                font-size: 1.25rem;
            }

            .notification.success i {
                color: #10B981;
            }

            .notification.error i {
                color: #EF4444;
            }

            .notification.info i {
                color: #3B82F6;
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}`;
        
        const text = document.createElement('span');
        text.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(text);
        this.container.appendChild(notification);
        
        // Trigger reflow to enable animation
        notification.offsetHeight;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
    window.notifications = new NotificationManager();
    // Override the old showNotification function
    window.showNotification = (message, type) => window.notifications.show(message, type);
}); 