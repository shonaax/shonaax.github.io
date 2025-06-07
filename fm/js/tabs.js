document.addEventListener('DOMContentLoaded', function() {
    // Get tab elements
    const addSongsTab = document.getElementById('add-songs-tab');
    const listenSongsTab = document.getElementById('listen-songs-tab');
    
    // Get section elements
    const addSongsSection = document.getElementById('add-songs-section');
    const listenSongsSection = document.getElementById('listen-songs-section');
    
    // Function to show a section and hide others
    function showSection(sectionToShow) {
        // Hide all sections
        [addSongsSection, listenSongsSection].forEach(section => {
            if (section) {
                section.classList.add('hidden');
                section.classList.remove('active');
            }
        });
        
        // Show the selected section
        if (sectionToShow) {
            sectionToShow.classList.remove('hidden');
            sectionToShow.classList.add('active');
        }
    }
    
    // Function to update active tab styling
    function updateActiveTab(activeTab) {
        // Remove active styling from all tabs
        [addSongsTab, listenSongsTab].forEach(tab => {
            if (tab) {
                tab.classList.remove('bg-gray-800/50', 'text-white');
                tab.classList.add('text-gray-300', 'hover:text-white');
            }
        });
        
        // Add active styling to selected tab
        if (activeTab) {
            activeTab.classList.remove('text-gray-300', 'hover:text-white');
            activeTab.classList.add('bg-gray-800/50', 'text-white');
        }
    }
    
    // Add click event listeners to tabs
    if (addSongsTab) {
        addSongsTab.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(addSongsSection);
            updateActiveTab(addSongsTab);
        });
    }
    
    if (listenSongsTab) {
        listenSongsTab.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(listenSongsSection);
            updateActiveTab(listenSongsTab);
        });
    }
    
    // Show Add Songs section by default
    showSection(addSongsSection);
    updateActiveTab(addSongsTab);
}); 