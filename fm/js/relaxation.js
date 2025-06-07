// Relaxation mode features
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const relaxationBtn = document.querySelector('a[href="#"][title="Relaxation"]');
    const meditationTimer = document.getElementById('meditation-timer');
    const startMeditationBtn = document.getElementById('start-meditation');
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');

    // Initialize meditation timer
    let meditationInterval;
    
    if (startMeditationBtn) {
        startMeditationBtn.addEventListener('click', () => {
            const duration = document.getElementById('meditation-duration').value * 60; // Convert to seconds
            let timeLeft = duration;

            // Clear any existing interval
            clearInterval(meditationInterval);

            // Start new timer
            startMeditationBtn.disabled = true;
            meditationInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                meditationTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                if (timeLeft <= 0) {
                    clearInterval(meditationInterval);
                    startMeditationBtn.disabled = false;
                    alert('Meditation session completed!');
                }
            }, 1000);
        });
    }

    // Breathing exercise
    let breathingState = 'inhale';
    let isBreathingActive = false;

    if (breathingCircle) {
        breathingCircle.addEventListener('click', () => {
            if (!isBreathingActive) {
                isBreathingActive = true;
                startBreathingExercise();
            } else {
                isBreathingActive = false;
                stopBreathingExercise();
            }
        });
    }

    function startBreathingExercise() {
        breathingCircle.classList.add('animate-breathing');
        updateBreathingText();
    }

    function stopBreathingExercise() {
        breathingCircle.classList.remove('animate-breathing');
        breathingText.textContent = 'Click to start';
        breathingState = 'inhale';
    }

    function updateBreathingText() {
        if (!isBreathingActive) return;

        if (breathingState === 'inhale') {
            breathingText.textContent = 'Inhale...';
            setTimeout(() => {
                if (isBreathingActive) {
                    breathingState = 'hold';
                    updateBreathingText();
                }
            }, 4000);
        } else if (breathingState === 'hold') {
            breathingText.textContent = 'Hold...';
            setTimeout(() => {
                if (isBreathingActive) {
                    breathingState = 'exhale';
                    updateBreathingText();
                }
            }, 4000);
        } else {
            breathingText.textContent = 'Exhale...';
            setTimeout(() => {
                if (isBreathingActive) {
                    breathingState = 'inhale';
                    updateBreathingText();
                }
            }, 4000);
        }
    }

    // Visual effects
    const visualEffectBtns = document.querySelectorAll('.visual-effect-btn');
    const visualEffects = document.querySelectorAll('.visual-effect');

    visualEffectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetEffect = btn.getAttribute('data-effect');
            
            // Update active state of buttons
            visualEffectBtns.forEach(b => b.classList.remove('bg-primary', 'text-white'));
            btn.classList.add('bg-primary', 'text-white');

            // Show/hide effects
            visualEffects.forEach(effect => {
                if (effect.getAttribute('data-effect') === targetEffect) {
                    effect.classList.remove('hidden');
                } else {
                    effect.classList.add('hidden');
                }
            });
        });
    });
});