import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// List all published blogs (public)
router.get('/', async (_req, res: Response): Promise<void> => {
    try {
        const blogs = await prisma.blog.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

// Get all blogs for the logged-in doctor (including drafts)
router.get('/my', authenticate, requireRole('DOCTOR', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const blogs = await prisma.blog.findMany({
            where: { authorId: req.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your blogs' });
    }
});

// Get blog by slug (public)
router.get('/:slug', async (req, res: Response): Promise<void> => {
    try {
        const blog = await prisma.blog.findUnique({
            where: { slug: req.params.slug },
        });
        if (!blog) {
            res.status(404).json({ error: 'Blog post not found' });
            return;
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

// Create blog (doctor/admin only)
router.post('/', authenticate, requireRole('DOCTOR', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, content, excerpt, image, published } = req.body;

        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            + '-' + Date.now().toString(36);

        const blog = await prisma.blog.create({
            data: {
                title,
                slug,
                content,
                excerpt: excerpt || content.substring(0, 200) + '...',
                image,
                published: published ?? false,
                authorId: req.userId,
            },
        });

        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// Update blog (doctor/admin only, must own it)
router.put('/:id', authenticate, requireRole('DOCTOR', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, image, published } = req.body;

        // Check ownership
        const existing = await prisma.blog.findUnique({ where: { id: id as string } });
        if (!existing) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        if (existing.authorId && existing.authorId !== req.userId && req.userRole !== 'ADMIN') {
            res.status(403).json({ error: 'You can only edit your own blogs' });
            return;
        }

        const blog = await prisma.blog.update({
            where: { id: id as string },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(excerpt !== undefined && { excerpt }),
                ...(image !== undefined && { image }),
                ...(published !== undefined && { published }),
            },
        });

        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// Delete blog (doctor/admin only, must own it)
router.delete('/:id', authenticate, requireRole('DOCTOR', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const existing = await prisma.blog.findUnique({ where: { id: id as string } });
        if (!existing) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        if (existing.authorId && existing.authorId !== req.userId && req.userRole !== 'ADMIN') {
            res.status(403).json({ error: 'You can only delete your own blogs' });
            return;
        }

        await prisma.blog.delete({ where: { id: id as string } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

export default router;
