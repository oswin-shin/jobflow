import express from 'express';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import { pool } from './db/pool';

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('JobFlow API running');
});

app.use('/auth', authRoutes);

app.use('/jobs', jobRoutes);

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    try {
        const result = await pool.query('SELECT NOW()');
        console.log(result.rows[0]);
    } catch (e) {
        console.error('Database connection failed', e);
    }
});
