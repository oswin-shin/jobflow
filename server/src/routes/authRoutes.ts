import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
            });
        }

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: 'User already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2)',
            [email, hashedPassword]
        );

        res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (e) {
        console.error(e);

        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'email and password are required',
            });
        }

        const result = await pool.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            [email]
        )
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password',
            });
        }
        
        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({
                error: 'Invalid email or password',
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: '1H',
            }
        )

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        });
    } catch (e) {
        console.error(e);
        
        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

router.get('/test', (req, res) => {
    res.json({
        message: 'Auth routes working',
    });
});

router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, created_at FROM users'
        );

        res.json({
            users: result.rows,
        });
    } catch (e)  {
        res.status(500).json({
            error: 'Internal server error',
        });
    }
})

export default router;