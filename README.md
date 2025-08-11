# Memory Game

A fun and interactive memory game built with vanilla JavaScript, HTML, and CSS.

## 🎮 Play the Game

**Live Demo:** [Play Memory Game](https://xinwei89.github.io/memory-game/)

## 🎯 Features

- Multiple grid sizes (2x2, 4x4, 6x6, 8x8)
- Beautiful random images from Picsum
- Move counter and timer
- Responsive design
- Smooth card flip animations
- Fireworks celebration when you win!

## 🚀 How to Play

1. Choose your preferred grid size
2. Click "Start Game" to begin
3. Click on cards to flip them and find matching pairs
4. Match all pairs to win!
5. Try to complete the game in the fewest moves and shortest time

## 🛠 Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Picsum Photos API for random images

## 🚀 Deployment

This project is deployed using GitHub Pages. To deploy your own version:

1. Fork this repository
2. Go to your repository settings
3. Navigate to "Pages" section
4. Set source to "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Your game will be available at `https://yourusername.github.io/memory-game/`

## 🏗 Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. No build process required - it's vanilla JavaScript!

## 📱 Responsive Design

The game works on desktop, tablet, and mobile devices.

## 🔄 Updates

To update the game, simply push changes to the main branch and GitHub Pages will automatically redeploy.

## 🧪 Testing

This project includes comprehensive unit tests to ensure game functionality works correctly.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs tests when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite covers:
- Game initialization and setup
- Card creation and shuffling algorithms
- Game state management
- Match checking logic
- Timer functionality
- Game completion scenarios
- User interaction handling
- Edge cases and error conditions

Current test coverage: 80%+ statement coverage, 50%+ branch coverage

### Test Structure

- `tests/setup.js` - Test environment setup and mocks for DOM and timers
- `tests/memory-game.test.js` - Comprehensive test suite for the MemoryGame class

Tests are written using Jest and run in a jsdom environment to simulate browser behavior.
