import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, user, logout } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await postsAPI.getAll();
            setPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            await postsAPI.like(postId);
            fetchPosts(); // refresh posts
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await postsAPI.delete(postId);
            fetchPosts(); // refresh posts
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* NAVBAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <h1>CommunityHub</h1>
                <div>
                    {isAuthenticated ? (
                        <>
                            <span style={{ marginRight: '10px' }}>Hi, {user?.username}!</span>
                            <Link to="/create" style={{ marginRight: '10px', padding: '8px 16px', background: '#007bff', color: 'white', textDecoration: 'none' }}>
                                New Post
                            </Link>
                            <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>

            {/* ERROR */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* LOADING */}
            {loading && <p>Loading posts...</p>}

            {/* POSTS LIST */}
            {!loading && posts.length === 0 && (
                <p>No posts yet. Be the first to post!</p>
            )}

            {posts.map(post => (
                <div key={post._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
                    <h3>{post.title}</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        By {post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <p>{post.content}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <Link to={`/posts/${post._id}`} style={{ color: '#007bff' }}>
                            View & Comment
                        </Link>
                        {isAuthenticated && (
                            <button
                                onClick={() => handleLike(post._id)}
                                style={{ cursor: 'pointer', background: 'none', border: '1px solid #ccc', padding: '4px 8px' }}
                            >
                                ❤️ {post.likes?.length || 0}
                            </button>
                        )}
                        {isAuthenticated && user?.id === post.author?._id && (
                            <>
                                <Link to={`/posts/${post._id}/edit`} style={{ color: '#28a745' }}>Edit</Link>
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}