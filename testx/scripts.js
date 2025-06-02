document.addEventListener('DOMContentLoaded', function() {
    const words = ['создавать', 'творить', 'вдохновляться'];
    const changingWord = document.getElementById('changing-word');
    let currentIndex = 0;

    function changeWord() {
        currentIndex = (currentIndex + 1) % words.length;
        changingWord.textContent = words[currentIndex];
    }

    setInterval(changeWord, 2000);
}); 