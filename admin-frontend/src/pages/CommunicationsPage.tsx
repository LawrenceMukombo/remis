import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Search, MessageSquare, Mail, MessageCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './CommunicationsPage.css';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

interface Thread {
    id: string;
    subject: string;
    lastMessage: string;
    updatedAt: string;
    unreadCount: number;
}

const CommunicationsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'IN_APP' | 'EMAIL' | 'WHATSAPP'>('IN_APP');
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [newThreadSubject, setNewThreadSubject] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        fetchThreads();
    }, []);

    useEffect(() => {
        if (activeThreadId) {
            fetchMessages(activeThreadId);
        }
    }, [activeThreadId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchThreads = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/communications/threads?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setThreads(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async (threadId: string) => {
        try {
            const res = await fetch(`http://localhost:4000/api/communications/threads/${threadId}/messages`);
            const data = await res.json();
            if (Array.isArray(data)) setMessages(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeThreadId) return;

        try {
            const res = await fetch('http://localhost:4000/api/communications/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: activeThreadId,
                    content: newMessage,
                    senderId: user.id || 'AGENT' // Use logical sender ID
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(activeThreadId);
                fetchThreads(); // Update preview
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/communications/threads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: newThreadSubject,
                    tenantId,
                    content: 'New conversation started.',
                    senderId: user.id || 'AGENT'
                })
            });

            if (res.ok) {
                setShowNewThreadModal(false);
                setNewThreadSubject('');
                fetchThreads();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="communications-page">
            <div className="comm-sidebar">
                <div className="comm-header">
                    <h2>Communications</h2>
                </div>

                <div className="comm-tabs">
                    <button
                        className={`comm-tab ${activeTab === 'IN_APP' ? 'active' : ''}`}
                        onClick={() => setActiveTab('IN_APP')}
                    >
                        <MessageSquare size={18} />
                        <span>Internal</span>
                    </button>
                    <button
                        className={`comm-tab ${activeTab === 'EMAIL' ? 'active' : ''}`}
                        onClick={() => setActiveTab('EMAIL')}
                    >
                        <Mail size={18} />
                        <span>Email</span>
                    </button>
                    <button
                        className={`comm-tab ${activeTab === 'WHATSAPP' ? 'active' : ''}`}
                        onClick={() => setActiveTab('WHATSAPP')}
                    >
                        <MessageCircle size={18} />
                        <span>WhatsApp</span>
                    </button>
                </div>

                {activeTab === 'IN_APP' && (
                    <div className="thread-list">
                        <div className="list-header">
                            <h3>Inbox</h3>
                            <button className="icon-btn" onClick={() => setShowNewThreadModal(true)}>
                                <Plus size={18} />
                            </button>
                        </div>
                        {threads.map(thread => (
                            <div
                                key={thread.id}
                                className={`thread-item ${activeThreadId === thread.id ? 'active' : ''}`}
                                onClick={() => setActiveThreadId(thread.id)}
                            >
                                <div className="thread-subject">{thread.subject}</div>
                                <div className="thread-preview">{thread.lastMessage}</div>
                                <div className="thread-date">
                                    {new Date(thread.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {threads.length === 0 && (
                            <div className="empty-state">No conversations yet.</div>
                        )}
                    </div>
                )}

                {activeTab === 'EMAIL' && (
                    <div className="thread-list">
                        <div className="list-header">
                            <h3>Email Inbox</h3>
                            <button className="icon-btn" onClick={() => { }}>
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="empty-state">
                            <Mail size={32} opacity={0.5} />
                            <p>No emails connected</p>
                            <button className="action-btn-small">Connect SMTP</button>
                        </div>
                    </div>
                )}

                {activeTab === 'WHATSAPP' && (
                    <div className="thread-list">
                        <div className="list-header">
                            <h3>WhatsApp</h3>
                            <button className="icon-btn" aria-label="New WhatsApp Message" title="New WhatsApp Message">
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="empty-state">
                            <MessageCircle size={32} color="#25D366" />
                            <p style={{ fontWeight: 600, color: '#1e293b' }}>Connected</p>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>+675 8244 0803</p>
                            <button className="action-btn-small" aria-label="Manage WhatsApp Connection">Manage</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="chat-area">
                {activeTab === 'IN_APP' ? (
                    activeThreadId ? (
                        <>
                            <div className="chat-header">
                                <h3 style={{ margin: 0 }}>{threads.find(t => t.id === activeThreadId)?.subject}</h3>
                            </div>
                            <div className="chat-messages">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble ${msg.senderId === (user.id || 'AGENT') ? 'sent' : 'received'}`}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-input-area">
                                <form onSubmit={handleSendMessage} className="chat-input-wrapper">
                                    <input
                                        type="text"
                                        className="chat-input"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" className="action-btn">
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="empty-chat-placeholder">
                            <MessageSquare size={48} />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )
                ) : (
                    <div className="empty-chat-placeholder">
                        {activeTab === 'EMAIL' ? <Mail size={48} /> : <MessageCircle size={48} />}
                        <p>{activeTab === 'EMAIL' ? 'Select an email to read' : 'Select a WhatsApp chat'}</p>
                    </div>
                )}
            </div>

            {/* New Thread Modal */}
            {showNewThreadModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>New Message</h2>
                        <form onSubmit={handleCreateThread}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Subject</label>
                                <input
                                    required
                                    type="text"
                                    value={newThreadSubject}
                                    onChange={(e) => setNewThreadSubject(e.target.value)}
                                    className="modal-input"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowNewThreadModal(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="submit-btn">Start</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunicationsPage;
