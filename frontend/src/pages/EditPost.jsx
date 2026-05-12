import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';

export default function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const post = await postsAPI.getById(id);
            setFormData({ title: post.title, content: post.content });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await postsAPI.update(id, formData);
            navigate(`/posts/${id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
            <Link to={`/posts/${id}`} style={{ color: '#007bff' }}>← Back to Post</Link>
            <h2>Edit Post</h2>
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
                    disabled={saving}
                    style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}