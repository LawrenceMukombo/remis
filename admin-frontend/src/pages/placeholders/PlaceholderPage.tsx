import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
    description: string;
    features?: string[];
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, features }) => {
    return (
        <div style={{
            padding: '2rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            textAlign: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                maxWidth: '600px',
                width: '100%'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    marginInline: 'auto',
                    color: '#3b82f6'
                }}>
                    <Construction size={32} />
                </div>

                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '1rem'
                }}>
                    {title} Module
                </h1>

                <p style={{
                    color: '#64748b',
                    fontSize: '1.125rem',
                    lineHeight: '1.75',
                    marginBottom: '2rem'
                }}>
                    {description}
                </p>

                {features && features.length > 0 && (
                    <div style={{ textAlign: 'left', backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                            Planned Features
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {features.map((feature, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '0.925rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div style={{ marginTop: '2rem' }}>
                    <span style={{
                        inlineBlock: 'block',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Coming Soon in V2
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderPage;
