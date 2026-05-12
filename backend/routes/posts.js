const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// =====================
// GET ALL POSTS
// GET /api/posts
// =====================
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username') // get author's username
            .sort({ createdAt: -1 }); // newest first
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// GET SINGLE POST
// GET /api/posts/:id
// =====================
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// CREATE POST (auth required)
// POST /api/posts
// =====================
router.post('/', auth, async (req, res) => {
    try {
        const { title, content } = req.body;

        const post = new Post({
            title,
            content,
            author: req.user.id
        });

        await post.save();
        await post.populate('author', 'username');

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// UPDATE POST (auth required)
// PUT /api/posts/:id
// =====================
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Make sure only the author can edit
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { title, content } = req.body;
        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// DELETE POST (auth required)
// DELETE /api/posts/:id
// =====================
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Make sure only the author can delete
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await post.deleteOne();

        // Also delete all comments on this post
        await Comment.deleteMany({ post: req.params.id });

        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// LIKE / UNLIKE POST (auth required)
// POST /api/posts/:id/like
// =====================
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const alreadyLiked = post.likes.includes(req.user.id);

        if (alreadyLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        } else {
            // Like
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: !alreadyLiked });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// GET COMMENTS FOR A POST
// GET /api/posts/:id/comments
// =====================
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// CREATE COMMENT (auth required)
// POST /api/posts/:id/comments
// =====================
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = new Comment({
            content: req.body.content,
            author: req.user.id,
            post: req.params.id
        });

        await comment.save();
        await comment.populate('author', 'username');

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// DELETE COMMENT (auth required)
// DELETE /api/posts/:id/comments/:commentId
// =====================
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only author can delete their comment
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;