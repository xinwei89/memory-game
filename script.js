class MemoryGameApp {
    constructor() {
        this.apiUrl = window.location.origin + '/api';
        this.token = localStorage.getItem('memory_game_token');
        this.user = null;
        
        // Game elements
        this.board = document.getElementById('game-board');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.pairsElement = document.getElementById('pairs');
        this.messageElement = document.getElementById('game-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.startBtn = document.getElementById('start-btn');
        this.gridSizeSelect = document.getElementById('grid-size');
        this.gameStats = document.getElementById('game-stats');
        
        // Auth elements
        this.authSection = document.getElementById('auth-section');
        this.gameSection = document.getElementById('game-section');
        this.leaderboardSection = document.getElementById('leaderboard-section');
        this.loginTab = document.getElementById('login-tab');
        this.registerTab = document.getElementById('register-tab');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.authMessage = document.getElementById('auth-message');
        this.usernameDisplay = document.getElementById('username-display');
        this.logoutBtn = document.getElementById('logout-btn');
        this.leaderboardBtn = document.getElementById('leaderboard-btn');
        this.backToGameBtn = document.getElementById('back-to-game-btn');
        this.leaderboardGridSize = document.getElementById('leaderboard-grid-size');
        this.leaderboardContent = document.getElementById('leaderboard-content');
        
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isProcessing = false;
        this.gridSize = 2;
        this.totalPairs = 2;
        this.gameStarted = false;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        
        // Check if user is already logged in
        if (this.token) {
            try {
                await this.verifyToken();
            } catch (error) {
                this.logout();
            }
        } else {
            this.showAuthSection();
        }
    }
    
    bindEvents() {
        // Auth events
        this.loginTab.addEventListener('click', () => this.switchAuthTab('login'));
        this.registerTab.addEventListener('click', () => this.switchAuthTab('register'));
        
        document.getElementById('login-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('register-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // Game events
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.backToGameBtn.addEventListener('click', () => this.showGameSection());
        this.leaderboardGridSize.addEventListener('change', () => this.loadLeaderboard());
    }
    
    switchAuthTab(tab) {
        if (tab === 'login') {
            this.loginTab.classList.add('active');
            this.registerTab.classList.remove('active');
            this.loginForm.style.display = 'block';
            this.registerForm.style.display = 'none';
        } else {
            this.registerTab.classList.add('active');
            this.loginTab.classList.remove('active');
            this.registerForm.style.display = 'block';
            this.loginForm.style.display = 'none';
        }
        this.hideAuthMessage();
    }
    
    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('memory_game_token', this.token);
                this.showGameSection();
                this.showAuthMessage('Login successful!', 'success');
            } else {
                this.showAuthMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showAuthMessage('Network error. Please try again.', 'error');
        }
    }
    
    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('memory_game_token', this.token);
                this.showGameSection();
                this.showAuthMessage('Registration successful!', 'success');
            } else {
                this.showAuthMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showAuthMessage('Network error. Please try again.', 'error');
        }
    }
    
    async verifyToken() {
        const response = await fetch(`${this.apiUrl}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            this.user = data.user;
            this.showGameSection();
        } else {
            throw new Error('Invalid token');
        }
    }
    
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('memory_game_token');
        this.showAuthSection();
        this.resetGame();
    }
    
    showAuthSection() {
        this.authSection.style.display = 'block';
        this.gameSection.style.display = 'none';
        this.leaderboardSection.style.display = 'none';
    }
    
    showGameSection() {
        this.authSection.style.display = 'none';
        this.gameSection.style.display = 'block';
        this.leaderboardSection.style.display = 'none';
        
        if (this.user) {
            this.usernameDisplay.textContent = this.user.username;
        }
    }
    
    showLeaderboard() {
        this.gameSection.style.display = 'none';
        this.leaderboardSection.style.display = 'block';
        this.loadLeaderboard();
    }
    
    async loadLeaderboard() {
        const gridSize = this.leaderboardGridSize.value;
        
        try {
            const response = await fetch(`${this.apiUrl}/game/leaderboard/${gridSize}`);
            const data = await response.json();
            
            if (response.ok) {
                this.renderLeaderboard(data.leaderboard, gridSize);
            } else {
                this.leaderboardContent.innerHTML = '<div class="leaderboard-empty">Failed to load leaderboard</div>';
            }
        } catch (error) {
            this.leaderboardContent.innerHTML = '<div class="leaderboard-empty">Network error loading leaderboard</div>';
        }
    }
    
    renderLeaderboard(scores, gridSize) {
        if (!scores || scores.length === 0) {
            this.leaderboardContent.innerHTML = `<div class="leaderboard-empty">No scores yet for ${gridSize}x${gridSize} grid</div>`;
            return;
        }
        
        let html = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th class="rank">Rank</th>
                        <th>Player</th>
                        <th>Moves</th>
                        <th>Time</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        scores.forEach((score, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const timeFormatted = this.formatTime(score.timeSeconds);
            const dateFormatted = new Date(score.completedAt).toLocaleDateString();
            
            html += `
                <tr>
                    <td class="rank ${rankClass}">${score.rank}</td>
                    <td>${score.username}</td>
                    <td>${score.moves}</td>
                    <td>${timeFormatted}</td>
                    <td>${dateFormatted}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        this.leaderboardContent.innerHTML = html;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    showAuthMessage(message, type) {
        this.authMessage.textContent = message;
        this.authMessage.className = `auth-message ${type}`;
        this.authMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => this.hideAuthMessage(), 3000);
        }
    }
    
    hideAuthMessage() {
        this.authMessage.style.display = 'none';
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
        
        this.initGame();
    }
    
    initGame() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.bindGameEvents();
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
    
    bindGameEvents() {
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
    
    async gameWon() {
        clearInterval(this.timerInterval);
        const finalTime = this.timerElement.textContent;
        const timeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        
        this.messageElement.textContent = `🎉 Congratulations! You won in ${this.moves} moves and ${finalTime}!`;
        this.messageElement.classList.add('celebration-message');
        
        // Save score to backend
        await this.saveScore(timeSeconds);
        
        // Trigger fireworks animation
        this.createFireworks();
    }
    
    async saveScore(timeSeconds) {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/game/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify({
                    gridSize: this.gridSize,
                    moves: this.moves,
                    timeSeconds: timeSeconds,
                }),
            });
            
            if (response.ok) {
                console.log('Score saved successfully');
            }
        } catch (error) {
            console.error('Failed to save score:', error);
        }
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
    
    resetGame() {
        this.restart();
        this.gameStarted = false;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGameApp();
});
