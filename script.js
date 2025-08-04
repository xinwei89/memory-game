class MemoryGame {
    constructor() {
        this.board = document.getElementById('game-board');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.pairsElement = document.getElementById('pairs');
        this.messageElement = document.getElementById('game-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.startBtn = document.getElementById('start-btn');
        this.gridSizeSelect = document.getElementById('grid-size');
        this.gameStats = document.getElementById('game-stats');
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isProcessing = false;
        this.gridSize = 4;
        this.totalPairs = 8;
        this.gameStarted = false;
        
        this.bindInitialEvents();
    }
    
    bindInitialEvents() {
        this.startBtn.addEventListener('click', () => {
            this.startGame();
        });
        
        this.restartBtn.addEventListener('click', () => {
            this.restart();
        });
    }
    
    startGame() {
        this.gridSize = parseInt(this.gridSizeSelect.value);
        this.totalPairs = (this.gridSize * this.gridSize) / 2;
        this.gameStarted = true;
        
        // Show game elements and hide start controls
        this.gameStats.style.display = 'flex';
        this.restartBtn.style.display = 'inline-block';
        this.startBtn.style.display = 'none';
        this.gridSizeSelect.disabled = true;
        
        this.init();
    }
    
    init() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.bindEvents();
        this.resetStats();
    }
    
    createCards() {
        this.cards = [];
        // Use specific image IDs from Picsum for better reliability
        const imageIds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320];
        
        // Create pairs of images based on grid size
        for (let i = 0; i < this.totalPairs; i++) {
            const imageId = imageIds[i % imageIds.length];
            const imageUrl = `https://picsum.photos/id/${imageId}/100/100`;
            this.cards.push({ id: Math.random(), imageUrl: imageUrl, imageId: i + 1, isFlipped: false, isMatched: false });
            this.cards.push({ id: Math.random(), imageUrl: imageUrl, imageId: i + 1, isFlipped: false, isMatched: false });
        }
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    renderCards() {
        this.board.innerHTML = '';
        this.board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.board.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-face card-back';
            cardBack.textContent = '?';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-face card-front';
            
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.alt = `Card ${card.imageId}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            
            // Add error handling for failed image loads
            img.onerror = () => {
                // Create a colorful fallback div if image fails to load
                const fallback = document.createElement('div');
                fallback.style.width = '100%';
                fallback.style.height = '100%';
                fallback.style.borderRadius = '8px';
                fallback.style.display = 'flex';
                fallback.style.alignItems = 'center';
                fallback.style.justifyContent = 'center';
                fallback.style.fontSize = '24px';
                fallback.style.fontWeight = 'bold';
                fallback.style.color = 'white';
                
                // Generate a consistent color based on the image ID
                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
                fallback.style.backgroundColor = colors[card.imageId % colors.length];
                fallback.textContent = card.imageId;
                
                cardFront.removeChild(img);
                cardFront.appendChild(fallback);
            };
            
            // Add loading placeholder
            img.onload = () => {
                img.style.opacity = '1';
            };
            
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            cardFront.appendChild(img);
            
            cardElement.appendChild(cardBack);
            cardElement.appendChild(cardFront);
            
            this.board.appendChild(cardElement);
        });
    }
    
    bindEvents() {
        this.board.addEventListener('click', (e) => {
            if (e.target.classList.contains('card') || e.target.parentElement.classList.contains('card')) {
                const card = e.target.classList.contains('card') ? e.target : e.target.parentElement;
                this.handleCardClick(card);
            }
        });
    }
    
    handleCardClick(cardElement) {
        if (this.isProcessing) return;
        
        const index = parseInt(cardElement.dataset.index);
        const card = this.cards[index];
        
        if (card.isFlipped || card.isMatched) return;
        
        this.flipCard(cardElement, card);
        
        if (!this.startTime) {
            this.startTimer();
        }
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesElement.textContent = this.moves;
            this.checkMatch();
        }
    }
    
    flipCard(cardElement, card) {
        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push({ element: cardElement, card });
    }
    
    checkMatch() {
        this.isProcessing = true;
        
        const [first, second] = this.flippedCards;
        
        if (first.card.imageId === second.card.imageId) {
            // Match found - keep images showing permanently
            setTimeout(() => {
                first.element.classList.remove('flipped');
                first.element.classList.add('matched');
                second.element.classList.remove('flipped');
                second.element.classList.add('matched');
                first.card.isMatched = true;
                second.card.isMatched = true;
                first.card.isFlipped = false;
                second.card.isFlipped = false;
                
                this.matchedPairs++;
                this.pairsElement.textContent = `${this.matchedPairs}/${this.totalPairs}`;
                
                this.flippedCards = [];
                this.isProcessing = false;
                
                if (this.matchedPairs === this.totalPairs) {
                    this.gameWon();
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                first.element.classList.remove('flipped');
                second.element.classList.remove('flipped');
                first.card.isFlipped = false;
                second.card.isFlipped = false;
                
                this.flippedCards = [];
                this.isProcessing = false;
            }, 1000);
        }
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    gameWon() {
        clearInterval(this.timerInterval);
        const finalTime = this.timerElement.textContent;
        this.messageElement.textContent = `🎉 Congratulations! You won in ${this.moves} moves and ${finalTime}!`;
        this.messageElement.classList.add('celebration-message');
        
        // Trigger fireworks animation
        this.createFireworks();
    }
    
    createFireworks() {
        // Create fireworks container if it doesn't exist
        let fireworksContainer = document.querySelector('.fireworks-container');
        if (!fireworksContainer) {
            fireworksContainer = document.createElement('div');
            fireworksContainer.className = 'fireworks-container';
            document.body.appendChild(fireworksContainer);
        }
        
        // Clear any existing fireworks
        fireworksContainer.innerHTML = '';
        
        // Create multiple fireworks at random positions
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = `firework firework-${i + 1}`;
                
                // Random position
                const x = Math.random() * (window.innerWidth - 100) + 50;
                const y = Math.random() * (window.innerHeight - 200) + 100;
                
                firework.style.left = x + 'px';
                firework.style.top = y + 'px';
                
                fireworksContainer.appendChild(firework);
                
                // Remove firework after animation
                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 2000);
            }, i * 200);
        }
        
        // Remove fireworks container after all animations
        setTimeout(() => {
            if (fireworksContainer && fireworksContainer.parentNode) {
                fireworksContainer.parentNode.removeChild(fireworksContainer);
            }
        }, 3000);
    }
    
    resetStats() {
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.startTime = null;
        this.isProcessing = false;
        
        this.movesElement.textContent = '0';
        this.timerElement.textContent = '00:00';
        this.pairsElement.textContent = `0/${this.totalPairs}`;
        this.messageElement.textContent = '';
        this.messageElement.classList.remove('celebration-message');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    restart() {
        // Reset to initial state
        this.gameStarted = false;
        this.gameStats.style.display = 'none';
        this.restartBtn.style.display = 'none';
        this.startBtn.style.display = 'inline-block';
        this.gridSizeSelect.disabled = false;
        this.board.innerHTML = '';
        this.resetStats();
        this.messageElement.textContent = '';
        
        // Remove any existing fireworks
        const fireworksContainer = document.querySelector('.fireworks-container');
        if (fireworksContainer && fireworksContainer.parentNode) {
            fireworksContainer.parentNode.removeChild(fireworksContainer);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
