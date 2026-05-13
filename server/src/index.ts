import express from 'express';

const app = express();


const PORT = 3000;

app.get('/', (req, res) => {
    res.send('JobFlow API running');
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is healthy',
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});