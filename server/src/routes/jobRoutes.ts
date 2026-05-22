import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    res.json({
        user: req.user.userId,
    })
})



export default router;