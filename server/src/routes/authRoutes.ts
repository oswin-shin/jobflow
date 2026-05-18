import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

const users: any[] = [];

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
            });
        }

        const existingUser = users.find((user) => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            email,
            password: hashedPassword,
        };

        users.push(newUser);

        res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (e) {
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

        const user = users.find((user) => user.email === email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password',
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({
                error: 'Invalid email or password',
            });
        }

        res.json({
            message: 'Login successful',
            user: {
                email: user.email,
            },
        });
    } catch (e) {
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

router.get('/users', (req, res) => {
    res.json({
        users: users,
    })
})

export default router;