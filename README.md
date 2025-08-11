# Memory Game - Full Stack Edition

A fun and interactive memory game built with vanilla JavaScript frontend and Node.js/Express backend, featuring user authentication, persistent scores, and leaderboards.

## 🎮 Play the Game

**Live Demo:** [Play Memory Game](https://xinwei89.github.io/memory-game/) _(Note: Static version without backend features)_

## 🎯 Features

### Game Features
- Multiple grid sizes (2x2, 4x4, 6x6, 8x8)
- Beautiful random images from Picsum (with colorful fallbacks)
- Move counter and timer
- Responsive design
- Smooth card flip animations
- Fireworks celebration when you win!

### Full Stack Features
- **User Authentication**: Register and login with secure JWT tokens
- **Persistent Scores**: All game results are saved to database
- **Leaderboards**: Compare your scores with other players
- **Multiple Grid Sizes**: Separate leaderboards for each difficulty
- **User Profiles**: Track your best scores across all grid sizes

## 🚀 How to Play

1. **Register or Login** to your account
2. Choose your preferred grid size (2x2, 4x4, 6x6, or 8x8)
3. Click "Start Game" to begin
4. Click on cards to flip them and find matching pairs
5. Match all pairs to win!
6. Your score will be automatically saved and you can view leaderboards
7. Try to complete the game in the fewest moves and shortest time

## 🛠 Technologies Used

### Frontend
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Picsum Photos API for random images

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

### Deployment
- Docker & Docker Compose
- Nginx reverse proxy configuration
- Environment-based configuration

## 🏗 Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup
1. Clone the repository
```bash
git clone https://github.com/xinwei89/memory-game.git
cd memory-game
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
# Edit .env with your preferred settings
```

4. Start the development server
```bash
npm start
```

5. Open http://localhost:3000 in your browser

### Development Mode
For automatic restarts during development:
```bash
npm run dev
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker Only
```bash
# Build the image
docker build -t memory-game .

# Run the container
docker run -p 3000:3000 -v $(pwd)/database:/app/database memory-game
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login to existing account
- `GET /api/auth/profile` - Get current user profile

### Game
- `POST /api/game/score` - Save game score (requires authentication)
- `GET /api/game/leaderboard/:gridSize` - Get leaderboard for specific grid size
- `GET /api/game/scores/best` - Get user's best scores (requires authentication)

## 📱 Responsive Design

The game works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Input validation and sanitization
- CORS protection
- SQL injection prevention

## 🏆 Scoring System

Scores are calculated using: `(moves × 1000) + time_in_seconds`

Lower scores are better! The leaderboard ranks players by:
1. Lowest score
2. Earliest completion time (tie-breaker)

## 📝 Database Schema

### Users Table
- id, username, email, password, created_at

### Game Scores Table
- id, user_id, grid_size, moves, time_seconds, completed_at

## 🔄 Updates and Deployment

### Development Updates
1. Make your changes
2. Test locally with `npm start`
3. Commit and push changes

### Production Deployment
1. Update environment variables in `.env`
2. Use Docker Compose for production: `docker-compose up -d`
3. Monitor logs: `docker-compose logs -f`

## 📈 Future Enhancements

- Real-time multiplayer functionality
- Additional game modes and themes
- Social features (friend requests, private challenges)
- Advanced analytics and statistics
- Mobile app versions
- Tournament system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
