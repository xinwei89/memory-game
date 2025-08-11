const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Save game score
router.post('/score', authenticateToken, (req, res) => {
    const { gridSize, moves, timeSeconds } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!gridSize || !moves || timeSeconds === undefined) {
        return res.status(400).json({ error: 'Grid size, moves, and time are required' });
    }

    if (![2, 4, 6, 8].includes(parseInt(gridSize))) {
        return res.status(400).json({ error: 'Invalid grid size' });
    }

    if (parseInt(moves) < 1 || parseInt(timeSeconds) < 1) {
        return res.status(400).json({ error: 'Invalid moves or time values' });
    }

    db.saveGameScore(userId, parseInt(gridSize), parseInt(moves), parseInt(timeSeconds), (err, scoreId) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save score' });
        }

        res.status(201).json({
            message: 'Score saved successfully',
            scoreId,
            score: {
                gridSize: parseInt(gridSize),
                moves: parseInt(moves),
                timeSeconds: parseInt(timeSeconds)
            }
        });
    });
});

// Get leaderboard for specific grid size
router.get('/leaderboard/:gridSize', (req, res) => {
    const { gridSize } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (![2, 4, 6, 8].includes(parseInt(gridSize))) {
        return res.status(400).json({ error: 'Invalid grid size' });
    }

    db.getLeaderboard(parseInt(gridSize), limit, (err, scores) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }

        res.json({
            gridSize: parseInt(gridSize),
            leaderboard: scores.map((score, index) => ({
                rank: index + 1,
                username: score.username,
                moves: score.moves,
                timeSeconds: score.time_seconds,
                score: score.score,
                completedAt: score.completed_at
            }))
        });
    });
});

// Get user's best scores
router.get('/scores/best', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.getUserBestScores(userId, (err, scores) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch user scores' });
        }

        res.json({
            bestScores: scores.map(score => ({
                gridSize: score.grid_size,
                bestMoves: score.best_moves,
                bestTime: score.best_time,
                bestScore: score.best_score
            }))
        });
    });
});

module.exports = router;