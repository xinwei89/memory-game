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
        // Create pairs of images based on grid size
        for (let i = 1; i <= this.totalPairs; i++) {
            const imageUrl = `https://picsum.photos/100/100?random=${i}`;
            this.cards.push({ id: Math.random(), imageUrl: imageUrl, imageId: i, isFlipped: false, isMatched: false });
            this.cards.push({ id: Math.random(), imageUrl: imageUrl, imageId: i, isFlipped: false, isMatched: false });
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
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
