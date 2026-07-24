import React from 'react';
import { X, Mail, Shield, User, Hash } from 'lucide-react';
import './UserProfileModal.css';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id?: string | number;
        fullName?: string;
        email?: string;
        role?: string;
        [key: string]: any;
    };
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    const initials = user.fullName
        ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                <div className="profile-header">
                    <button className="profile-close-btn" onClick={onClose} aria-label="Close profile">
                        <X size={20} />
                    </button>
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-large">
                            <div className="profile-avatar-inner">
                                {initials}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-body">
                    <h2 className="profile-name">{user.fullName || 'Unknown User'}</h2>
                    <span className="profile-role-badge">{user.role || 'No Role Assigned'}</span>

                    <div className="profile-details-grid">
                        <div className="profile-detail-item">
                            <div className="detail-icon">
                                <Mail size={20} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Email Address</span>
                                <span className="detail-value">{user.email || 'Not provided'}</span>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="detail-icon">
                                <Shield size={20} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">Access Level</span>
                                <span className="detail-value">{user.role || 'Standard Access'}</span>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="detail-icon">
                                <Hash size={20} />
                            </div>
                            <div className="detail-content">
                                <span className="detail-label">User ID</span>
                                <span className="detail-value">{user.id || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
