# FMusica - Modern Audio Player

FMusica is a modern, browser-based audio player that allows you to import and manage your music collection with lyrics support. Built with vanilla JavaScript and utilizing modern web technologies like IndexedDB for offline storage.

## Features

- 🎵 Import and play MP3, WAV, and OGG audio files
- 📝 Add and edit lyrics for your songs
- 💾 Offline storage using IndexedDB
- 🎨 Modern and responsive design
- 🌙 Dark mode support
- 📱 Mobile-friendly interface

## Getting Started

1. Clone this repository or download the files
2. Open `index.html` in a modern web browser
3. Click "Get Started" to go to the dashboard
4. Import your music files by clicking the upload area or dragging and dropping files

## File Naming Convention

For best results, name your audio files in the following format:
```
Artist Name - Song Title.mp3
```

Example: `Ed Sheeran - Shape of You.mp3`

## Using the Player

1. **Importing Music**
   - Click the upload area or drag and drop audio files
   - Files will be automatically processed and added to your library

2. **Playing Music**
   - Click the play button on any song in your library
   - Use the player controls to play/pause, skip tracks, or adjust progress

3. **Managing Lyrics**
   - Click the microphone icon next to any song to add/edit lyrics
   - Lyrics are saved automatically and stored offline

4. **Deleting Songs**
   - Click the trash icon next to any song to remove it from your library
   - This will also remove associated lyrics

## Browser Support

FMusica works best in modern browsers that support:
- IndexedDB
- Web Audio API
- ES6+ JavaScript
- CSS Grid and Flexbox

Recommended browsers:
- Chrome 60+
- Firefox 60+
- Safari 13+
- Edge 79+

## Technical Details

- Built with vanilla JavaScript (no frameworks)
- Uses IndexedDB for offline storage
- Styling with Tailwind CSS and Bootstrap
- Custom CSS animations and transitions
- Responsive design for all screen sizes

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 