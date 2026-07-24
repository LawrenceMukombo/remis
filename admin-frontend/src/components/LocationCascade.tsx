
import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface Location {
    id: string;
    name: string;
    type: string;
    level: number;
    children?: Location[];
}

interface LocationCascadeProps {
    onSelect: (locationId: string | null) => void;
    labels?: Record<number, string>; // e.g. {1: 'Region', 2: 'Province'}
}

export const LocationCascade: React.FC<LocationCascadeProps> = ({ onSelect, labels }) => {
    // We store selections for each level: { 1: 'regionId', 2: 'provinceId' }
    const [selections, setSelections] = useState<Record<number, string>>({});

    // We store options available for each level based on parent selection
    // Level 1 options are fetched initially. Level 2 depends on Level 1 selection, etc.
    const [options, setOptions] = useState<Record<number, Location[]>>({});

    useEffect(() => {
        // Load Level 1 (Roots)
        fetchLocations(1, null);
    }, []);

    const fetchLocations = async (level: number, parentId: string | null) => {
        try {
            const params = new URLSearchParams();
            params.append('level', level.toString());
            if (parentId) params.append('parentId', parentId);

            const res = await fetch(`http://localhost:4000/api/locations?${params.toString()}`);
            const data = await res.json();

            setOptions(prev => ({
                ...prev,
                [level]: data
            }));
        } catch (err) {
            console.error("Failed to fetch locations", err);
        }
    };

    const handleSelect = (level: number, locationId: string) => {
        // Update selection for this level
        const newSelections = { ...selections, [level]: locationId };

        // Clear subsequent levels
        Object.keys(newSelections).forEach(key => {
            if (parseInt(key) > level) delete newSelections[parseInt(key)];
        });

        setSelections(newSelections);
        onSelect(locationId); // Notify parent of the most specific selection

        // Fetch options for the next level
        fetchLocations(level + 1, locationId);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map(level => {
                // Only show this level if it's Level 1 OR if the previous level has a selection
                if (level > 1 && !selections[level - 1]) return null;

                // If options for this level are empty (and we tried to fetch), don't show? 
                // Better to show if we have options.
                const levelOptions = options[level] || [];
                if (level > 1 && levelOptions.length === 0) return null;

                const label = labels?.[level] || `Level ${level}`;

                return (
                    <div key={level}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                            {label}
                        </label>
                        <select
                            value={selections[level] || ''}
                            onChange={(e) => handleSelect(level, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                border: '1px solid #d1d5db',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">Select {label}...</option>
                            {levelOptions.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}
        </div>
    );
};
