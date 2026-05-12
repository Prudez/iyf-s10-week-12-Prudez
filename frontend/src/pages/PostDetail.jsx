import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            const data = await postsAPI.getById(id);
            setPost(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const data = await commentsAPI.getByPost(id);
            setComments(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await commentsAPI.create(id, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await commentsAPI.delete(id, commentId);
            fetchComments();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await postsAPI.delete(id);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
    if (!post) return <p style={{ padding: '20px' }}>Post not found</p>;

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
            <Link to="/" style={{ color: '#007bff' }}>← Back to Home</Link>

            {/* POST */}
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', marginTop: '20px' }}>
                <h2>{post.title}</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    By {post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p>{post.content}</p>
                {isAuthenticated && user?.id === post.author?._id && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <Link
                            to={`/posts/${id}/edit`}
                            style={{ color: '#28a745' }}
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleDeletePost}
                            style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* ERROR */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* ADD COMMENT */}
            {isAuthenticated && (
                <form onSubmit={handleAddComment} style={{ marginTop: '20px' }}>
                    <textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    <button
                        type="submit"
                        style={{ marginTop: '8px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Add Comment
                    </button>
                </form>
            )}

            {/* COMMENTS */}
            <h3 style={{ marginTop: '30px' }}>Comments ({comments.length})</h3>
            {comments.length === 0 && <p>No comments yet. Be the first!</p>}
            {comments.map(comment => (
                <div key={comment._id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                    <p style={{ color: '#666', fontSize: '13px' }}>
                        {comment.author?.username} • {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    <p>{comment.content}</p>
                    {isAuthenticated && user?.id === comment.author?._id && (
                        <button
                            onClick={() => handleDeleteComment(comment._id)}
                            style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}