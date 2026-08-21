import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadAvatar } from '../services/profileService';
import './Profile.css';

function Profile() {
  const { user, login } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const avatarUrl = user?.avatar || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const updated = await updateProfile(formData);
      login({ ...user, ...updated });
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }

    setError('');
    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      login({ ...user, avatar: result.avatar });
      setMessage('Profile picture updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Your Profile</h1>
      <p className="profile-page__subtitle">Manage your personal information and photo.</p>

      <div className="profile-layout">
        <div className="profile-card profile-card--avatar">
          <div className="profile-avatar" onClick={handleAvatarClick}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
            <div className="profile-avatar__overlay">
              {uploadingAvatar ? 'Uploading...' : 'Change photo'}
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          <p className="profile-avatar__name">{user?.name}</p>
          <span className={`role-pill role-pill--${user?.role}`}>{user?.role}</span>
        </div>

        <div className="profile-card profile-card--form">
          <h3>Personal Information</h3>

          {message && <p className="profile-form__success">{message}</p>}
          {error && <p className="checkout-form__error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="checkout-form__field">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="checkout-form__field">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled className="profile-form__disabled" />
              <p className="profile-form__hint">Email can't be changed</p>
            </div>

            <div className="checkout-form__field">
              <label>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="01XXXXXXXXX" />
            </div>

            <button type="submit" disabled={saving} className="profile-form__submit">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;