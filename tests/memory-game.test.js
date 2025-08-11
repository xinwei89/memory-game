const MemoryGame = require('../script.js');

// Import test setup
require('./setup.js');

describe('MemoryGame', () => {
    let game;

    beforeEach(() => {
        // Reset DOM before each test
        document.body.innerHTML = `
            <div class="game-container">
                <div class="game-header">
                    <div class="game-controls">
                        <select id="grid-size" class="grid-selector">
                            <option value="2">2x2 (2 pairs)</option>
                            <option value="4">4x4 (8 pairs)</option>
                        </select>
                        <button id="start-btn" class="start-btn">Start Game</button>
                    </div>
                    <div class="game-stats" id="game-stats" style="display: none;">
                        <span id="moves">0</span>
                        <span id="timer">00:00</span>
                        <span id="pairs">0/2</span>
                    </div>
                    <button id="restart-btn" class="restart-btn" style="display: none;">Restart Game</button>
                </div>
                <div class="game-board" id="game-board"></div>
                <div class="game-message" id="game-message"></div>
            </div>
        `;
        
        // Reset mock timers
        jest.clearAllMocks();
        setMockTime(0);
        
        // Create new game instance
        game = new MemoryGame();
    });

    describe('Constructor', () => {
        test('initializes with default values', () => {
            expect(game.cards).toEqual([]);
            expect(game.flippedCards).toEqual([]);
            expect(game.matchedPairs).toBe(0);
            expect(game.moves).toBe(0);
            expect(game.startTime).toBeNull();
            expect(game.timerInterval).toBeNull();
            expect(game.isProcessing).toBe(false);
            expect(game.gridSize).toBe(2);
            expect(game.totalPairs).toBe(2);
            expect(game.gameStarted).toBe(false);
        });

        test('finds and stores DOM elements', () => {
            expect(game.board).toBe(document.getElementById('game-board'));
            expect(game.movesElement).toBe(document.getElementById('moves'));
            expect(game.timerElement).toBe(document.getElementById('timer'));
            expect(game.pairsElement).toBe(document.getElementById('pairs'));
            expect(game.messageElement).toBe(document.getElementById('game-message'));
            expect(game.restartBtn).toBe(document.getElementById('restart-btn'));
            expect(game.startBtn).toBe(document.getElementById('start-btn'));
            expect(game.gridSizeSelect).toBe(document.getElementById('grid-size'));
            expect(game.gameStats).toBe(document.getElementById('game-stats'));
        });
    });

    describe('startGame', () => {
        test('sets grid size from selector', () => {
            game.gridSizeSelect.value = '4';
            game.startGame();
            
            expect(game.gridSize).toBe(4);
            expect(game.totalPairs).toBe(8);
        });

        test('updates UI elements visibility', () => {
            game.startGame();
            
            expect(game.gameStats.style.display).toBe('flex');
            expect(game.restartBtn.style.display).toBe('inline-block');
            expect(game.startBtn.style.display).toBe('none');
            expect(game.gridSizeSelect.disabled).toBe(true);
            expect(game.gameStarted).toBe(true);
        });
    });

    describe('createCards', () => {
        test('creates correct number of card pairs', () => {
            game.gridSize = 2;
            game.totalPairs = 2;
            game.createCards();
            
            expect(game.cards).toHaveLength(4); // 2 pairs = 4 cards
            
            // Check that we have pairs
            const imageIds = game.cards.map(card => card.imageId);
            const uniqueIds = [...new Set(imageIds)];
            expect(uniqueIds).toHaveLength(2); // 2 unique image IDs
            
            // Each ID should appear exactly twice
            uniqueIds.forEach(id => {
                const count = imageIds.filter(imageId => imageId === id).length;
                expect(count).toBe(2);
            });
        });

        test('creates cards with proper structure', () => {
            game.gridSize = 2;
            game.totalPairs = 2;
            game.createCards();
            
            game.cards.forEach(card => {
                expect(card).toHaveProperty('id');
                expect(card).toHaveProperty('imageUrl');
                expect(card).toHaveProperty('imageId');
                expect(card).toHaveProperty('isFlipped');
                expect(card).toHaveProperty('isMatched');
                expect(card.isFlipped).toBe(false);
                expect(card.isMatched).toBe(false);
                expect(typeof card.imageUrl).toBe('string');
                expect(card.imageUrl).toContain('picsum.photos');
            });
        });

        test('creates different numbers of cards for different grid sizes', () => {
            // Test 4x4 grid
            game.gridSize = 4;
            game.totalPairs = 8;
            game.createCards();
            expect(game.cards).toHaveLength(16);
            
            // Test 6x6 grid
            game.gridSize = 6;
            game.totalPairs = 18;
            game.createCards();
            expect(game.cards).toHaveLength(36);
            
            // Test 8x8 grid
            game.gridSize = 8;
            game.totalPairs = 32;
            game.createCards();
            expect(game.cards).toHaveLength(64);
        });
    });

    describe('shuffleCards', () => {
        test('rearranges cards array', () => {
            game.gridSize = 4;
            game.totalPairs = 8;
            game.createCards();
            
            const originalOrder = [...game.cards];
            
            // Mock Math.random to ensure shuffling
            const originalRandom = Math.random;
            let randomCall = 0;
            Math.random = jest.fn(() => {
                randomCall++;
                return randomCall % 2 === 0 ? 0.3 : 0.7;
            });
            
            game.shuffleCards();
            
            // Restore Math.random
            Math.random = originalRandom;
            
            // Cards should still have same length and elements
            expect(game.cards).toHaveLength(originalOrder.length);
            
            // Should contain the same cards (by imageId)
            const originalImageIds = originalOrder.map(c => c.imageId).sort();
            const shuffledImageIds = game.cards.map(c => c.imageId).sort();
            expect(shuffledImageIds).toEqual(originalImageIds);
        });
    });

    describe('resetStats', () => {
        test('resets all game statistics', () => {
            // Set some values
            game.moves = 10;
            game.matchedPairs = 5;
            game.flippedCards = [{ card: {}, element: {} }];
            game.startTime = 1000;
            game.isProcessing = true;
            game.timerInterval = 'mock-interval';
            
            game.resetStats();
            
            expect(game.moves).toBe(0);
            expect(game.matchedPairs).toBe(0);
            expect(game.flippedCards).toEqual([]);
            expect(game.startTime).toBeNull();
            expect(game.isProcessing).toBe(false);
            expect(game.movesElement.textContent).toBe('0');
            expect(game.timerElement.textContent).toBe('00:00');
            expect(game.messageElement.textContent).toBe('');
            expect(clearInterval).toHaveBeenCalledWith('mock-interval');
        });
    });

    describe('flipCard', () => {
        test('flips card and adds to flipped cards array', () => {
            const mockElement = document.createElement('div');
            const mockCard = { isFlipped: false, imageId: 1 };
            
            game.flipCard(mockElement, mockCard);
            
            expect(mockCard.isFlipped).toBe(true);
            expect(mockElement.classList.contains('flipped')).toBe(true);
            expect(game.flippedCards).toHaveLength(1);
            expect(game.flippedCards[0].element).toBe(mockElement);
            expect(game.flippedCards[0].card).toBe(mockCard);
        });
    });

    describe('checkMatch', () => {
        test('handles matching cards correctly', () => {
            const element1 = document.createElement('div');
            const element2 = document.createElement('div');
            const card1 = { imageId: 1, isFlipped: true, isMatched: false };
            const card2 = { imageId: 1, isFlipped: true, isMatched: false };
            
            game.flippedCards = [
                { element: element1, card: card1 },
                { element: element2, card: card2 }
            ];
            game.totalPairs = 2;
            
            game.checkMatch();
            
            expect(game.isProcessing).toBe(true);
            
            // Trigger the 500ms timeout for matching cards
            triggerTimeout(500);
            
            expect(card1.isMatched).toBe(true);
            expect(card2.isMatched).toBe(true);
            expect(card1.isFlipped).toBe(false);
            expect(card2.isFlipped).toBe(false);
            expect(game.matchedPairs).toBe(1);
            expect(game.flippedCards).toHaveLength(0);
            expect(game.isProcessing).toBe(false);
            expect(element1.classList.contains('matched')).toBe(true);
            expect(element2.classList.contains('matched')).toBe(true);
        });

        test('handles non-matching cards correctly', () => {
            const element1 = document.createElement('div');
            const element2 = document.createElement('div');
            const card1 = { imageId: 1, isFlipped: true, isMatched: false };
            const card2 = { imageId: 2, isFlipped: true, isMatched: false };
            
            // Add flipped class to elements initially
            element1.classList.add('flipped');
            element2.classList.add('flipped');
            
            game.flippedCards = [
                { element: element1, card: card1 },
                { element: element2, card: card2 }
            ];
            
            game.checkMatch();
            
            expect(game.isProcessing).toBe(true);
            
            // Trigger the 1000ms timeout for non-matching cards
            triggerTimeout(1000);
            
            expect(card1.isFlipped).toBe(false);
            expect(card2.isFlipped).toBe(false);
            expect(card1.isMatched).toBe(false);
            expect(card2.isMatched).toBe(false);
            expect(game.matchedPairs).toBe(0);
            expect(game.flippedCards).toHaveLength(0);
            expect(game.isProcessing).toBe(false);
            expect(element1.classList.contains('flipped')).toBe(false);
            expect(element2.classList.contains('flipped')).toBe(false);
        });
    });

    describe('startTimer', () => {
        test('initializes timer and sets interval', () => {
            setMockTime(1000);
            
            game.startTimer();
            
            expect(game.startTime).toBe(1000);
            expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
        });

        test('updates timer display correctly', () => {
            setMockTime(1000);
            game.startTimer();
            
            // Advance time by 65 seconds
            advanceMockTime(65000);
            
            // Get the interval callback and call it
            const intervalCallback = setInterval.mock.calls[0][0];
            intervalCallback();
            
            expect(game.timerElement.textContent).toBe('01:05');
        });
    });

    describe('gameWon', () => {
        test('displays win message and clears timer', () => {
            game.timerInterval = 'mock-interval';
            game.moves = 15;
            game.timerElement.textContent = '02:30';
            
            game.gameWon();
            
            expect(clearInterval).toHaveBeenCalledWith('mock-interval');
            expect(game.messageElement.textContent).toContain('Congratulations!');
            expect(game.messageElement.textContent).toContain('15 moves');
            expect(game.messageElement.textContent).toContain('02:30');
            expect(game.messageElement.classList.contains('celebration-message')).toBe(true);
        });
    });

    describe('restart', () => {
        test('resets game to initial state', () => {
            // Set up a game in progress
            game.gameStarted = true;
            game.gameStats.style.display = 'flex';
            game.restartBtn.style.display = 'inline-block';
            game.startBtn.style.display = 'none';
            game.gridSizeSelect.disabled = true;
            game.board.innerHTML = '<div>some cards</div>';
            game.messageElement.textContent = 'Some message';
            
            game.restart();
            
            expect(game.gameStarted).toBe(false);
            expect(game.gameStats.style.display).toBe('none');
            expect(game.restartBtn.style.display).toBe('none');
            expect(game.startBtn.style.display).toBe('inline-block');
            expect(game.gridSizeSelect.disabled).toBe(false);
            expect(game.board.innerHTML).toBe('');
            expect(game.messageElement.textContent).toBe('');
        });
    });

    describe('Game Flow Integration', () => {
        test('complete game flow for 2x2 grid', () => {
            // Start game
            game.gridSizeSelect.value = '2';
            game.startGame();
            
            expect(game.gridSize).toBe(2);
            expect(game.totalPairs).toBe(2);
            expect(game.cards).toHaveLength(4);
            
            // Simulate finding a match
            const card1 = game.cards.find(card => card.imageId === 1);
            const card2 = game.cards.find(card => card.imageId === 1 && card.id !== card1.id);
            
            expect(card1).toBeDefined();
            expect(card2).toBeDefined();
            expect(card1.imageId).toBe(card2.imageId);
            
            // Mock card elements
            const element1 = document.createElement('div');
            const element2 = document.createElement('div');
            
            // First card flip
            game.flipCard(element1, card1);
            expect(game.flippedCards).toHaveLength(1);
            
            // Second card flip (should trigger match check)
            game.flippedCards.push({ element: element2, card: card2 });
            game.checkMatch();
            
            // Should be processing and then mark as matched
            expect(game.isProcessing).toBe(true);
        });

        test('winning the game with all pairs matched', () => {
            game.gridSize = 2;
            game.totalPairs = 2;
            game.matchedPairs = 1; // One pair already matched
            game.timerInterval = 'mock-interval';
            game.moves = 8;
            game.timerElement.textContent = '01:30';
            
            // Create mock elements for the last pair
            const element1 = document.createElement('div');
            const element2 = document.createElement('div');
            const card1 = { imageId: 2, isFlipped: true, isMatched: false };
            const card2 = { imageId: 2, isFlipped: true, isMatched: false };
            
            game.flippedCards = [
                { element: element1, card: card1 },
                { element: element2, card: card2 }
            ];
            
            game.checkMatch();
            
            // Trigger the match timeout
            triggerTimeout(500);
            
            // Should trigger game won
            expect(game.matchedPairs).toBe(2);
            expect(clearInterval).toHaveBeenCalledWith('mock-interval');
            expect(game.messageElement.textContent).toContain('Congratulations!');
        });

        test('handles card click events properly', () => {
            game.startGame();
            
            // Mock the board with cards
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = '0';
            game.board.appendChild(cardElement);
            
            // Mock click event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            Object.defineProperty(clickEvent, 'target', {
                value: cardElement,
                enumerable: true
            });
            
            // Reset startTime to trigger timer
            game.startTime = null;
            
            // Simulate handleCardClick would be called
            game.handleCardClick(cardElement);
            
            expect(game.startTime).toBe(0); // Should start timer
            expect(setInterval).toHaveBeenCalled();
        });

        test('prevents clicking flipped or matched cards', () => {
            game.cards = [
                { id: 1, imageId: 1, isFlipped: true, isMatched: false },
                { id: 2, imageId: 1, isFlipped: false, isMatched: true }
            ];
            
            const flippedElement = document.createElement('div');
            flippedElement.dataset.index = '0';
            
            const matchedElement = document.createElement('div');
            matchedElement.dataset.index = '1';
            
            const initialFlippedLength = game.flippedCards.length;
            
            // Try to click flipped card
            game.handleCardClick(flippedElement);
            expect(game.flippedCards).toHaveLength(initialFlippedLength);
            
            // Try to click matched card
            game.handleCardClick(matchedElement);
            expect(game.flippedCards).toHaveLength(initialFlippedLength);
        });

        test('prevents interaction when processing', () => {
            game.isProcessing = true;
            game.cards = [{ id: 1, imageId: 1, isFlipped: false, isMatched: false }];
            
            const cardElement = document.createElement('div');
            cardElement.dataset.index = '0';
            
            const initialFlippedLength = game.flippedCards.length;
            
            game.handleCardClick(cardElement);
            
            expect(game.flippedCards).toHaveLength(initialFlippedLength);
        });
    });
});