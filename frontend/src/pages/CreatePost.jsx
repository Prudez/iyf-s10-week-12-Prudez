import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';

export default function CreatePost() {
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await postsAPI.create(formData);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
            <Link to="/" style={{ color: '#007bff' }}>← Back to Home</Link>
            <h2>Create New Post</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Post Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <textarea
                        name="content"
                        placeholder="What's on your mind?"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={6}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}