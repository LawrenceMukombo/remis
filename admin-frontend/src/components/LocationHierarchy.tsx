import React, { useState, useEffect } from 'react';

interface Location {
    id: string;
    name: string;
    level: number;
    parentId: string | null;
}

interface LocationHierarchyProps {
    selectedRegion: string;
    selectedProvince: string;
    selectedDistrict: string;
    selectedLLG: string;
    selectedCompound?: string;
    onRegionChange: (value: string, name?: string) => void;
    onProvinceChange: (value: string, name?: string) => void;
    onDistrictChange: (value: string, name?: string) => void;
    onLLGChange: (value: string, name?: string) => void;
    onCompoundChange?: (value: string, name?: string) => void;
    primaryColor?: string;
    labels?: Record<number, string>;
    tenantId?: string;
    country?: string;
}

const COUNTRY_DEFAULTS: Record<string, Record<number, string>> = {
    'Zambia': { 1: 'Country', 2: 'Province', 3: 'District', 4: 'Settlement / Community' },
    'South Africa': { 1: 'Country', 2: 'Province / County', 3: 'Municipality / City', 4: 'Township / Suburb' },
    'Australia': { 1: 'Country', 2: 'State / Territory', 3: 'City / LGA', 4: 'Suburb / Precinct' },
    'United States': { 1: 'Country', 2: 'State', 3: 'County / City', 4: 'Neighborhood / Locality' },
    'United Kingdom': { 1: 'Country', 2: 'Region / County', 3: 'City / Borough', 4: 'Postal District' },
    'Kenya': { 1: 'Country', 2: 'County', 3: 'Sub-County', 4: 'Ward / Estate' },
    'Papua New Guinea': { 1: 'Region', 2: 'Province', 3: 'District', 4: 'LLG', 5: 'Compound / Ward' }
};

const LocationHierarchy: React.FC<LocationHierarchyProps> = ({
    selectedRegion,
    selectedProvince,
    selectedDistrict,
    selectedLLG,
    selectedCompound = '',
    onRegionChange,
    onProvinceChange,
    onDistrictChange,
    onLLGChange,
    onCompoundChange,
    primaryColor = '#667eea',
    labels,
    tenantId,
    country = 'Zambia'
}) => {
    const [regions, setRegions] = useState<Location[]>([]);
    const [provinces, setProvinces] = useState<Location[]>([]);
    const [districts, setDistricts] = useState<Location[]>([]);
    const [llgs, setLLGs] = useState<Location[]>([]);
    const [compounds, setCompounds] = useState<Location[]>([]);

    // Determine country-specific hierarchy labels
    const activeLabels: Record<number, string> = {
        ...(country && COUNTRY_DEFAULTS[country] ? COUNTRY_DEFAULTS[country] : COUNTRY_DEFAULTS['Zambia']),
        ...(labels || {})
    };

    const hasLevel5 = Boolean(activeLabels[5] || compounds.length > 0);

    const getResolvedId = (list: Location[], val: string): string | null => {
        if (!val) return null;
        const found = list.find(item => item.id === val || item.name.toLowerCase() === val.toLowerCase());
        return found ? found.id : val;
    };

    // Helper: fetch locations from API
    const fetchLocations = async (level: number, parentId: string | null): Promise<Location[]> => {
        try {
            const params = new URLSearchParams();
            params.append('level', level.toString());
            if (parentId) params.append('parentId', parentId);
            if (tenantId) params.append('tenantId', tenantId);
            if (country && level === 1) params.append('country', country);

            const res = await fetch(`http://localhost:4000/api/locations?${params}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(`Error fetching locations for level ${level}:`, error);
            return [];
        }
    };

    // 1. Fetch Level 1 (Country/Root) on mount or tenantId/country change
    useEffect(() => {
        fetchLocations(1, null).then(roots => {
            setRegions(roots);
            // If only 1 root exists (e.g. Zambia) and no region selected, auto-select it
            if (roots.length === 1 && !selectedRegion) {
                onRegionChange(roots[0].id, roots[0].name);
            }
        });
    }, [tenantId, country]);

    // 2. Fetch Level 2 when Level 1 changes
    useEffect(() => {
        const resolvedParent = getResolvedId(regions, selectedRegion);
        if (resolvedParent) {
            fetchLocations(2, resolvedParent).then(setProvinces);
        } else {
            setProvinces([]);
            setDistricts([]);
            setLLGs([]);
            setCompounds([]);
        }
    }, [selectedRegion, regions]);

    // 3. Fetch Level 3 when Level 2 changes
    useEffect(() => {
        const resolvedParent = getResolvedId(provinces, selectedProvince);
        if (resolvedParent) {
            fetchLocations(3, resolvedParent).then(setDistricts);
        } else {
            setDistricts([]);
            setLLGs([]);
            setCompounds([]);
        }
    }, [selectedProvince, provinces]);

    // 4. Fetch Level 4 when Level 3 changes
    useEffect(() => {
        const resolvedParent = getResolvedId(districts, selectedDistrict);
        if (resolvedParent) {
            fetchLocations(4, resolvedParent).then(setLLGs);
        } else {
            setLLGs([]);
            setCompounds([]);
        }
    }, [selectedDistrict, districts]);

    // 5. Fetch Level 5 when Level 4 changes (if applicable)
    useEffect(() => {
        const resolvedParent = getResolvedId(llgs, selectedLLG);
        if (resolvedParent && hasLevel5) {
            fetchLocations(5, resolvedParent).then(setCompounds);
        } else {
            setCompounds([]);
        }
    }, [selectedLLG, llgs, hasLevel5]);

    const selectStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.875rem 1rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        fontSize: '0.9375rem',
        backgroundColor: 'white',
        color: '#0f172a',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxSizing: 'border-box'
    };

    const labelStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#0f172a'
    };

    const badgeStyle: React.CSSProperties = {
        fontSize: '0.7rem',
        fontWeight: 500,
        color: '#64748b',
        background: '#f1f5f9',
        padding: '1px 6px',
        borderRadius: '4px'
    };

    // Value matching helper to match either ID or name in current option list
    const getSelectValue = (list: Location[], currentVal: string) => {
        if (!currentVal) return '';
        const match = list.find(item => item.id === currentVal || item.name.toLowerCase() === currentVal.toLowerCase());
        return match ? match.id : currentVal;
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Level 1: Country / Root */}
            <div>
                <label style={labelStyle}>
                    <span>{activeLabels[1] || 'Country'}</span>
                    <span style={badgeStyle}>Level 1</span>
                </label>
                <select
                    value={getSelectValue(regions, selectedRegion)}
                    onChange={(e) => {
                        const val = e.target.value;
                        const item = regions.find(r => r.id === val);
                        onRegionChange(val, item?.name);
                        onProvinceChange('', '');
                        onDistrictChange('', '');
                        onLLGChange('', '');
                        if (onCompoundChange) onCompoundChange('', '');
                    }}
                    style={selectStyle}
                >
                    <option value="">Select {activeLabels[1] || 'Country'}</option>
                    {regions.map(region => (
                        <option key={region.id} value={region.id}>
                            {region.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Level 2: Province / State */}
            <div>
                <label style={labelStyle}>
                    <span>{activeLabels[2] || 'Province'}</span>
                    <span style={badgeStyle}>Level 2</span>
                </label>
                <select
                    value={getSelectValue(provinces, selectedProvince)}
                    onChange={(e) => {
                        const val = e.target.value;
                        const item = provinces.find(p => p.id === val);
                        onProvinceChange(val, item?.name);
                        onDistrictChange('', '');
                        onLLGChange('', '');
                        if (onCompoundChange) onCompoundChange('', '');
                    }}
                    disabled={!selectedRegion || provinces.length === 0}
                    style={{
                        ...selectStyle,
                        opacity: (!selectedRegion || provinces.length === 0) ? 0.5 : 1,
                        cursor: (!selectedRegion || provinces.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="">Select {activeLabels[2] || 'Province'}</option>
                    {provinces.map(province => (
                        <option key={province.id} value={province.id}>
                            {province.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Level 3: District / City */}
            <div>
                <label style={labelStyle}>
                    <span>{activeLabels[3] || 'District'}</span>
                    <span style={badgeStyle}>Level 3</span>
                </label>
                <select
                    value={getSelectValue(districts, selectedDistrict)}
                    onChange={(e) => {
                        const val = e.target.value;
                        const item = districts.find(d => d.id === val);
                        onDistrictChange(val, item?.name);
                        onLLGChange('', '');
                        if (onCompoundChange) onCompoundChange('', '');
                    }}
                    disabled={!selectedProvince || districts.length === 0}
                    style={{
                        ...selectStyle,
                        opacity: (!selectedProvince || districts.length === 0) ? 0.5 : 1,
                        cursor: (!selectedProvince || districts.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="">Select {activeLabels[3] || 'District'}</option>
                    {districts.map(district => (
                        <option key={district.id} value={district.id}>
                            {district.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Level 4: Settlement / Community / Suburb */}
            <div style={{ gridColumn: hasLevel5 ? 'auto' : 'span 2' }}>
                <label style={labelStyle}>
                    <span>{activeLabels[4] || 'Settlement / Community'}</span>
                    <span style={badgeStyle}>Level 4</span>
                </label>
                <select
                    value={getSelectValue(llgs, selectedLLG)}
                    onChange={(e) => {
                        const val = e.target.value;
                        const item = llgs.find(l => l.id === val);
                        onLLGChange(val, item?.name);
                        if (onCompoundChange) onCompoundChange('', '');
                    }}
                    disabled={!selectedDistrict || llgs.length === 0}
                    style={{
                        ...selectStyle,
                        opacity: (!selectedDistrict || llgs.length === 0) ? 0.5 : 1,
                        cursor: (!selectedDistrict || llgs.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="">Select {activeLabels[4] || 'Settlement / Community'}</option>
                    {llgs.map(llg => (
                        <option key={llg.id} value={llg.id}>
                            {llg.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Level 5: Optional (e.g. PNG Ward/Compound) */}
            {hasLevel5 && (
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>
                        <span>{activeLabels[5] || 'Compound / Suburb'}</span>
                        <span style={badgeStyle}>Level 5</span>
                    </label>
                    <select
                        value={getSelectValue(compounds, selectedCompound)}
                        onChange={(e) => {
                            const val = e.target.value;
                            const item = compounds.find(c => c.id === val);
                            if (onCompoundChange) onCompoundChange(val, item?.name);
                        }}
                        disabled={!selectedLLG || compounds.length === 0}
                        style={{
                            ...selectStyle,
                            opacity: (!selectedLLG || compounds.length === 0) ? 0.5 : 1,
                            cursor: (!selectedLLG || compounds.length === 0) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <option value="">Select {activeLabels[5] || 'Compound / Suburb'}</option>
                        {compounds.map(compound => (
                            <option key={compound.id} value={compound.id}>
                                {compound.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default LocationHierarchy;
