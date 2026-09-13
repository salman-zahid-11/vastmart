import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword, updateProfile, uploadAvatar } from '../services/profileService';
import './Profile.css';

const roleLabels = {
  customer: 'Customer account',
  seller: 'Seller account',
  admin: 'Admin account',
};

function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('account');
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearFeedback = () => {
    setMessage('');
    setError('');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
    setSaving(true);
    try {
      const updated = await updateProfile(formData);
      login({ ...user, ...updated });
      setMessage('Your profile details have been updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Your password has been changed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile photo must be under 2MB.');
      return;
    }
    clearFeedback();
    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      login({ ...user, avatar: result.avatar });
      setMessage('Profile photo updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const sidebarItems = [
    { id: 'account', label: 'Account information', icon: '◯' },
    { id: 'security', label: 'Password & security', icon: '▣' },
    ...(user?.role === 'customer' ? [{ id: 'orders', label: 'My orders', icon: '▤', path: '/orders' }] : []),
    ...(user?.role === 'seller' ? [{ id: 'workspace', label: 'Seller workspace', icon: '◆', path: '/seller/dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ id: 'workspace', label: 'Admin workspace', icon: '◆', path: '/admin/dashboard' }] : []),
    { id: 'support', label: 'Support tickets', icon: '?', path: '/support' },
  ];

  const avatarUrl = user?.avatar || null;
  const accountRoleLabel = user?.role === 'admin' && user?.adminLevel
    ? `${user.adminLevel === 'super_admin' ? 'Super Admin' : 'Moderator'} account`
    : roleLabels[user?.role] || 'VastMart account';
  return (
    <main className="profile-page">
      <div className="profile-page__heading">
        <div>
          <p className="profile-page__eyebrow">VastMart account center</p>
          <h1>My account</h1>
          <p>Manage your profile, security, and account activity in one place.</p>
        </div>
        <span className="profile-page__status"><i /> Account active</span>
      </div>

      <div className="profile-workspace">
        <aside className="profile-sidebar">
          <div className="profile-sidebar__identity">
            <div className="profile-sidebar__avatar">
              {avatarUrl ? <img src={avatarUrl} alt={user?.name} /> : <span>{user?.name?.charAt(0).toUpperCase()}</span>}
            </div>
            <strong>{user?.name}</strong>
            <span>{accountRoleLabel}</span>
          </div>
          <nav className="profile-sidebar__nav" aria-label="Profile sections">
            {sidebarItems.map((item) => item.path ? (
              <Link key={item.id} to={item.path} className="profile-sidebar__item">
                <b>{item.icon}</b>{item.label}<span>›</span>
              </Link>
            ) : (
              <button key={item.id} type="button" className={`profile-sidebar__item ${activeSection === item.id ? 'is-active' : ''}`} onClick={() => { clearFeedback(); setActiveSection(item.id); }}>
                <b>{item.icon}</b>{item.label}<span>›</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="profile-content">
          {message && <div className="profile-alert profile-alert--success">{message}</div>}
          {error && <div className="profile-alert profile-alert--error">{error}</div>}

          {activeSection === 'account' && (
            <>
              <section className="profile-panel profile-panel--hero">
                <div className="profile-panel__avatar-wrap">
                  <button type="button" className="profile-avatar" onClick={() => fileInputRef.current?.click()} aria-label="Change profile photo">
                    {avatarUrl ? <img src={avatarUrl} alt={user?.name} /> : <span>{user?.name?.charAt(0).toUpperCase()}</span>}
                    <em>Change</em>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} hidden />
                </div>
                <div>
                  <p className="profile-panel__kicker">{accountRoleLabel}</p>
                  <h2>{user?.name}</h2>
                  <p>Keep your details current so we can provide a smoother VastMart experience.</p>
                  <span className="profile-verified">✓ Email verified account</span>
                </div>
                <button type="button" className="profile-outline-button" onClick={() => fileInputRef.current?.click()}>
                  {uploadingAvatar ? 'Uploading...' : 'Change photo'}
                </button>
              </section>

              <section className="profile-panel">
                <div className="profile-panel__header">
                  <div><h2>Account information</h2><p>Update the personal details connected to your account.</p></div>
                  <span className="profile-panel__badge">Personal</span>
                </div>
                <form className="profile-form" onSubmit={handleProfileSubmit}>
                  <label>Full name<input name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></label>
                  <label>Email address<input value={user?.email || ''} disabled /><small>Your email is used for sign-in and cannot be changed here.</small></label>
                  <label>Phone number<input name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="01XXXXXXXXX" /></label>
                  <div className="profile-form__actions"><button className="profile-primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></div>
                </form>
              </section>
            </>
          )}

          {activeSection === 'security' && (
            <section className="profile-panel">
              <div className="profile-panel__header">
                <div><h2>Password & security</h2><p>Protect your account with a strong, private password.</p></div>
                <span className="profile-panel__badge profile-panel__badge--safe">Protected</span>
              </div>
              <div className="profile-security-card"><span>🔒</span><div><strong>Password security</strong><p>Use at least 6 characters and avoid passwords you use elsewhere.</p></div></div>
              <form className="profile-form profile-form--security" onSubmit={handlePasswordSubmit}>
                <label>Current password<input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></label>
                <label>New password<input type="password" minLength="6" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required /></label>
                <label>Confirm new password<input type="password" minLength="6" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required /></label>
                <div className="profile-form__actions"><button className="profile-primary-button" disabled={saving}>{saving ? 'Updating...' : 'Update password'}</button></div>
              </form>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
