import express from 'express';
import { pool } from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT id, company, title, notes
            FROM jobs
            `
        )

        const jobs = result.rows;

        res.json({
            message: `All jobs for ${userId}`,
            jobs: jobs,
        })
    } catch (e) {
        res.status(500).json({
            error: 'Internal server error'
        })
    }
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { company, title, status, job_url, notes } = req.body;
        if (!company || !title) {
            return res.status(400).json({
                error: 'Company and title are required',
            });
        }

        const userId = req.user.userId;

        const existingJob = await pool.query(
            `
            SELECT * FROM jobs 
            WHERE user_id = $1
            AND company = $2
            AND title = $3
            `,
            [userId, company, title]
        )

        if (existingJob.rows.length > 0) {
            return res.status(400).json({
                error: 'Job already exists'
            });
        }

        const result = await pool.query(
            `INSERT INTO jobs (user_id, company, title, status, job_url, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, company, title, status, job_url, notes, created_at`,
            [userId, company, title, status, job_url, notes]
        );

        res.status(201).json({
            message: 'Job created successfully',
            job: result.rows[0],
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.userId;
        const jobId = req.params.id;

        const result = await pool.query(
            `
            SELECT id, company, title, status, job_url, notes, created_at
            FROM jobs
            WHERE id = $1
            AND user_id = $2
            `,
            [jobId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Job not found',
            });
        }

        res.json({
            job: result.rows[0],
        });
    } catch (e) {
        console.error(e);

        res.status(500).json({
            error: 'Internal server error',
        });
    }
});

router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.user.userId;
    const jobId = req.params.id;
    const { company, title, status, job_url, notes } = req.body;
  
    const result = await pool.query(
        `
        UPDATE jobs
        SET 
            company = COALESCE($1, company),
            title = COALESCE($2, title),
            status = COALESCE($3, status),
            job_url = COALESCE($4, job_url),
            notes = COALESCE($5, notes)
        WHERE id = $6
        AND user_id = $7
        RETURNING id, user_id, company, title, job_url, notes, created_at
        `,
        [
            company,
            title,
            status,
            job_url,
            notes,
            jobId,
            userId
        ]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            error: 'Job not found',
        });
    }

    res.json({
        message: 'Job updated successfully',
        job: result.rows[0],
    });
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.userId;
        const jobId = req.params.id;
    
        const result = await pool.query(
            `
            DELETE FROM jobs
            WHERE id = $1
            AND user_id = $2
            RETURNING id, company, title
            `,
            [jobId, userId]
        );
    
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Job doesn\'t exist'
            });
        }
        res.json({
            message: 'Job deleted successfully'
        });
    } catch (e) {
        console.error(e);

        res.status(500).json({
            error: 'Internal server error',
        });
    }
})

export default router;