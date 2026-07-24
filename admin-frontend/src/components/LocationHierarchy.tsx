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
    selectedCompound: string;
    onRegionChange: (value: string) => void;
    onProvinceChange: (value: string) => void;
    onDistrictChange: (value: string) => void;
    onLLGChange: (value: string) => void;
    onCompoundChange: (value: string) => void;
    primaryColor?: string;
}

const LocationHierarchy: React.FC<LocationHierarchyProps> = ({
    selectedRegion,
    selectedProvince,
    selectedDistrict,
    selectedLLG,
    selectedCompound,
    onRegionChange,
    onProvinceChange,
    onDistrictChange,
    onLLGChange,
    onCompoundChange,
    primaryColor = '#667eea'
}) => {
    const [regions, setRegions] = useState<Location[]>([]);
    const [provinces, setProvinces] = useState<Location[]>([]);
    const [districts, setDistricts] = useState<Location[]>([]);
    const [llgs, setLLGs] = useState<Location[]>([]);
    const [compounds, setCompounds] = useState<Location[]>([]);

    // Fetch regions on mount
    useEffect(() => {
        fetchLocations(1, null, setRegions);
    }, []);

    // Fetch provinces when region changes
    useEffect(() => {
        if (selectedRegion) {
            fetchLocations(2, selectedRegion, setProvinces);
        } else {
            setProvinces([]);
            setDistricts([]);
            setLLGs([]);
            setCompounds([]);
        }
    }, [selectedRegion]);

    // Fetch districts when province changes
    useEffect(() => {
        if (selectedProvince) {
            fetchLocations(3, selectedProvince, setDistricts);
        } else {
            setDistricts([]);
            setLLGs([]);
            setCompounds([]);
        }
    }, [selectedProvince]);

    // Fetch LLGs when district changes
    useEffect(() => {
        if (selectedDistrict) {
            fetchLocations(4, selectedDistrict, setLLGs);
        } else {
            setLLGs([]);
            setCompounds([]);
        }
    }, [selectedDistrict]);

    // Fetch compounds when LLG changes
    useEffect(() => {
        if (selectedLLG) {
            fetchLocations(5, selectedLLG, setCompounds);
        } else {
            setCompounds([]);
        }
    }, [selectedLLG]);

    const fetchLocations = async (level: number, parentId: string | null, setter: React.Dispatch<React.SetStateAction<Location[]>>) => {
        try {
            const params = new URLSearchParams();
            params.append('level', level.toString());
            if (parentId) params.append('parentId', parentId);

            const res = await fetch(`http://localhost:4000/api/locations?${params}`);
            const data = await res.json();
            setter(data || []);
        } catch (error) {
            console.error(`Error fetching locations for level ${level}:`, error);
            setter([]);
        }
    };

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

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '600' as const,
        color: '#0f172a'
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Region */}
            <div>
                <label style={labelStyle}>Region</label>
                <select
                    value={selectedRegion}
                    onChange={(e) => {
                        onRegionChange(e.target.value);
                        onProvinceChange('');
                        onDistrictChange('');
                        onLLGChange('');
                        onCompoundChange('');
                    }}
                    style={selectStyle}
                >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                        <option key={region.id} value={region.id}>
                            {region.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Province */}
            <div>
                <label style={labelStyle}>Province</label>
                <select
                    value={selectedProvince}
                    onChange={(e) => {
                        onProvinceChange(e.target.value);
                        onDistrictChange('');
                        onLLGChange('');
                        onCompoundChange('');
                    }}
                    disabled={!selectedRegion}
                    style={{
                        ...selectStyle,
                        opacity: !selectedRegion ? 0.5 : 1,
                        cursor: !selectedRegion ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                        <option key={province.id} value={province.id}>
                            {province.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* District */}
            <div>
                <label style={labelStyle}>District</label>
                <select
                    value={selectedDistrict}
                    onChange={(e) => {
                        onDistrictChange(e.target.value);
                        onLLGChange('');
                        onCompoundChange('');
                    }}
                    disabled={!selectedProvince}
                    style={{
                        ...selectStyle,
                        opacity: !selectedProvince ? 0.5 : 1,
                        cursor: !selectedProvince ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="">Select District</option>
                    {districts.map(district => (
                        <option key={district.id} value={district.id}>
                            {district.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* LLG */}
            <div>
                <label style={labelStyle}>LLG</label>
                <select
                    value={selectedLLG}
                    onChange={(e) => {
                        onLLGChange(e.target.value);
                        onCompoundChange('');
                    }}
                    disabled={!selectedDistrict}
                    style={{
                        ...selectStyle,
                        opacity: !selectedDistrict ? 0.5 : 1,
                        cursor: !selectedDistrict ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="">Select LLG</option>
                    {llgs.map(llg => (
                        <option key={llg.id} value={llg.id}>
                            {llg.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Compound/Suburb */}
            <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Compound/Suburb</label>
                <select
                    value={selectedCompound}
                    onChange={(e) => onCompoundChange(e.target.value)}
                    disabled={!selectedLLG}
                    style={{
                        ...selectStyle,
                        opacity: !selectedLLG ? 0.5 : 1,
                        cursor: !selectedLLG ? 'not-allowed' : 'pointer'
                    }}
                >
                    <option value="">Select Compound</option>
                    {compounds.map(compound => (
                        <option key={compound.id} value={compound.id}>
                            {compound.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LocationHierarchy;
