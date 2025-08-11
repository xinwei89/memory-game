const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'memory_game.db'));
    }

    initializeDatabase() {
        // Create users table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create game_scores table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS game_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                grid_size INTEGER NOT NULL,
                moves INTEGER NOT NULL,
                time_seconds INTEGER NOT NULL,
                completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        console.log('Database initialized successfully');
    }

    // User methods
    createUser(username, email, hashedPassword, callback) {
        const stmt = this.db.prepare(`
            INSERT INTO users (username, email, password) 
            VALUES (?, ?, ?)
        `);
        stmt.run([username, email, hashedPassword], function(err) {
            callback(err, this ? this.lastID : null);
        });
        stmt.finalize();
    }

    getUserByEmail(email, callback) {
        this.db.get(
            'SELECT * FROM users WHERE email = ?', 
            [email], 
            callback
        );
    }

    getUserByUsername(username, callback) {
        this.db.get(
            'SELECT * FROM users WHERE username = ?', 
            [username], 
            callback
        );
    }

    getUserById(id, callback) {
        this.db.get(
            'SELECT id, username, email, created_at FROM users WHERE id = ?', 
            [id], 
            callback
        );
    }

    // Game score methods
    saveGameScore(userId, gridSize, moves, timeSeconds, callback) {
        const stmt = this.db.prepare(`
            INSERT INTO game_scores (user_id, grid_size, moves, time_seconds) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run([userId, gridSize, moves, timeSeconds], function(err) {
            callback(err, this ? this.lastID : null);
        });
        stmt.finalize();
    }

    getLeaderboard(gridSize, limit = 10, callback) {
        this.db.all(`
            SELECT 
                u.username,
                gs.moves,
                gs.time_seconds,
                gs.completed_at,
                (gs.moves * 1000 + gs.time_seconds) as score
            FROM game_scores gs
            JOIN users u ON gs.user_id = u.id
            WHERE gs.grid_size = ?
            ORDER BY score ASC, gs.completed_at ASC
            LIMIT ?
        `, [gridSize, limit], callback);
    }

    getUserBestScores(userId, callback) {
        this.db.all(`
            SELECT 
                grid_size,
                MIN(moves) as best_moves,
                MIN(time_seconds) as best_time,
                MIN(moves * 1000 + time_seconds) as best_score
            FROM game_scores
            WHERE user_id = ?
            GROUP BY grid_size
            ORDER BY grid_size ASC
        `, [userId], callback);
    }

    close() {
        this.db.close();
    }
}

module.exports = new Database();