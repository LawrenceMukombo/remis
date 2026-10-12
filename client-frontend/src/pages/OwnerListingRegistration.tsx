import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ShieldCheck, ShieldAlert, Upload, CheckCircle2, 
  MapPin, AlertTriangle, ArrowLeft, DollarSign, FileText, 
  UserCheck, Camera, Info, HelpCircle, Lock, ChevronRight, Check,
  Trees, Briefcase, Warehouse, Home, Layers, Zap, Droplet,
  Compass, Crosshair, Navigation, RotateCcw, Copy, Globe, RefreshCw,
  Trash2, Image as ImageIcon, File, X, ExternalLink, Eye, Plus
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Basemap presets
export interface BasemapOption {
  id: string;
  name: string;
  icon: string;
  url: string;
  attribution: string;
  subdomains?: string[];
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'carto-voyager',
    name: 'CARTO Voyager',
    icon: '🧭',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_2wxx_1_19a2e48a7de2e23331436131',
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c', 'd']
  },
  {
    id: 'carto-positron',
    name: 'CARTO Positron',
    icon: '☀️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_2wxx_1_19a2e48a7de2e23331436131',
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c', 'd']
  },
  {
    id: 'carto-dark',
    name: 'CARTO Dark Matter',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_2wxx_1_19a2e48a7de2e23331436131',
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c', 'd']
  },
  {
    id: 'satellite',
    name: 'Satellite Aerial',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics'
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    icon: '🌍',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c']
  }
];

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  centroid: [number, number];
  defaultZoom: number;
  labels: {
    province: string;
    district: string;
    community: string;
  };
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  'Zambia': {
    code: 'ZM',
    name: 'Zambia',
    flag: '🇿🇲',
    centroid: [-13.1339, 27.8493],
    defaultZoom: 6,
    labels: { province: 'Province', district: 'District', community: 'Neighborhood / Settlement' }
  },
  'South Africa': {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    centroid: [-30.5595, 22.9375],
    defaultZoom: 6,
    labels: { province: 'Province', district: 'Municipality / City', community: 'Suburb / Township' }
  },
  'Papua New Guinea': {
    code: 'PG',
    name: 'Papua New Guinea',
    flag: '🇵🇬',
    centroid: [-6.3150, 143.9556],
    defaultZoom: 6,
    labels: { province: 'Region / Province', district: 'District', community: 'LLG / Community' }
  },
  'Australia': {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    centroid: [-25.2744, 133.7751],
    defaultZoom: 5,
    labels: { province: 'State / Territory', district: 'City / LGA', community: 'Suburb / Precinct' }
  },
  'United States': {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    centroid: [37.0902, -95.7129],
    defaultZoom: 5,
    labels: { province: 'State', district: 'County / Metro', community: 'Neighborhood / Locality' }
  },
  'Kenya': {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    centroid: [-0.0236, 37.9062],
    defaultZoom: 6,
    labels: { province: 'County', district: 'Sub-County', community: 'Ward / Estate' }
  }
};

// Centroid Coordinates Catalog
export const CENTROIDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  // Countries
  'Zambia': { lat: -13.1339, lng: 27.8493, zoom: 6 },
  'South Africa': { lat: -30.5595, lng: 22.9375, zoom: 6 },
  'Papua New Guinea': { lat: -6.3150, lng: 143.9556, zoom: 6 },
  'Australia': { lat: -25.2744, lng: 133.7751, zoom: 5 },
  'United States': { lat: 37.0902, lng: -95.7129, zoom: 5 },
  'Kenya': { lat: -0.0236, lng: 37.9062, zoom: 6 },

  // Zambian Provinces
  'Lusaka Province': { lat: -15.4167, lng: 28.2833, zoom: 11 },
  'Copperbelt Province': { lat: -12.8024, lng: 28.2132, zoom: 10 },
  'Central Province': { lat: -14.4431, lng: 28.4500, zoom: 9 },
  'Southern Province': { lat: -16.8500, lng: 26.9833, zoom: 9 },
  'Eastern Province': { lat: -13.6333, lng: 32.6500, zoom: 9 },
  'North-Western Province': { lat: -12.1833, lng: 26.4000, zoom: 9 },
  'Northern Province': { lat: -10.2167, lng: 31.1833, zoom: 9 },
  'Muchinga Province': { lat: -11.8333, lng: 31.4500, zoom: 9 },
  'Luapula Province': { lat: -11.1000, lng: 28.8833, zoom: 9 },
  'Western Province': { lat: -15.2833, lng: 23.1500, zoom: 9 },

  // Districts (Lusaka)
  'Lusaka District': { lat: -15.4167, lng: 28.2833, zoom: 13 },
  'Chilanga District': { lat: -15.5667, lng: 28.2667, zoom: 13 },
  'Kafue District': { lat: -15.7691, lng: 28.1814, zoom: 13 },
  'Chongwe District': { lat: -15.3292, lng: 28.6820, zoom: 13 },
  'Luangwa District': { lat: -15.6192, lng: 30.4181, zoom: 13 },
  'Chirundu District': { lat: -16.0410, lng: 28.8520, zoom: 13 },
  'Rufunsa District': { lat: -15.1167, lng: 29.4333, zoom: 13 },
  'Shibuyunji District': { lat: -15.2333, lng: 27.8500, zoom: 13 },

  // Districts (Copperbelt)
  'Kitwe District': { lat: -12.8024, lng: 28.2132, zoom: 13 },
  'Ndola District': { lat: -12.9667, lng: 28.6333, zoom: 13 },
  'Chingola District': { lat: -12.5333, lng: 27.8500, zoom: 13 },
  'Mufulira District': { lat: -12.5498, lng: 28.2407, zoom: 13 },
  'Luanshya District': { lat: -13.1367, lng: 28.4166, zoom: 13 },
  'Kalulushi District': { lat: -12.8392, lng: 28.0942, zoom: 13 },
  'Chililabombwe District': { lat: -12.3644, lng: 27.8229, zoom: 13 },
  'Lufwanyama District': { lat: -13.0000, lng: 27.5000, zoom: 12 },
  'Masaiti District': { lat: -13.1667, lng: 28.4167, zoom: 12 },
  'Mpongwe District': { lat: -13.5167, lng: 28.1500, zoom: 12 },

  // Districts (Central)
  'Kabwe District': { lat: -14.4431, lng: 28.4500, zoom: 13 },
  'Kapiri Mposhi District': { lat: -13.9715, lng: 28.6699, zoom: 13 },
  'Mkushi District': { lat: -13.6200, lng: 29.3900, zoom: 13 },
  'Chibombo District': { lat: -14.6500, lng: 28.0833, zoom: 13 },
  'Serenje District': { lat: -13.2325, lng: 30.2352, zoom: 13 },
  'Mumbwa District': { lat: -14.9833, lng: 27.0667, zoom: 13 },
  'Chisamba District': { lat: -14.9667, lng: 28.3667, zoom: 13 },
  'Itezhi-Tezhi District': { lat: -15.7500, lng: 26.0167, zoom: 13 },
  'Ngabwe District': { lat: -14.1500, lng: 27.6500, zoom: 13 },

  // Districts (Southern)
  'Livingstone District': { lat: -17.8419, lng: 25.8543, zoom: 13 },
  'Choma District': { lat: -16.8065, lng: 26.9875, zoom: 13 },
  'Mazabuka District': { lat: -15.8560, lng: 27.7480, zoom: 13 },
  'Monze District': { lat: -16.2833, lng: 27.4833, zoom: 13 },
  'Kalomo District': { lat: -17.0333, lng: 26.4833, zoom: 13 },
  'Siavonga District': { lat: -16.5380, lng: 28.7088, zoom: 13 },
  'Sinazongwe District': { lat: -17.2614, lng: 27.4619, zoom: 13 },

  // Districts (Eastern)
  'Chipata District': { lat: -13.6333, lng: 32.6500, zoom: 13 },
  'Katete District': { lat: -14.0500, lng: 32.0500, zoom: 13 },
  'Petauke District': { lat: -14.2426, lng: 31.3253, zoom: 13 },
  'Lundazi District': { lat: -12.2833, lng: 33.1833, zoom: 13 },

  // Districts (North-Western)
  'Solwezi District': { lat: -12.1833, lng: 26.4000, zoom: 13 },
  'Kalumbila District': { lat: -12.2167, lng: 25.3333, zoom: 13 },
  'Kasempa District': { lat: -13.4583, lng: 25.8333, zoom: 13 },
  'Mwinilunga District': { lat: -11.7333, lng: 24.4333, zoom: 13 },

  // Districts (Northern, Luapula, Muchinga, Western)
  'Kasama District': { lat: -10.2167, lng: 31.1833, zoom: 13 },
  'Mbala District': { lat: -8.8400, lng: 31.3700, zoom: 13 },
  'Mansa District': { lat: -11.1996, lng: 28.8943, zoom: 13 },
  'Samfya District': { lat: -11.3649, lng: 29.5565, zoom: 13 },
  'Chinsali District': { lat: -10.5414, lng: 32.0816, zoom: 13 },
  'Mpika District': { lat: -11.8343, lng: 31.4529, zoom: 13 },
  'Mongu District': { lat: -15.2833, lng: 23.1500, zoom: 13 },
  'Senanga District': { lat: -16.1167, lng: 23.2667, zoom: 13 },
  'Sesheke District': { lat: -17.4750, lng: 24.2960, zoom: 13 },

  // Lusaka Settlements
  'Kabulonga': { lat: -15.4212, lng: 28.3415, zoom: 15 },
  'Woodlands': { lat: -15.4410, lng: 28.3300, zoom: 15 },
  'Rhodes Park': { lat: -15.4120, lng: 28.3050, zoom: 15 },
  'Roma': { lat: -15.3850, lng: 28.3080, zoom: 15 },
  'Olympia Park': { lat: -15.3920, lng: 28.3010, zoom: 15 },
  'Sunningdale': { lat: -15.4280, lng: 28.3240, zoom: 15 },
  'Longacres': { lat: -15.4190, lng: 28.3120, zoom: 15 },
  'Fairview': { lat: -15.4170, lng: 28.2920, zoom: 15 },
  'Northmead': { lat: -15.4020, lng: 28.2910, zoom: 15 },
  'Thorn Park': { lat: -15.3970, lng: 28.2830, zoom: 15 },
  'Villa Elizabetha': { lat: -15.4050, lng: 28.2750, zoom: 15 },
  'Avondale': { lat: -15.3850, lng: 28.3750, zoom: 15 },
  'Chelstone': { lat: -15.3720, lng: 28.3880, zoom: 15 },
  'Ibex Hill': { lat: -15.4260, lng: 28.3750, zoom: 15 },
  'Salama Park': { lat: -15.3980, lng: 28.3680, zoom: 15 },
  'Silverest': { lat: -15.3650, lng: 28.4350, zoom: 15 },
  'Chilenje': { lat: -15.4480, lng: 28.3220, zoom: 15 },
  'Libala': { lat: -15.4420, lng: 28.3040, zoom: 15 },
  'Kabwata': { lat: -15.4330, lng: 28.2980, zoom: 15 },
  'Kamwala': { lat: -15.4280, lng: 28.2860, zoom: 15 },
  'Southgate': { lat: -15.4850, lng: 28.2900, zoom: 15 },
  'Lilayi': { lat: -15.5100, lng: 28.2950, zoom: 15 },
  'Makeni': { lat: -15.4650, lng: 28.2450, zoom: 15 },
  'Matero': { lat: -15.3820, lng: 28.2520, zoom: 15 },
  'George Compound': { lat: -15.3890, lng: 28.2400, zoom: 15 },
  'Kanyama': { lat: -15.4350, lng: 28.2500, zoom: 15 },
  'Chawama': { lat: -15.4580, lng: 28.2750, zoom: 15 },
  'Garden Compound': { lat: -15.3890, lng: 28.2870, zoom: 15 },
  'Mandevu': { lat: -15.3780, lng: 28.2780, zoom: 15 },
  'Chipata Compound': { lat: -15.3620, lng: 28.2700, zoom: 15 },
  'Kalingalinga': { lat: -15.4120, lng: 28.3350, zoom: 15 },
  'Mtendere': { lat: -15.4050, lng: 28.3480, zoom: 15 },
  'Bauleni': { lat: -15.4380, lng: 28.3580, zoom: 15 },
  'Mount Makulu': { lat: -15.5500, lng: 28.2500, zoom: 15 },
  'Shikoswe': { lat: -15.7500, lng: 28.1700, zoom: 15 },

  // Copperbelt Settlements
  'Riverside': { lat: -12.7950, lng: 28.2250, zoom: 15 },
  'Parklands': { lat: -12.8100, lng: 28.2200, zoom: 15 },
  'Nkana East': { lat: -12.8250, lng: 28.2100, zoom: 15 },
  'Nkana West': { lat: -12.8220, lng: 28.1900, zoom: 15 },
  'Kansenshi': { lat: -12.9580, lng: 28.6250, zoom: 15 },
  'Northrise': { lat: -12.9450, lng: 28.6480, zoom: 15 },
  'Itawa': { lat: -12.9850, lng: 28.6550, zoom: 15 },
  'Hillcrest': { lat: -12.9720, lng: 28.6400, zoom: 15 }
};

// Complete Zambia Hierarchy Catalog
export const ZAMBIA_HIERARCHY: Record<string, { districts: Record<string, string[]> }> = {
  'Lusaka Province': {
    districts: {
      'Lusaka District': [
        'Kabulonga', 'Woodlands', 'Rhodes Park', 'Roma', 'Olympia Park',
        'Sunningdale', 'Longacres', 'Fairview', 'Northmead', 'Thorn Park',
        'Villa Elizabetha', 'Avondale', 'Chelstone', 'Ibex Hill', 'Salama Park',
        'Silverest', 'Chilenje', 'Libala', 'Kabwata', 'Kamwala',
        'Southgate', 'Lilayi', 'Makeni', 'Matero', 'George Compound',
        'Kanyama', 'Chawama', 'Garden Compound', 'Mandevu', 'Chipata Compound',
        'Kalingalinga', 'Mtendere', 'Bauleni'
      ],
      'Chilanga District': ['Mount Makulu', 'Chilanga Central', 'Musamba', 'Parklands Chilanga'],
      'Kafue District': ['Shikoswe', 'Kafue Estates', 'Zambia Compound Kafue', 'Kasanya'],
      'Chongwe District': ['Chongwe Central', 'Silverest East', 'Chalimbana', 'Kanakantapa'],
      'Luangwa District': ['Feira', 'Luangwa Boma', 'Kaunga'],
      'Chirundu District': ['Chirundu Border', 'Highview Chirundu', 'Mission Area'],
      'Rufunsa District': ['Rufunsa Boma', 'Mpanshya', 'Chinyunyu Hot Springs'],
      'Shibuyunji District': ['Shibuyunji Boma', 'Nampundwe Mine Community']
    }
  },
  'Copperbelt Province': {
    districts: {
      'Kitwe District': [
        'Riverside', 'Parklands', 'Nkana East', 'Nkana West', 'Chimwemwe',
        'Kwacha', 'Garneton', 'Mindolo', 'Wusakile', 'Chamboli',
        'Buchi', 'Luangwa Kitwe', 'Bulangililo', 'Chachacha'
      ],
      'Ndola District': [
        'Kansenshi', 'Northrise', 'Itawa', 'Hillcrest', 'Masala',
        'Chifubu', 'Lubuto', 'Twapia', 'Mushili', 'Kabushi', 'Kaniki'
      ],
      'Chingola District': ['Nchanga North', 'Nchanga South', 'Riverside Chingola', 'Chiwempala', 'Kabundi', 'Kasompe'],
      'Mufulira District': ['Kantanshi', 'Kamuchanga', 'Fairview Mufulira', 'Kansuswa', 'Eastlea'],
      'Luanshya District': ['Mikomfwa', 'Roan', 'Mpatamatu', 'New Town Luanshya', 'Town Centre Luanshya'],
      'Kalulushi District': ['Chibuluma', 'Kalulushi Central', 'South Downs'],
      'Chililabombwe District': ['Kamenza', 'Kakoso', 'Kasumbalesa Border'],
      'Lufwanyama District': ['Lufwanyama Boma', 'Kagem Gemstone Area'],
      'Masaiti District': ['Masaiti Boma', 'Kafulafuta'],
      'Mpongwe District': ['Mpongwe Central', 'Kanyenda']
    }
  },
  'Central Province': {
    districts: {
      'Kabwe District': ['Highridge', 'Bwacha', 'Makululu', 'Kasanda', 'Luangwa Kabwe', 'Town Centre'],
      'Kapiri Mposhi District': ['Kapiri Central', 'Tazara Area', 'Nkonde'],
      'Mkushi District': ['Mkushi Farming Block', 'Mkushi Boma', 'Upper Lunsemfwa'],
      'Chibombo District': ['Chibombo Boma', 'Liteta', 'Keembe'],
      'Serenje District': ['Serenje Boma', 'Mulembo', 'Kundalila Falls Area'],
      'Mumbwa District': ['Mumbwa Central', 'Nangoma', 'Myooye'],
      'Chisamba District': ['Chisamba Farming Block', 'Chisamba Town'],
      'Itezhi-Tezhi District': ['Itezhi-Tezhi Town', 'Kafue National Park Gate'],
      'Ngabwe District': ['Ngabwe Boma', 'Kafue River Basin']
    }
  },
  'Southern Province': {
    districts: {
      'Livingstone District': ['Dambwa', 'Maramba', 'Highlands Livingstone', 'Town Centre', 'Mosi-oa-Tunya Resort Area'],
      'Choma District': ['Macha', 'Batoka', 'Mochipapa', 'Choma Central'],
      'Mazabuka District': ['Nakambala Sugar Estate', 'Hillside Mazabuka', 'Town Centre'],
      'Monze District': ['Monze Central', 'Moorings', 'Bweengwa'],
      'Kalomo District': ['Kalomo Boma', 'Siachitembo'],
      'Siavonga District': ['Lake Kariba Shoreline', 'Siavonga Boma', 'Kariba Dam View'],
      'Sinazongwe District': ['Sinazongwe Boma', 'Maamba Mine Area', 'Lake Kariba North']
    }
  },
  'Eastern Province': {
    districts: {
      'Chipata District': ['Kapata', 'Kalongwezi', 'Umodzi', 'Moth Area', 'Msekera'],
      'Katete District': ['Katete Boma', 'St. Francis Area', 'Chimeza'],
      'Petauke District': ['Petauke Central', 'Nyimba Border Area', 'Ming\'omba'],
      'Lundazi District': ['Lundazi Boma', 'Chikomeni', 'Castle Area']
    }
  },
  'North-Western Province': {
    districts: {
      'Solwezi District': ['Kansanshi Mine Area', 'Kansanshi Golf Estate', 'Kimasala', 'Messenger', 'Tumvwanganai', 'Kitepo'],
      'Kalumbila District': ['Kalumbila Town', 'Trident Mine Town', 'Kisasa'],
      'Kasempa District': ['Kasempa Boma', 'Mukinge', 'Kelongwa'],
      'Mwinilunga District': ['Mwinilunga Boma', 'Ikelenge Border', 'Zambezi Source Area']
    }
  },
  'Northern Province': {
    districts: {
      'Kasama District': ['Kasama Central', 'Chikumanino', 'Location', 'Mungwi Road'],
      'Mbala District': ['Mbala Boma', 'Lake Chila Area'],
      'Mpulungu District': ['Lake Tanganyika Port', 'Mpulungu Town']
    }
  },
  'Luapula Province': {
    districts: {
      'Mansa District': ['Mansa Central', 'Senama', 'Kaole'],
      'Samfya District': ['Lake Bangweulu Beach Front', 'Samfya Boma']
    }
  },
  'Muchinga Province': {
    districts: {
      'Chinsali District': ['Chinsali Boma', 'Ilondola'],
      'Mpika District': ['Mpika Central', 'Tazara Area', 'Danger Hill Area']
    }
  },
  'Western Province': {
    districts: {
      'Mongu District': ['Mongu Boma', 'Limulunga Royal Village', 'Malengwa'],
      'Senanga District': ['Senanga Boma', 'Zambezi Riverfront'],
      'Sesheke District': ['Sesheke Border', 'Katima Mulilo Bridge Area']
    }
  }
};

// Global Multi-Country Hierarchy Catalog
export const GLOBAL_HIERARCHIES: Record<string, Record<string, { districts: Record<string, string[]> }>> = {
  'Papua New Guinea': {
    'National Capital District': {
      districts: {
        'Port Moresby': ['Boroko', 'Waigani', 'Downtown Port Moresby', 'Gordons', 'Hohola', 'Koki', 'Saraga']
      }
    },
    'Morobe Province': {
      districts: {
        'Lae District': ['Top Town Lae', 'Eriku', 'Taraka', 'Main Market', 'Bumbu']
      }
    }
  },
  'South Africa': {
    'Gauteng': {
      districts: {
        'City of Johannesburg': ['Sandton', 'Rosebank', 'Midrand', 'Fourways', 'Braamfontein'],
        'City of Tshwane': ['Pretoria Central', 'Centurion', 'Menlyn', 'Hatfield']
      }
    },
    'Western Cape': {
      districts: {
        'City of Cape Town': ['Cape Town CBD', 'Camps Bay', 'Sea Point', 'Claremont', 'Bellville']
      }
    }
  },
  'Australia': {
    'New South Wales': {
      districts: {
        'Sydney Metro': ['Sydney CBD', 'Parramatta', 'North Sydney', 'Chatswood', 'Bondi Junction']
      }
    },
    'Victoria': {
      districts: {
        'Melbourne Metro': ['Melbourne CBD', 'Southbank', 'Docklands', 'Richmond', 'St Kilda']
      }
    }
  },
  'United States': {
    'New York': {
      districts: {
        'New York City': ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
      }
    },
    'California': {
      districts: {
        'Los Angeles County': ['Downtown LA', 'Santa Monica', 'Pasadena', 'Long Beach'],
        'San Francisco Bay Area': ['San Francisco', 'Oakland', 'San Jose', 'Berkeley']
      }
    }
  },
  'Kenya': {
    'Nairobi County': {
      districts: {
        'Nairobi Central': ['Westlands', 'Kilimani', 'Upper Hill', 'Karen', 'Lavington', 'Kileleshwa']
      }
    },
    'Mombasa County': {
      districts: {
        'Mombasa City': ['Nyali', 'Kizingo', 'Bamburi', 'Old Town Mombasa']
      }
    }
  }
};

// Interactive Map Fly Controller component
const MapFlyController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom]);
  return null;
};

// Interactive Map Picker component with drag & click
const LocationPicker: React.FC<{
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
}> = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange([Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))]);
    }
  });

  return (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          onPositionChange([Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6))]);
        }
      }}
    />
  );
};

export const OwnerListingRegistration: React.FC = () => {
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [blacklistedAlert, setBlacklistedAlert] = useState<{ isBlacklisted: boolean; reason?: string } | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Basic Details
    title: '',
    listingType: 'LEASE', // LEASE or SALE
    propertyType: 'RESIDENTIAL', // RESIDENTIAL, COMMERCIAL, INDUSTRIAL, LAND
    salePrice: '',
    saleNegotiable: 'NEGOTIABLE', // NEGOTIABLE, FIRM, OFFERS_INVITED
    monthlyRent: '',
    deposit: '',
    rentPaymentTerms: 'MONTHLY', // MONTHLY, QUARTERLY, BIANNUALLY

    // Land / Plot / Farm Specific Fields
    landSize: '',
    landSizeUnit: 'SQM', // SQM, HECTARES, ACRES
    landTenure: '99_YEAR_LEASEHOLD', // 99_YEAR_LEASEHOLD, CUSTOMARY, COUNCIL_OFFER, FREEHOLD
    landZoning: 'RESIDENTIAL', // RESIDENTIAL, COMMERCIAL, AGRICULTURAL, INDUSTRIAL, HOSPITALITY
    landTopography: 'FLAT', // FLAT, GENTLE_SLOPE, HILLSIDE, WATERFRONT
    landRoadAccess: 'TARRED', // TARRED, GRAVEL, DIRT, TRACK
    landWaterElectricity: 'ZESCO_AND_BOREHOLE', // ZESCO_AND_BOREHOLE, ZESCO_NEARBY, BOREHOLE_ONLY, OFF_GRID, UNDEVELOPED
    landFencing: 'WALLED', // WALLED, WIRE, BEACONS, UNFENCED
    landSoilType: 'RED_LOAM', // RED_LOAM, SANDY_LOAM, CLAY, BLACK_COTTON
    landLeaseDuration: '10', // years for lease

    // Commercial Specific Fields
    commercialSubType: 'OFFICE_SUITE', // OFFICE_SUITE, RETAIL_STORE, COMMERCIAL_PLAZA, BANKING_HALL, MEDICAL_SUITE, RESTAURANT
    commercialLettableArea: '', // sqm
    commercialFloorLevel: 'GROUND_FLOOR', // GROUND_FLOOR, 1ST_FLOOR, ENTIRE_BUILDING, BASEMENT
    commercialTotalFloors: '1',
    commercialFitout: 'FITTED', // FITTED, OPEN_PLAN, SHELL_AND_CORE
    commercialParkingBays: '5',
    commercialVisitorParking: 'AMPLE_ON_SITE', // AMPLE_ON_SITE, BASEMENT, STREET
    commercialServiceCharge: '', // ZMW/month
    commercialEscalationRate: '10', // % per annum
    commercialMinLeaseTerm: '1_YEAR', // 1_YEAR, 2_YEARS, 3_YEARS, 5_YEARS
    commercialNetYield: '', // % for sale
    commercialTenancyStatus: 'VACANT', // VACANT, FULLY_TENANTED, PARTIALLY_TENANTED
    commercialBackupGenerator: true,
    commercialElevator: false,
    commercialFibreInternet: true,
    commercialCentralAC: true,
    commercialBoreholeWater: true,

    // Industrial Specific Fields
    industrialSubType: 'WAREHOUSE_DISTRIBUTION', // WAREHOUSE_DISTRIBUTION, FACTORY, HEAVY_YARD, COLD_STORAGE
    industrialWarehouseArea: '', // sqm
    industrialYardArea: '', // sqm
    industrialEavesHeight: '8', // metres
    industrialPowerSupply: 'THREE_PHASE', // THREE_PHASE, SUBSTATION, SINGLE_PHASE
    industrialRollerShutters: '2',
    industrialSuperlinkAccess: true,
    industrialGuardedGate: true,
    industrialFireHydrant: true,
    industrialWeighbridge: false,

    // Residential Specific Fields
    residentialSubType: 'STANDALONE_HOUSE', // STANDALONE_HOUSE, GATED_VILLA, APARTMENT, TOWNHOUSE, HOSTELS, PENTHOUSE
    bedrooms: '3',
    bathrooms: '2',
    residentialEnSuiteCount: '1',
    areaSqm: '240',
    residentialPlotSize: '600',
    residentialFurnishing: 'UNFURNISHED', // UNFURNISHED, SEMI_FURNISHED, FULLY_FURNISHED
    residentialSwimmingPool: false,
    residentialBorehole: true,
    residentialSolarBackup: true,
    residentialMotorizedGate: true,
    residentialStaffQuarters: false,
    residentialPetFriendly: true,

    description: '',
    
    // Location
    country: 'Zambia',
    province: 'Lusaka Province',
    district: 'Lusaka District',
    community: 'Kabulonga',
    address: 'Plot 418, Kudu Road, Kabulonga',
    latitude: -15.4212,
    longitude: 28.3415,

    // Proof of Ownership & Verification
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '+260',
    nationalId: '', // NRC or Passport
    titleDeedNumber: '',
    parcelNumber: '',
    deedDocumentUrl: '',
    idDocumentUrl: '',
    ratesStatementUrl: '',
    legalDeclaration: false,

    // Uploaded Documents
    deedFiles: [] as Array<{ name: string; url: string; size?: number }>,
    idFiles: [] as Array<{ name: string; url: string; size?: number }>,
    ratesFiles: [] as Array<{ name: string; url: string; size?: number }>,

    // Photos
    images: [] as string[]
  });

  // File and photo upload states
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean>(false);
  const [showManualDocInputs, setShowManualDocInputs] = useState<boolean>(false);

  // Map and Location Cascade State
  const [selectedBasemap, setSelectedBasemap] = useState<string>('carto-voyager');
  const [mapTarget, setMapTarget] = useState<{ center: [number, number]; zoom: number }>({
    center: [-15.4212, 28.3415],
    zoom: 13
  });
  const [locating, setLocating] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [isCustomCommunity, setIsCustomCommunity] = useState<boolean>(false);

  // Active Country Config & Hierarchy
  const activeCountryConfig = COUNTRY_CONFIGS[formData.country] || COUNTRY_CONFIGS['Zambia'];

  // Dynamic Provinces list
  const availableProvinces = formData.country === 'Zambia' 
    ? Object.keys(ZAMBIA_HIERARCHY)
    : (GLOBAL_HIERARCHIES[formData.country] ? Object.keys(GLOBAL_HIERARCHIES[formData.country]) : []);

  // Dynamic Districts list based on selected province
  const availableDistricts = formData.country === 'Zambia'
    ? Object.keys(ZAMBIA_HIERARCHY[formData.province]?.districts || {})
    : (GLOBAL_HIERARCHIES[formData.country]?.[formData.province] 
      ? Object.keys(GLOBAL_HIERARCHIES[formData.country][formData.province].districts) 
      : []);

  // Dynamic Communities list based on selected district
  const availableCommunities = formData.country === 'Zambia'
    ? (ZAMBIA_HIERARCHY[formData.province]?.districts[formData.district] || [])
    : (GLOBAL_HIERARCHIES[formData.country]?.[formData.province]?.districts[formData.district] || []);

  // Handle Country selection with centroid fly-to
  const handleCountrySelect = (newCountry: string) => {
    const config = COUNTRY_CONFIGS[newCountry] || COUNTRY_CONFIGS['Zambia'];
    const provs = newCountry === 'Zambia' 
      ? Object.keys(ZAMBIA_HIERARCHY) 
      : (GLOBAL_HIERARCHIES[newCountry] ? Object.keys(GLOBAL_HIERARCHIES[newCountry]) : []);
    const firstProv = provs[0] || '';
    
    let firstDist = '';
    let firstComm = '';
    if (newCountry === 'Zambia' && firstProv) {
      const dists = Object.keys(ZAMBIA_HIERARCHY[firstProv]?.districts || {});
      firstDist = dists[0] || '';
      if (firstDist) {
        firstComm = ZAMBIA_HIERARCHY[firstProv].districts[firstDist]?.[0] || '';
      }
    } else if (GLOBAL_HIERARCHIES[newCountry] && firstProv) {
      const dists = Object.keys(GLOBAL_HIERARCHIES[newCountry][firstProv]?.districts || {});
      firstDist = dists[0] || '';
      if (firstDist) {
        firstComm = GLOBAL_HIERARCHIES[newCountry][firstProv].districts[firstDist]?.[0] || '';
      }
    }

    const centroid = CENTROIDS[newCountry] || { lat: config.centroid[0], lng: config.centroid[1], zoom: config.defaultZoom };

    setFormData(prev => ({
      ...prev,
      country: newCountry,
      province: firstProv,
      district: firstDist,
      community: firstComm,
      latitude: centroid.lat,
      longitude: centroid.lng
    }));
    setIsCustomCommunity(false);
    setMapTarget({ center: [centroid.lat, centroid.lng], zoom: centroid.zoom });
  };

  // Handle Province selection
  const handleProvinceSelect = (newProvince: string) => {
    let firstDist = '';
    let firstComm = '';
    if (formData.country === 'Zambia') {
      const dists = Object.keys(ZAMBIA_HIERARCHY[newProvince]?.districts || {});
      firstDist = dists[0] || '';
      if (firstDist) {
        firstComm = ZAMBIA_HIERARCHY[newProvince].districts[firstDist]?.[0] || '';
      }
    } else if (GLOBAL_HIERARCHIES[formData.country]) {
      const dists = Object.keys(GLOBAL_HIERARCHIES[formData.country][newProvince]?.districts || {});
      firstDist = dists[0] || '';
      if (firstDist) {
        firstComm = GLOBAL_HIERARCHIES[formData.country][newProvince].districts[firstDist]?.[0] || '';
      }
    }

    const provCentroid = CENTROIDS[newProvince] || CENTROIDS[formData.country] || { lat: -15.4167, lng: 28.2833, zoom: 10 };

    setFormData(prev => ({
      ...prev,
      province: newProvince,
      district: firstDist,
      community: firstComm,
      latitude: provCentroid.lat,
      longitude: provCentroid.lng
    }));
    setIsCustomCommunity(false);
    setMapTarget({ center: [provCentroid.lat, provCentroid.lng], zoom: provCentroid.zoom });
  };

  // Handle District selection
  const handleDistrictSelect = (newDistrict: string) => {
    let firstComm = '';
    if (formData.country === 'Zambia') {
      const comms = ZAMBIA_HIERARCHY[formData.province]?.districts[newDistrict] || [];
      firstComm = comms[0] || '';
    } else if (GLOBAL_HIERARCHIES[formData.country]) {
      const comms = GLOBAL_HIERARCHIES[formData.country]?.[formData.province]?.districts[newDistrict] || [];
      firstComm = comms[0] || '';
    }

    const distCentroid = CENTROIDS[newDistrict] || CENTROIDS[formData.province] || { lat: -15.4167, lng: 28.2833, zoom: 13 };

    setFormData(prev => ({
      ...prev,
      district: newDistrict,
      community: firstComm,
      latitude: distCentroid.lat,
      longitude: distCentroid.lng
    }));
    setIsCustomCommunity(false);
    setMapTarget({ center: [distCentroid.lat, distCentroid.lng], zoom: distCentroid.zoom });
  };

  // Handle Community selection
  const handleCommunitySelect = (newCommunity: string) => {
    if (newCommunity === '__CUSTOM__') {
      setIsCustomCommunity(true);
      setFormData(prev => ({ ...prev, community: '' }));
      return;
    }

    setIsCustomCommunity(false);
    const commCentroid = CENTROIDS[newCommunity] || CENTROIDS[formData.district] || { lat: formData.latitude, lng: formData.longitude, zoom: 15 };

    setFormData(prev => ({
      ...prev,
      community: newCommunity,
      latitude: commCentroid.lat,
      longitude: commCentroid.lng
    }));
    setMapTarget({ center: [commCentroid.lat, commCentroid.lng], zoom: commCentroid.zoom || 15 });
  };

  // Geolocation: Find real current GPS position
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setMapTarget({ center: [lat, lng], zoom: 16 });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        console.warn("Geolocation warning:", err);
        alert(`Could not acquire GPS position (${err.message}). You can select your district or click on the map to place the pin.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Copy coordinates to clipboard
  const handleCopyCoordinates = () => {
    const text = `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Re-center on district or country
  const handleResetCentroid = (type: 'country' | 'province' | 'district') => {
    let key = formData.district;
    let fallbackZoom = 13;
    if (type === 'country') {
      key = formData.country;
      fallbackZoom = 6;
    } else if (type === 'province') {
      key = formData.province;
      fallbackZoom = 10;
    }

    const c = CENTROIDS[key] || { lat: formData.latitude, lng: formData.longitude, zoom: fallbackZoom };
    setFormData(prev => ({ ...prev, latitude: c.lat, longitude: c.lng }));
    setMapTarget({ center: [c.lat, c.lng], zoom: c.zoom });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Upload multiple files to server or fallback to resilient DataURL preview
  const uploadFiles = async (fileList: FileList | null): Promise<Array<{ name: string; url: string; size: number }>> => {
    if (!fileList || fileList.length === 0) return [];
    const files = Array.from(fileList);
    const results: Array<{ name: string; url: string; size: number }> = [];

    for (const file of files) {
      let uploadedUrl: string | null = null;
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/upload/file`, {
          method: 'POST',
          body: fd
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrl = data.url || `${API_BASE.replace('/api', '')}/${data.filename}`;
        }
      } catch (err) {
        console.warn("Backend file upload failed, switching to local data URL:", err);
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      results.push({ name: file.name, url: uploadedUrl, size: file.size });
    }

    return results;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingPhotos(true);
    try {
      const uploaded = await uploadFiles(e.target.files);
      const newUrls = uploaded.map(u => u.url);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newUrls]
      }));
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDocUpload = async (category: 'deed' | 'id' | 'rates', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingDoc(category);
    try {
      const uploaded = await uploadFiles(e.target.files);
      if (category === 'deed') {
        setFormData(prev => ({
          ...prev,
          deedFiles: [...prev.deedFiles, ...uploaded],
          deedDocumentUrl: prev.deedDocumentUrl || uploaded[0]?.url || ''
        }));
      } else if (category === 'id') {
        setFormData(prev => ({
          ...prev,
          idFiles: [...prev.idFiles, ...uploaded],
          idDocumentUrl: prev.idDocumentUrl || uploaded[0]?.url || ''
        }));
      } else if (category === 'rates') {
        setFormData(prev => ({
          ...prev,
          ratesFiles: [...prev.ratesFiles, ...uploaded],
          ratesStatementUrl: prev.ratesStatementUrl || uploaded[0]?.url || ''
        }));
      }
    } finally {
      setUploadingDoc(null);
      e.target.value = '';
    }
  };

  const handleRemoveDoc = (category: 'deed' | 'id' | 'rates', index: number) => {
    if (category === 'deed') {
      setFormData(prev => {
        const deedFiles = prev.deedFiles.filter((_, i) => i !== index);
        return {
          ...prev,
          deedFiles,
          deedDocumentUrl: deedFiles.length > 0 ? deedFiles[0].url : ''
        };
      });
    } else if (category === 'id') {
      setFormData(prev => {
        const idFiles = prev.idFiles.filter((_, i) => i !== index);
        return {
          ...prev,
          idFiles,
          idDocumentUrl: idFiles.length > 0 ? idFiles[0].url : ''
        };
      });
    } else if (category === 'rates') {
      setFormData(prev => {
        const ratesFiles = prev.ratesFiles.filter((_, i) => i !== index);
        return {
          ...prev,
          ratesFiles,
          ratesStatementUrl: ratesFiles.length > 0 ? ratesFiles[0].url : ''
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.legalDeclaration) {
      alert("Please confirm the legal anti-fraud declaration to proceed.");
      return;
    }

    setSubmitting(true);
    setBlacklistedAlert(null);

    try {
      // Build category specifications object
      let categorySpecs: any = {};
      if (formData.propertyType === 'LAND') {
        categorySpecs = {
          land_size: formData.landSize,
          land_size_unit: formData.landSizeUnit,
          title_tenure: formData.landTenure,
          zoning_use: formData.landZoning,
          topography: formData.landTopography,
          road_access: formData.landRoadAccess,
          utilities: formData.landWaterElectricity,
          fencing: formData.landFencing,
          soil_type: formData.landSoilType,
          lease_duration_years: formData.listingType === 'LEASE' ? formData.landLeaseDuration : null
        };
      } else if (formData.propertyType === 'COMMERCIAL') {
        categorySpecs = {
          commercial_subtype: formData.commercialSubType,
          lettable_area_sqm: formData.commercialLettableArea,
          floor_level: formData.commercialFloorLevel,
          total_floors: formData.commercialTotalFloors,
          fitout_condition: formData.commercialFitout,
          parking_bays: formData.commercialParkingBays,
          visitor_parking: formData.commercialVisitorParking,
          service_charge_monthly: formData.commercialServiceCharge,
          annual_escalation_pct: formData.commercialEscalationRate,
          minimum_lease_term: formData.commercialMinLeaseTerm,
          net_yield_pct: formData.commercialNetYield,
          tenancy_status: formData.commercialTenancyStatus,
          backup_generator: formData.commercialBackupGenerator,
          elevator_lifts: formData.commercialElevator,
          fibre_internet: formData.commercialFibreInternet,
          central_ac: formData.commercialCentralAC,
          borehole_water: formData.commercialBoreholeWater
        };
      } else if (formData.propertyType === 'INDUSTRIAL') {
        categorySpecs = {
          industrial_subtype: formData.industrialSubType,
          warehouse_area_sqm: formData.industrialWarehouseArea,
          yard_area_sqm: formData.industrialYardArea,
          eaves_height_meters: formData.industrialEavesHeight,
          power_supply: formData.industrialPowerSupply,
          roller_shutters: formData.industrialRollerShutters,
          superlink_access: formData.industrialSuperlinkAccess,
          guarded_gate: formData.industrialGuardedGate,
          fire_hydrant: formData.industrialFireHydrant,
          weighbridge: formData.industrialWeighbridge
        };
      } else {
        categorySpecs = {
          residential_subtype: formData.residentialSubType,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          ensuite_bedrooms: formData.residentialEnSuiteCount,
          floor_area_sqm: formData.areaSqm,
          plot_size_sqm: formData.residentialPlotSize,
          furnishing_status: formData.residentialFurnishing,
          swimming_pool: formData.residentialSwimmingPool,
          borehole_water: formData.residentialBorehole,
          solar_inverter: formData.residentialSolarBackup,
          motorized_gate: formData.residentialMotorizedGate,
          staff_quarters: formData.residentialStaffQuarters,
          pet_friendly: formData.residentialPetFriendly
        };
      }

      // Prepare images or contextual default
      const finalImages = formData.images.length > 0 ? formData.images : [
        formData.propertyType === 'LAND'
          ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
          : formData.propertyType === 'COMMERCIAL'
            ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
            : formData.propertyType === 'INDUSTRIAL'
              ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
              : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ];

      const deedUrls = formData.deedFiles.map(f => f.url);
      const idUrls = formData.idFiles.map(f => f.url);
      const ratesUrls = formData.ratesFiles.map(f => f.url);

      const effectiveDeedUrl = deedUrls.length > 0 ? deedUrls.join(',') : (formData.deedDocumentUrl || 'https://remis.org/deed-placeholder.pdf');
      const effectiveIdUrl = idUrls.length > 0 ? idUrls.join(',') : (formData.idDocumentUrl || null);
      const effectiveRatesUrl = ratesUrls.length > 0 ? ratesUrls.join(',') : (formData.ratesStatementUrl || null);

      categorySpecs.deed_files = formData.deedFiles;
      categorySpecs.id_files = formData.idFiles;
      categorySpecs.rates_files = formData.ratesFiles;

      const payload = {
        name: formData.title,
        address: formData.address,
        type: formData.propertyType,
        listing_type: formData.listingType,
        sale_price: formData.listingType === 'SALE' ? Number(formData.salePrice) : null,
        monthly_rent: formData.listingType === 'LEASE' ? Number(formData.monthlyRent) : null,
        deposit: formData.listingType === 'LEASE' ? Number(formData.deposit) : null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        country: formData.country,
        province: formData.province,
        district: formData.district,
        llg: formData.community,
        description: formData.description,
        images: finalImages,

        // Extracted dimension fields for direct column mapping
        landArea: formData.propertyType === 'LAND' ? Number(formData.landSize) : (formData.propertyType === 'COMMERCIAL' ? Number(formData.commercialLettableArea) : (formData.propertyType === 'INDUSTRIAL' ? Number(formData.industrialWarehouseArea) : Number(formData.areaSqm))),
        floor_count: formData.propertyType === 'COMMERCIAL' ? Number(formData.commercialTotalFloors) : null,
        parking_spaces: formData.propertyType === 'COMMERCIAL' ? Number(formData.commercialParkingBays) : null,
        specifications: categorySpecs,
        
        // Ownership verification credentials
        owner_name: formData.ownerName,
        owner_email: formData.ownerEmail,
        owner_phone: formData.ownerPhone,
        national_id: formData.nationalId,
        title_deed_number: formData.titleDeedNumber,
        parcel_number: formData.parcelNumber,
        deed_url: effectiveDeedUrl,
        id_doc_url: effectiveIdUrl,
        rates_statement_url: effectiveRatesUrl,
        verified_declaration: formData.legalDeclaration
      };

      const res = await fetch(`${API_BASE}/marketplace/owner/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 403 && data.isBlacklisted) {
        setBlacklistedAlert({
          isBlacklisted: true,
          reason: data.reason || data.message
        });
      } else if (res.ok && data.success) {
        setSubmitSuccess(data);
      } else {
        alert(data.message || "Failed to register property listing");
      }
    } catch (err: any) {
      console.error("Listing submission error:", err);
      alert("Network error: Could not reach verification server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="owner-listing-container">
      {/* Top Navigation */}
      <header className="owner-header">
        <div className="header-brand" onClick={() => navigate('/')}>
          <ArrowLeft size={20} className="back-btn" />
          <Building2 className="brand-icon" />
          <span className="brand-name">REMIS Marketplace</span>
          <span className="portal-tag">Owner Portal</span>
        </div>

        <div className="security-status-indicator">
          <ShieldCheck size={18} className="shield-green" />
          <span>Verified Ownership Registry</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="owner-body">
        {/* If Flagged */}
        {blacklistedAlert && (
          <div className="fraud-intercept-banner">
            <div className="fraud-icon-box">
              <ShieldAlert size={48} />
            </div>
            <div className="fraud-text-box">
              <h2>Registration Could Not Be Completed</h2>
              <p className="fraud-desc">
                This submission could not be verified by our compliance screening.
              </p>
              <div className="fraud-reason">
                <strong>Reason:</strong> {blacklistedAlert.reason}
              </div>
              <p className="fraud-action">
                To maintain listing security, unverified submissions cannot be published online. If you believe this is in error, please contact our support team at <code>compliance@remis.org</code>.
              </p>
              <button className="btn-return" onClick={() => navigate('/')}>
                Return to Public Portal
              </button>
            </div>
          </div>
        )}

        {/* If Submission Successful */}
        {submitSuccess && !blacklistedAlert && (
          <div className="success-banner">
            <div className="success-icon-box">
              <CheckCircle2 size={54} color="#10b981" />
            </div>
            <h2>Property Registered Successfully!</h2>
            <p className="success-sub">
              Your property has been received with reference <strong>{submitSuccess.propertyId}</strong>.
            </p>

            <div className="audit-timeline-card">
              <div className="timeline-item done">
                <div className="timeline-node"><Check size={14} /></div>
                <div>
                  <h4>1. Submission & Review</h4>
                  <p>Owner credentials recorded</p>
                </div>
              </div>
              <div className="timeline-item in-progress">
                <div className="timeline-node">2</div>
                <div>
                  <h4>2. Title & Document Verification</h4>
                  <p>Auditing property records for Stand #{formData.parcelNumber || 'Parcel'}</p>
                </div>
              </div>
              <div className="timeline-item pending">
                <div className="timeline-node">3</div>
                <div>
                  <h4>3. Verified Listing Activation</h4>
                  <p>Property published to search with verified owner badge</p>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={() => navigate('/')}>
                View Public Marketplace
              </button>
              <button className="btn-secondary" onClick={() => window.location.reload()}>
                Register Another Property
              </button>
            </div>
          </div>
        )}

        {/* Wizard Form */}
        {!submitSuccess && !blacklistedAlert && (
          <div className="wizard-card">
            {/* Wizard Header */}
            <div className="wizard-hero">
              <div className="hero-badge">
                <ShieldCheck size={16} /> Verified Owner Registry
              </div>
              <h1>Register Your Property for Lease or Sale</h1>
              <p>
                Join verified property owners. Our title verification gives tenants and buyers confidence, ensuring authentic and trusted listings.
              </p>

              {/* Progress Steps */}
              <div className="step-bar">
                <div className={`step-item ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
                  <span className="step-num">1</span>
                  <span className="step-label">Property Details</span>
                </div>
                <ChevronRight size={16} className="step-arrow" />
                <div className={`step-item ${step >= 2 ? 'active' : ''}`} onClick={() => setStep(2)}>
                  <span className="step-num">2</span>
                  <span className="step-label">Location & Map</span>
                </div>
                <ChevronRight size={16} className="step-arrow" />
                <div className={`step-item ${step >= 3 ? 'active' : ''}`} onClick={() => setStep(3)}>
                  <span className="step-num">3</span>
                  <span className="step-label">Ownership & Verification</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form-content">
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="form-step fade-in">
                  <h3 className="section-title">
                    <Building2 size={20} /> Property Overview & Financials
                  </h3>
                  <p className="section-desc">
                    Specify the property details and financial terms.
                  </p>

                  <div className="form-grid">
                    {/* Title */}
                    <div className="form-group full-width">
                      <label>Listing Title *</label>
                      <input 
                        type="text" 
                        name="title" 
                        required 
                        placeholder={
                          formData.propertyType === 'LAND' 
                            ? "e.g. Prime 5-Acre Commercial Plot with 99-Year Title along Great East Road" 
                            : formData.propertyType === 'COMMERCIAL'
                              ? "e.g. Modern 4-Storey Corporate Office Complex with Standby Generator"
                              : formData.propertyType === 'INDUSTRIAL'
                                ? "e.g. 2,500 sqm High-Bay Logistics Warehouse with 3-Phase Power"
                                : "e.g. Executive 4-Bedroom House with Swimming Pool & Solar Backup"
                        }
                        value={formData.title} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    {/* Transaction Type */}
                    <div className="form-group">
                      <label>Transaction Type *</label>
                      <select name="listingType" value={formData.listingType} onChange={handleInputChange}>
                        <option value="LEASE">For Lease / Rent</option>
                        <option value="SALE">For Sale</option>
                      </select>
                    </div>

                    {/* Property Category */}
                    <div className="form-group">
                      <label>Property Category *</label>
                      <select name="propertyType" value={formData.propertyType} onChange={handleInputChange}>
                        <option value="RESIDENTIAL">Residential (House, Apartment, Villa)</option>
                        <option value="COMMERCIAL">Commercial (Office, Retail, Plaza)</option>
                        <option value="INDUSTRIAL">Industrial (Warehouse, Yard)</option>
                        <option value="LAND">Land / Plot / Farm</option>
                      </select>
                    </div>



                    {/* FINANCIALS SECTION */}
                    <div className="full-width form-subheading">
                      <DollarSign size={16} /> Financial & Commercial Terms
                    </div>

                    {formData.listingType === 'SALE' ? (
                      <>
                        <div className="form-group">
                          <label>Asking Sale Price (ZMW / K) *</label>
                          <input 
                            type="number" 
                            name="salePrice" 
                            required 
                            placeholder="e.g. 2500000" 
                            value={formData.salePrice} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Price Negotiability</label>
                          <select name="saleNegotiable" value={formData.saleNegotiable} onChange={handleInputChange}>
                            <option value="NEGOTIABLE">Price Negotiable</option>
                            <option value="FIRM">Firm / Non-Negotiable</option>
                            <option value="OFFERS_INVITED">Inviting Written Offers</option>
                          </select>
                        </div>

                        {formData.propertyType === 'COMMERCIAL' && (
                          <>
                            <div className="form-group">
                              <label>Projected Net Annual Yield / ROI (%)</label>
                              <input 
                                type="number" 
                                name="commercialNetYield" 
                                placeholder="e.g. 11.5" 
                                value={formData.commercialNetYield} 
                                onChange={handleInputChange} 
                              />
                              <span className="field-hint">Key metric for commercial property investors</span>
                            </div>
                            <div className="form-group">
                              <label>Current Tenancy Status</label>
                              <select name="commercialTenancyStatus" value={formData.commercialTenancyStatus} onChange={handleInputChange}>
                                <option value="VACANT">Vacant Possession</option>
                                <option value="FULLY_TENANTED">Fully Tenanted (Income Generating)</option>
                                <option value="PARTIALLY_TENANTED">Partially Leased</option>
                              </select>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Monthly Rent (ZMW / K) *</label>
                          <input 
                            type="number" 
                            name="monthlyRent" 
                            required 
                            placeholder="e.g. 15000" 
                            value={formData.monthlyRent} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Security Deposit (ZMW / K) *</label>
                          <input 
                            type="number" 
                            name="deposit" 
                            placeholder="e.g. 30000" 
                            value={formData.deposit} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        {/* Commercial / Industrial Lease Terms */}
                        {(formData.propertyType === 'COMMERCIAL' || formData.propertyType === 'INDUSTRIAL') && (
                          <>
                            <div className="form-group">
                              <label>Service Charge (ZMW / month)</label>
                              <input 
                                type="number" 
                                name="commercialServiceCharge" 
                                placeholder="e.g. 2500 (or 0 if included)" 
                                value={formData.commercialServiceCharge} 
                                onChange={handleInputChange} 
                              />
                              <span className="field-hint">Common area maintenance & security contribution</span>
                            </div>
                            <div className="form-group">
                              <label>Annual Rent Escalation Rate (%)</label>
                              <select name="commercialEscalationRate" value={formData.commercialEscalationRate} onChange={handleInputChange}>
                                <option value="0">0% (Fixed Rate)</option>
                                <option value="7">7% per annum</option>
                                <option value="10">10% per annum (Standard)</option>
                                <option value="12">12% per annum</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Minimum Lease Term</label>
                              <select name="commercialMinLeaseTerm" value={formData.commercialMinLeaseTerm} onChange={handleInputChange}>
                                <option value="1_YEAR">1 Year Minimum</option>
                                <option value="2_YEARS">2 Years Minimum</option>
                                <option value="3_YEARS">3 Years Long-Term</option>
                                <option value="5_YEARS">5 Years Anchor Lease</option>
                              </select>
                            </div>
                          </>
                        )}

                        {/* Land Lease Terms */}
                        {formData.propertyType === 'LAND' && (
                          <div className="form-group">
                            <label>Ground Lease Duration</label>
                            <select name="landLeaseDuration" value={formData.landLeaseDuration} onChange={handleInputChange}>
                              <option value="5">5 Years Lease</option>
                              <option value="10">10 Years Ground Lease</option>
                              <option value="25">25 Years Development Lease</option>
                              <option value="99">99 Years Full State Lease Assignment</option>
                            </select>
                          </div>
                        )}

                        {/* Residential Lease Terms */}
                        {formData.propertyType === 'RESIDENTIAL' && (
                          <div className="form-group">
                            <label>Rent Advance Payment Terms</label>
                            <select name="rentPaymentTerms" value={formData.rentPaymentTerms} onChange={handleInputChange}>
                              <option value="MONTHLY">1 Month in Advance</option>
                              <option value="QUARTERLY">3 Months in Advance</option>
                              <option value="BIANNUALLY">6 Months in Advance</option>
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    {/* CATEGORY SPECIFICATIONS SECTION */}

                    {/* 1. LAND SPECIFICATIONS */}
                    {formData.propertyType === 'LAND' && (
                      <>
                        <div className="full-width form-subheading">
                          <Trees size={16} /> Land Specifications & Features
                        </div>

                        <div className="form-group">
                          <label>Plot / Land Size *</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="number" 
                              name="landSize" 
                              required
                              placeholder="e.g. 5000" 
                              value={formData.landSize} 
                              onChange={handleInputChange} 
                              style={{ flex: 2 }}
                            />
                            <select 
                              name="landSizeUnit" 
                              value={formData.landSizeUnit} 
                              onChange={handleInputChange}
                              style={{ flex: 1 }}
                            >
                              <option value="SQM">sqm</option>
                              <option value="HECTARES">Hectares</option>
                              <option value="ACRES">Acres</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Title & Tenure Status *</label>
                          <select name="landTenure" value={formData.landTenure} onChange={handleInputChange}>
                            <option value="99_YEAR_LEASEHOLD">99-Year State Leasehold (Clean Certificate of Title)</option>
                            <option value="CUSTOMARY">Customary / Traditional Land (Chief's Consent)</option>
                            <option value="COUNCIL_OFFER">Council Allocation / Letter of Offer</option>
                            <option value="FREEHOLD">Freehold Title</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Zoning & Permitted Land Use *</label>
                          <select name="landZoning" value={formData.landZoning} onChange={handleInputChange}>
                            <option value="RESIDENTIAL">Residential Development Plot</option>
                            <option value="COMMERCIAL">Commercial / Mixed-Use Plot</option>
                            <option value="AGRICULTURAL">Agricultural / Farm Land (Crops / Livestock)</option>
                            <option value="INDUSTRIAL">Light Industrial / Storage Yard</option>
                            <option value="HOSPITALITY">Special Use / Hospitality / Eco-Lodge</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Topography & Terrain</label>
                          <select name="landTopography" value={formData.landTopography} onChange={handleInputChange}>
                            <option value="FLAT">Flat & Level (Ready for Building)</option>
                            <option value="GENTLE_SLOPE">Gentle Slope (Good Natural Drainage)</option>
                            <option value="HILLSIDE">Hillside / Elevated Scenic Views</option>
                            <option value="WATERFRONT">Riverfront / Stream Access</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Road Access Infrastructure</label>
                          <select name="landRoadAccess" value={formData.landRoadAccess} onChange={handleInputChange}>
                            <option value="TARRED">Tarred Road Frontage</option>
                            <option value="GRAVEL">All-Weather Graded Gravel Road</option>
                            <option value="DIRT">Graded Dirt Road</option>
                            <option value="TRACK">Bush Track / Undeveloped Access</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Utilities on Site</label>
                          <select name="landWaterElectricity" value={formData.landWaterElectricity} onChange={handleInputChange}>
                            <option value="MAINS_AND_BOREHOLE">Mains Power Connected & Drilled Borehole</option>
                            <option value="MAINS_NEARBY">Powerlines Overhead / Ready to Connect</option>
                            <option value="BOREHOLE_ONLY">Drilled Borehole Water Only</option>
                            <option value="OFF_GRID">Off-Grid / Solar Only</option>
                            <option value="UNDEVELOPED">Virgin Undeveloped Land</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Perimeter & Demarcation</label>
                          <select name="landFencing" value={formData.landFencing} onChange={handleInputChange}>
                            <option value="WALLED">Full Concrete Wall Fence</option>
                            <option value="WIRE">Wire Fence / Chainlink</option>
                            <option value="BEACONS">Official Survey Beacons in Place</option>
                            <option value="UNFENCED">Unfenced / Raw Boundaries</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Soil Type</label>
                          <select name="landSoilType" value={formData.landSoilType} onChange={handleInputChange}>
                            <option value="RED_LOAM">Fertile Red Loam (Ideal for Building & Farming)</option>
                            <option value="SANDY_LOAM">Sandy Loam</option>
                            <option value="CLAY">Clay Soil</option>
                            <option value="BLACK_COTTON">Black Cotton Soil</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* 2. COMMERCIAL SPECIFICATIONS */}
                    {formData.propertyType === 'COMMERCIAL' && (
                      <>
                        <div className="full-width form-subheading">
                          <Briefcase size={16} /> Commercial Building & Space Specifications
                        </div>

                        <div className="form-group">
                          <label>Commercial Space Type *</label>
                          <select name="commercialSubType" value={formData.commercialSubType} onChange={handleInputChange}>
                            <option value="OFFICE_SUITE">Corporate Office Suite</option>
                            <option value="RETAIL_STORE">Retail Store / Showroom / Shop</option>
                            <option value="COMMERCIAL_PLAZA">Multi-Storey Commercial Plaza / Complex</option>
                            <option value="BANKING_HALL">Banking Hall / Financial Centre</option>
                            <option value="MEDICAL_SUITE">Medical Suites / Health Clinic</option>
                            <option value="RESTAURANT">Restaurant / Lounge / Food Court</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Total Lettable / Usable Floor Area (sqm) *</label>
                          <input 
                            type="number" 
                            name="commercialLettableArea" 
                            required
                            placeholder="e.g. 450" 
                            value={formData.commercialLettableArea} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Floor Level / Position</label>
                          <select name="commercialFloorLevel" value={formData.commercialFloorLevel} onChange={handleInputChange}>
                            <option value="GROUND_FLOOR">Ground Floor (Prime Footfall)</option>
                            <option value="1ST_FLOOR">1st Floor / Upper Floor</option>
                            <option value="ENTIRE_BUILDING">Entire Standalone Commercial Building</option>
                            <option value="BASEMENT">Basement / Lower Level</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Total Floors in Building</label>
                          <input 
                            type="number" 
                            name="commercialTotalFloors" 
                            placeholder="e.g. 4" 
                            value={formData.commercialTotalFloors} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Fit-out / Interior Condition *</label>
                          <select name="commercialFitout" value={formData.commercialFitout} onChange={handleInputChange}>
                            <option value="FITTED">Fully Fitted & Partitioned (Move-in Ready)</option>
                            <option value="OPEN_PLAN">Open Plan / Semi-Fitted</option>
                            <option value="SHELL_AND_CORE">Shell & Core (Custom Fitout by Tenant)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Dedicated Parking Bays Count</label>
                          <input 
                            type="number" 
                            name="commercialParkingBays" 
                            placeholder="e.g. 15" 
                            value={formData.commercialParkingBays} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Customer / Visitor Parking</label>
                          <select name="commercialVisitorParking" value={formData.commercialVisitorParking} onChange={handleInputChange}>
                            <option value="AMPLE_ON_SITE">Ample Dedicated Customer Parking</option>
                            <option value="BASEMENT">Underground / Basement Parking</option>
                            <option value="STREET">Street / Public Parking</option>
                          </select>
                        </div>

                        {/* Commercial Amenities Checkboxes */}
                        <div className="form-group full-width">
                          <label style={{ marginBottom: '0.6rem' }}>Critical Building Utilities & Systems</label>
                          <div className="amenities-checkbox-grid">
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="commercialBackupGenerator" 
                                checked={formData.commercialBackupGenerator} 
                                onChange={handleInputChange} 
                              />
                              <span>⚡ Heavy-Duty Standby Generator</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="commercialBoreholeWater" 
                                checked={formData.commercialBoreholeWater} 
                                onChange={handleInputChange} 
                              />
                              <span>💧 Dedicated Borehole + Reservoir Tanks</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="commercialFibreInternet" 
                                checked={formData.commercialFibreInternet} 
                                onChange={handleInputChange} 
                              />
                              <span>🌐 High-Speed Fibre Internet Installed</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="commercialElevator" 
                                checked={formData.commercialElevator} 
                                onChange={handleInputChange} 
                              />
                              <span>🛗 Passenger & Goods Elevators / Lifts</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="commercialCentralAC" 
                                checked={formData.commercialCentralAC} 
                                onChange={handleInputChange} 
                              />
                              <span>❄️ Central Air Conditioning / Split Units</span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 3. INDUSTRIAL SPECIFICATIONS */}
                    {formData.propertyType === 'INDUSTRIAL' && (
                      <>
                        <div className="full-width form-subheading">
                          <Warehouse size={16} /> Industrial Warehouse & Logistics Specifications
                        </div>

                        <div className="form-group">
                          <label>Industrial Sub-Type *</label>
                          <select name="industrialSubType" value={formData.industrialSubType} onChange={handleInputChange}>
                            <option value="WAREHOUSE_DISTRIBUTION">Logistics & Distribution Warehouse</option>
                            <option value="FACTORY">Manufacturing & Processing Factory</option>
                            <option value="HEAVY_YARD">Heavy Equipment Yard / Storage Depot</option>
                            <option value="COLD_STORAGE">Cold Storage & Refrigeration Facility</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Covered Warehouse Area (sqm) *</label>
                          <input 
                            type="number" 
                            name="industrialWarehouseArea" 
                            required
                            placeholder="e.g. 1800" 
                            value={formData.industrialWarehouseArea} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Open Yard / Hardstand Area (sqm)</label>
                          <input 
                            type="number" 
                            name="industrialYardArea" 
                            placeholder="e.g. 3500" 
                            value={formData.industrialYardArea} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Internal Eaves Height / Clearance (metres)</label>
                          <input 
                            type="number" 
                            name="industrialEavesHeight" 
                            placeholder="e.g. 8.5" 
                            value={formData.industrialEavesHeight} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Power Supply Capacity</label>
                          <select name="industrialPowerSupply" value={formData.industrialPowerSupply} onChange={handleInputChange}>
                            <option value="THREE_PHASE">3-Phase Industrial Power Connected</option>
                            <option value="SUBSTATION">Heavy Substation On-site (High KVA)</option>
                            <option value="SINGLE_PHASE">Standard Single-Phase</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Roller Shutter Doors Count</label>
                          <input 
                            type="number" 
                            name="industrialRollerShutters" 
                            placeholder="e.g. 4" 
                            value={formData.industrialRollerShutters} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        {/* Industrial Checkboxes */}
                        <div className="form-group full-width">
                          <label style={{ marginBottom: '0.6rem' }}>Heavy Transport & Site Infrastructure</label>
                          <div className="amenities-checkbox-grid">
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="industrialSuperlinkAccess" 
                                checked={formData.industrialSuperlinkAccess} 
                                onChange={handleInputChange} 
                              />
                              <span>🚛 Superlink / Heavy Truck Turning Circle</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="industrialGuardedGate" 
                                checked={formData.industrialGuardedGate} 
                                onChange={handleInputChange} 
                              />
                              <span>🛡️ 24/7 Guardhouse & Manned Gated Entry</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="industrialFireHydrant" 
                                checked={formData.industrialFireHydrant} 
                                onChange={handleInputChange} 
                              />
                              <span>🚒 Industrial Fire Hydrant & Hose System</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="industrialWeighbridge" 
                                checked={formData.industrialWeighbridge} 
                                onChange={handleInputChange} 
                              />
                              <span>⚖️ Weighbridge Facility On-site</span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 4. RESIDENTIAL SPECIFICATIONS */}
                    {formData.propertyType === 'RESIDENTIAL' && (
                      <>
                        <div className="full-width form-subheading">
                          <Home size={16} /> Residential Living & Accommodation Specifications
                        </div>

                        <div className="form-group">
                          <label>Residential Sub-Type *</label>
                          <select name="residentialSubType" value={formData.residentialSubType} onChange={handleInputChange}>
                            <option value="STANDALONE_HOUSE">Standalone House</option>
                            <option value="GATED_VILLA">Gated Community Villa</option>
                            <option value="APARTMENT">Modern Apartment / Flat</option>
                            <option value="TOWNHOUSE">Semi-Detached Townhouse</option>
                            <option value="HOSTELS">Student / Boarding Hostels</option>
                            <option value="PENTHOUSE">Luxury Penthouse</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Bedrooms *</label>
                          <select name="bedrooms" value={formData.bedrooms} onChange={handleInputChange}>
                            <option value="1">1 Bedroom (or Studio)</option>
                            <option value="2">2 Bedrooms</option>
                            <option value="3">3 Bedrooms</option>
                            <option value="4">4 Bedrooms</option>
                            <option value="5">5 Bedrooms</option>
                            <option value="6">6+ Bedrooms</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Bathrooms *</label>
                          <select name="bathrooms" value={formData.bathrooms} onChange={handleInputChange}>
                            <option value="1">1 Bathroom</option>
                            <option value="1.5">1.5 Bathrooms (with Guest WC)</option>
                            <option value="2">2 Bathrooms</option>
                            <option value="3">3 Bathrooms</option>
                            <option value="4">4+ Bathrooms</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Master En-Suite Count</label>
                          <select name="residentialEnSuiteCount" value={formData.residentialEnSuiteCount} onChange={handleInputChange}>
                            <option value="0">None</option>
                            <option value="1">Master Bedroom En-Suite</option>
                            <option value="2">2 Bedrooms En-Suite</option>
                            <option value="all">All Bedrooms Self-Contained</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Built Floor Area (sqm)</label>
                          <input 
                            type="number" 
                            name="areaSqm" 
                            placeholder="e.g. 280" 
                            value={formData.areaSqm} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Plot / Yard Area (sqm)</label>
                          <input 
                            type="number" 
                            name="residentialPlotSize" 
                            placeholder="e.g. 800" 
                            value={formData.residentialPlotSize} 
                            onChange={handleInputChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Furnishing Status</label>
                          <select name="residentialFurnishing" value={formData.residentialFurnishing} onChange={handleInputChange}>
                            <option value="UNFURNISHED">Unfurnished</option>
                            <option value="SEMI_FURNISHED">Semi-Furnished (Kitchen Appliances Included)</option>
                            <option value="FULLY_FURNISHED">Fully Furnished & Equipped</option>
                          </select>
                        </div>

                        {/* Residential Amenities */}
                        <div className="form-group full-width">
                          <label style={{ marginBottom: '0.6rem' }}>Home Lifestyle & Security Features</label>
                          <div className="amenities-checkbox-grid">
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="residentialBorehole" 
                                checked={formData.residentialBorehole} 
                                onChange={handleInputChange} 
                              />
                              <span>💧 Borehole + Overhead Water Tank</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="residentialSolarBackup" 
                                checked={formData.residentialSolarBackup} 
                                onChange={handleInputChange} 
                              />
                              <span>☀️ Solar Power Inverter / Backup</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="residentialSwimmingPool" 
                                checked={formData.residentialSwimmingPool} 
                                onChange={handleInputChange} 
                              />
                              <span>🏊 Private Swimming Pool</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="residentialMotorizedGate" 
                                checked={formData.residentialMotorizedGate} 
                                onChange={handleInputChange} 
                              />
                              <span>⚡ Electric Fence & Motorized Gate</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="residentialStaffQuarters" 
                                checked={formData.residentialStaffQuarters} 
                                onChange={handleInputChange} 
                              />
                              <span>🏡 Staff Quarters / Worker Cottage</span>
                            </label>
                            <label className="checkbox-item">
                              <input 
                                type="checkbox" 
                                name="residentialPetFriendly" 
                                checked={formData.residentialPetFriendly} 
                                onChange={handleInputChange} 
                              />
                              <span>🐾 Pet Friendly</span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* GENERAL DESCRIPTION */}
                    <div className="form-group full-width">
                      <label>Property Description & Highlights</label>
                      <textarea 
                        name="description" 
                        rows={3} 
                        placeholder={
                          formData.propertyType === 'LAND'
                            ? "Highlight key land details: e.g. Beacons certified, clean title at Ministry of Lands, suitable for subdivision or mixed development, power grid adjacent..."
                            : formData.propertyType === 'COMMERCIAL'
                              ? "Highlight commercial features: e.g. High foot traffic, anchor tenants in building, dedicated high-speed fibre, standby generator, boardroom ready..."
                              : formData.propertyType === 'INDUSTRIAL'
                                ? "Highlight industrial specs: e.g. Superlink access, high eaves, reinforced floor slab, 3-phase power with dedicated transformer, bonded warehouse approval..."
                                : "Detail the residential features: e.g. Modern kitchen with granite tops, master with walk-in closet, paved driveway, landscaped garden..."
                        }
                        value={formData.description}
                        onChange={handleInputChange} 
                      />
                    </div>

                    {/* PROPERTY PHOTOS & MEDIA GALLERY */}
                    <div className="full-width form-subheading" style={{ marginTop: '1.25rem' }}>
                      <Camera size={16} /> Property Photos & Media Gallery
                    </div>

                    <div className="form-group full-width">
                      <div className="photo-upload-container">
                        <div className="photo-actions-bar">
                          <label className="btn-file-upload">
                            <Upload size={16} />
                            <span>Upload Photos</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={handlePhotoUpload}
                              disabled={uploadingPhotos}
                            />
                          </label>

                          <label className="btn-camera-capture">
                            <Camera size={16} />
                            <span>Take Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              style={{ display: 'none' }} 
                              onChange={handlePhotoUpload}
                              disabled={uploadingPhotos}
                            />
                          </label>

                          <span className="photo-counter-badge">
                            {formData.images.length} {formData.images.length === 1 ? 'Photo' : 'Photos'} Added
                          </span>

                          {uploadingPhotos && (
                            <span className="uploading-spinner-text">
                              <RefreshCw size={14} className="spin-icon" /> Uploading media...
                            </span>
                          )}
                        </div>

                        {formData.images.length === 0 ? (
                          <div className="empty-photo-dropzone">
                            <ImageIcon size={36} className="empty-photo-icon" />
                            <p className="empty-photo-title">No property photos uploaded yet</p>
                            <p className="empty-photo-desc">
                              {formData.propertyType === 'LAND'
                                ? 'Upload site photos showing beacons, road access, terrain, or aerial drone views.'
                                : 'Upload real exterior and interior photos of the property to build buyer confidence.'}
                            </p>
                          </div>
                        ) : (
                          <div className="photo-gallery-grid">
                            {formData.images.map((imgUrl, index) => (
                              <div key={index} className="photo-thumb-card">
                                <img src={imgUrl} alt={`Property preview ${index + 1}`} className="photo-thumb-img" />
                                {index === 0 && (
                                  <span className="cover-badge">Cover Photo</span>
                                )}
                                <button 
                                  type="button" 
                                  className="btn-delete-photo" 
                                  onClick={() => handleRemovePhoto(index)}
                                  title="Remove photo"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="step-footer">
                    <div />
                    <button type="button" className="btn-next" onClick={() => setStep(2)}>
                      Next: Location & Map <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Location & Map */}
              {step === 2 && (
                <div className="form-step fade-in">
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 className="section-title">
                      <MapPin size={22} style={{ color: '#2563eb' }} /> Property Location & Map
                    </h3>
                    <p className="section-desc" style={{ marginBottom: 0 }}>
                      Select the location and adjust the pin on the map to pinpoint your property.
                    </p>
                  </div>

                  {/* LOCATION FILTERS */}
                  <div className="form-grid">
                    {/* Country Selector */}
                    <div className="form-group">
                      <label>
                        <Globe size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        Country *
                      </label>
                      <select 
                        name="country" 
                        value={formData.country} 
                        onChange={(e) => handleCountrySelect(e.target.value)}
                        className="cascade-select-highlight"
                      >
                        {Object.values(COUNTRY_CONFIGS).map(c => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Level 2: Province / State / Region */}
                    <div className="form-group">
                      <label>{activeCountryConfig.labels.province} *</label>
                      <select 
                        name="province" 
                        value={formData.province} 
                        onChange={(e) => handleProvinceSelect(e.target.value)}
                      >
                        {availableProvinces.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    {/* Level 3: District / Municipality */}
                    <div className="form-group">
                      <label>{activeCountryConfig.labels.district} *</label>
                      <select 
                        name="district" 
                        value={formData.district} 
                        onChange={(e) => handleDistrictSelect(e.target.value)}
                        disabled={availableDistricts.length === 0}
                      >
                        {availableDistricts.length === 0 && <option value="">No districts available</option>}
                        {availableDistricts.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    {/* Level 4: Community / Neighborhood / Settlement */}
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{activeCountryConfig.labels.community} *</label>
                        <button 
                          type="button" 
                          className="custom-toggle-link"
                          onClick={() => {
                            setIsCustomCommunity(!isCustomCommunity);
                            if (!isCustomCommunity) {
                              setFormData(p => ({ ...p, community: '' }));
                            }
                          }}
                        >
                          {isCustomCommunity ? '← Choose from known list' : '+ Unlisted neighborhood?'}
                        </button>
                      </div>

                      {isCustomCommunity ? (
                        <input 
                          type="text" 
                          name="community" 
                          placeholder="Type neighborhood name..." 
                          value={formData.community} 
                          onChange={(e) => setFormData(p => ({ ...p, community: e.target.value }))}
                          autoFocus
                        />
                      ) : (
                        <select 
                          name="community" 
                          value={formData.community} 
                          onChange={(e) => handleCommunitySelect(e.target.value)}
                        >
                          {availableCommunities.map(comm => (
                            <option key={comm} value={comm}>{comm}</option>
                          ))}
                          <option value="__CUSTOM__">+ Enter Unlisted Neighborhood...</option>
                        </select>
                      )}
                    </div>

                    {/* Street Address / Stand # */}
                    <div className="form-group full-width">
                      <label>Physical Street Address / Stand or Plot Number *</label>
                      <input 
                        type="text" 
                        name="address" 
                        required 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Plot 418, Kudu Road, Kabulonga" 
                      />
                    </div>
                  </div>

                  {/* MAP BOX */}
                  <div className="map-picker-box">
                    <div className="map-picker-header">
                      <div className="map-header-left">
                        <Crosshair size={16} style={{ color: '#2563eb' }} />
                        <span style={{ fontWeight: 600 }}>Property Coordinates</span>
                      </div>
                      <div className="map-header-right">
                        <code>Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}</code>
                        <button 
                          type="button" 
                          className="btn-copy-coords" 
                          onClick={handleCopyCoordinates}
                          title="Copy GPS Coordinates"
                        >
                          {copiedCoords ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                          <span>{copiedCoords ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Map Controls Toolbar: Basemaps & GPS Actions */}
                    <div className="map-controls-toolbar">
                      {/* Basemap Selection Pills */}
                      <div className="basemap-pills-group">
                        <span className="toolbar-label">
                          <Layers size={13} /> Basemap:
                        </span>
                        {BASEMAP_OPTIONS.map(bm => (
                          <button
                            key={bm.id}
                            type="button"
                            className={`basemap-pill ${selectedBasemap === bm.id ? 'active' : ''}`}
                            onClick={() => setSelectedBasemap(bm.id)}
                            title={bm.name}
                          >
                            <span>{bm.icon}</span>
                            <span>{bm.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Map Action Buttons */}
                      <div className="map-actions-group">
                        <button
                          type="button"
                          className="btn-map-action btn-locate"
                          onClick={handleUseCurrentLocation}
                          disabled={locating}
                          title="Acquire current location from device"
                        >
                          {locating ? <RefreshCw size={14} className="spin" /> : <Navigation size={14} />}
                          <span>{locating ? 'Locating...' : 'Use My Current Location'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn-map-action"
                          onClick={() => handleResetCentroid('district')}
                          title="Center map on selected district"
                        >
                          <RotateCcw size={14} />
                          <span>Center: {formData.district ? formData.district.split(' ')[0] : 'District'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn-map-action"
                          onClick={() => handleResetCentroid('country')}
                          title="Reset view to country bounds"
                        >
                          <Compass size={14} />
                          <span>{formData.country} View</span>
                        </button>
                      </div>
                    </div>

                    {/* Leaflet Map Frame */}
                    <div className="leaflet-picker-frame">
                      {(() => {
                        const activeBm = BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];
                        return (
                          <MapContainer
                            center={mapTarget.center}
                            zoom={mapTarget.zoom}
                            scrollWheelZoom={true}
                            zoomControl={false}
                            style={{ height: '360px', width: '100%', borderRadius: '0 0 10px 10px' }}
                          >
                            <TileLayer
                              key={activeBm.id}
                              attribution={activeBm.attribution}
                              url={activeBm.url}
                              subdomains={activeBm.subdomains || ['a', 'b', 'c']}
                            />
                            <ZoomControl position="bottomright" />
                            <MapFlyController center={mapTarget.center} zoom={mapTarget.zoom} />
                            <LocationPicker 
                              position={[formData.latitude, formData.longitude]} 
                              onPositionChange={(pos) => setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }))} 
                            />
                          </MapContainer>
                        );
                      })()}
                    </div>

                    <div className="map-picker-footer-tip">
                      <span>💡 Click anywhere on the map or drag the pin to set the exact property location.</span>
                    </div>
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn-back" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button type="button" className="btn-next" onClick={() => setStep(3)}>
                      Next: Ownership & Verification <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Proof of Ownership & Verification */}
              {step === 3 && (
                <div className="form-step fade-in">
                  <div className="anti-scam-notice-box">
                    <div className="notice-icon"><ShieldCheck size={24} color="#2563eb" /></div>
                    <div>
                      <h4>Ownership & Title Verification</h4>
                      <p>
                        To ensure authenticity and trust for buyers and tenants, all property listings are reviewed and verified against official deeds and property records.
                      </p>
                    </div>
                  </div>

                  <h3 className="section-title">
                    <UserCheck size={20} /> Registered Owner Credentials
                  </h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Legal Name (as on Title / ID) *</label>
                      <input 
                        type="text" 
                        name="ownerName" 
                        required 
                        placeholder="e.g. Chileshe Mulenga" 
                        value={formData.ownerName} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="form-group">
                      <label>National ID / Passport Number *</label>
                      <input 
                        type="text" 
                        name="nationalId" 
                        required 
                        placeholder="e.g. 194821/11/1" 
                        value={formData.nationalId} 
                        onChange={handleInputChange} 
                      />
                      <span className="field-hint">Used for official owner identity verification</span>
                    </div>

                    <div className="form-group">
                      <label>Owner Phone Number *</label>
                      <input 
                        type="text" 
                        name="ownerPhone" 
                        required 
                        placeholder="+260977123456" 
                        value={formData.ownerPhone} 
                        onChange={handleInputChange} 
                      />
                      <span className="field-hint">For verification notifications and updates</span>
                    </div>

                    <div className="form-group">
                      <label>Owner Official Email *</label>
                      <input 
                        type="email" 
                        name="ownerEmail" 
                        required 
                        placeholder="owner@domain.com" 
                        value={formData.ownerEmail} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <h3 className="section-title" style={{ marginTop: '1.5rem' }}>
                    <FileText size={20} /> Title Deed & Property Records
                  </h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Certificate of Title / Deed Number *</label>
                      <input 
                        type="text" 
                        name="titleDeedNumber" 
                        required 
                        placeholder="e.g. CT-LUS-2022-99824" 
                        value={formData.titleDeedNumber} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Stand / Parcel / Plot Number *</label>
                      <input 
                        type="text" 
                        name="parcelNumber" 
                        required 
                        placeholder="e.g. Stand 418/Sub A/Kabulonga" 
                        value={formData.parcelNumber} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>

                  <div className="doc-upload-grid">
                    {/* 1. Certificate of Title / Deed Scan */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <FileText size={18} className="doc-type-icon" />
                        <span>Certificate of Title / Deed Scan *</span>
                      </div>
                      <p className="doc-sub">Upload PDF or high-resolution scan showing stamp, survey diagram and parcel seal.</p>
                      
                      <div className="doc-upload-actions">
                        <label className="btn-doc-upload">
                          <Upload size={14} />
                          <span>Upload Files</span>
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf,image/*,.doc,.docx" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleDocUpload('deed', e)}
                            disabled={uploadingDoc === 'deed'}
                          />
                        </label>

                        <label className="btn-doc-camera">
                          <Camera size={14} />
                          <span>Scan / Camera</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleDocUpload('deed', e)}
                            disabled={uploadingDoc === 'deed'}
                          />
                        </label>
                      </div>

                      {uploadingDoc === 'deed' && (
                        <div className="doc-uploading-tag">
                          <RefreshCw size={12} className="spin-icon" /> Processing document...
                        </div>
                      )}

                      {formData.deedFiles.length > 0 ? (
                        <div className="attached-files-list">
                          {formData.deedFiles.map((file, idx) => (
                            <div key={idx} className="attached-file-chip">
                              <File size={13} className="file-chip-icon" />
                              <span className="file-chip-name" title={file.name}>{file.name}</span>
                              {file.size && (
                                <span className="file-chip-size">({(file.size / 1024).toFixed(0)} KB)</span>
                              )}
                              <button 
                                type="button" 
                                className="file-chip-remove" 
                                onClick={() => handleRemoveDoc('deed', idx)}
                                title="Remove file"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="doc-status-hint">No document uploaded yet</div>
                      )}

                      {showManualDocInputs && (
                        <input 
                          type="text" 
                          name="deedDocumentUrl" 
                          value={formData.deedDocumentUrl} 
                          onChange={handleInputChange}
                          placeholder="Or enter title deed link/URL"
                          className="doc-url-input"
                        />
                      )}
                    </div>

                    {/* 2. Owner Government ID */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <UserCheck size={18} className="doc-type-icon" />
                        <span>Owner Government ID (NRC/Passport) *</span>
                      </div>
                      <p className="doc-sub">Front and back scan matching title deed registered name.</p>

                      <div className="doc-upload-actions">
                        <label className="btn-doc-upload">
                          <Upload size={14} />
                          <span>Upload Files</span>
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf,image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleDocUpload('id', e)}
                            disabled={uploadingDoc === 'id'}
                          />
                        </label>

                        <label className="btn-doc-camera">
                          <Camera size={14} />
                          <span>Snap Photo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleDocUpload('id', e)}
                            disabled={uploadingDoc === 'id'}
                          />
                        </label>
                      </div>

                      {uploadingDoc === 'id' && (
                        <div className="doc-uploading-tag">
                          <RefreshCw size={12} className="spin-icon" /> Processing document...
                        </div>
                      )}

                      {formData.idFiles.length > 0 ? (
                        <div className="attached-files-list">
                          {formData.idFiles.map((file, idx) => (
                            <div key={idx} className="attached-file-chip">
                              <File size={13} className="file-chip-icon" />
                              <span className="file-chip-name" title={file.name}>{file.name}</span>
                              {file.size && (
                                <span className="file-chip-size">({(file.size / 1024).toFixed(0)} KB)</span>
                              )}
                              <button 
                                type="button" 
                                className="file-chip-remove" 
                                onClick={() => handleRemoveDoc('id', idx)}
                                title="Remove file"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="doc-status-hint">No ID uploaded yet</div>
                      )}

                      {showManualDocInputs && (
                        <input 
                          type="text" 
                          name="idDocumentUrl" 
                          value={formData.idDocumentUrl} 
                          onChange={handleInputChange}
                          placeholder="Or enter ID document link/URL"
                          className="doc-url-input"
                        />
                      )}
                    </div>

                    {/* 3. Council Rates / Utility Bill */}
                    <div className="doc-card">
                      <div className="doc-header">
                        <Building2 size={18} className="doc-type-icon" />
                        <span>Council Rates / Utility Bill</span>
                      </div>
                      <p className="doc-sub">Recent utility or council rates statement (electricity, water, or municipal bill).</p>

                      <div className="doc-upload-actions">
                        <label className="btn-doc-upload">
                          <Upload size={14} />
                          <span>Upload Files</span>
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf,image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleDocUpload('rates', e)}
                            disabled={uploadingDoc === 'rates'}
                          />
                        </label>

                        <label className="btn-doc-camera">
                          <Camera size={14} />
                          <span>Snap Photo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleDocUpload('rates', e)}
                            disabled={uploadingDoc === 'rates'}
                          />
                        </label>
                      </div>

                      {uploadingDoc === 'rates' && (
                        <div className="doc-uploading-tag">
                          <RefreshCw size={12} className="spin-icon" /> Processing document...
                        </div>
                      )}

                      {formData.ratesFiles.length > 0 ? (
                        <div className="attached-files-list">
                          {formData.ratesFiles.map((file, idx) => (
                            <div key={idx} className="attached-file-chip">
                              <File size={13} className="file-chip-icon" />
                              <span className="file-chip-name" title={file.name}>{file.name}</span>
                              {file.size && (
                                <span className="file-chip-size">({(file.size / 1024).toFixed(0)} KB)</span>
                              )}
                              <button 
                                type="button" 
                                className="file-chip-remove" 
                                onClick={() => handleRemoveDoc('rates', idx)}
                                title="Remove file"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="doc-status-hint">Optional / Recommended</div>
                      )}

                      {showManualDocInputs && (
                        <input 
                          type="text" 
                          name="ratesStatementUrl" 
                          value={formData.ratesStatementUrl} 
                          onChange={handleInputChange}
                          placeholder="Or enter rates bill link/URL"
                          className="doc-url-input"
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
                    <button 
                      type="button" 
                      className="custom-toggle-link"
                      onClick={() => setShowManualDocInputs(!showManualDocInputs)}
                    >
                      {showManualDocInputs ? 'Hide manual document URL links' : 'Or enter external document URL links'}
                    </button>
                  </div>

                  {/* Legal Declaration */}
                  <div className="declaration-card">
                    <label className="declaration-checkbox-label">
                      <input 
                        type="checkbox" 
                        name="legalDeclaration" 
                        checked={formData.legalDeclaration} 
                        onChange={handleInputChange} 
                        required 
                      />
                      <span className="declaration-text">
                        <strong>OWNER DECLARATION & CONSENT:</strong> I certify that I am the registered owner or authorized legal representative of this property, and that all submitted details and documents are authentic. I consent to the verification of these records with official property registries.
                      </span>
                    </label>
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn-back" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit" 
                      disabled={submitting || !formData.legalDeclaration}
                    >
                      {submitting ? 'Submitting Registration...' : 'Submit Property Registration'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      {/* Scoped Styles */}
      <style>{`
        .owner-listing-container {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          display: flex;
          flex-direction: column;
        }

        .owner-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .back-btn {
          color: #64748b;
          transition: transform 0.2s;
        }
        .back-btn:hover {
          transform: translateX(-3px);
          color: #0f172a;
        }

        .brand-icon {
          color: #2563eb;
        }

        .brand-name {
          font-weight: 700;
          font-size: 1.125rem;
          color: #0f172a;
        }

        .portal-tag {
          font-size: 0.75rem;
          background: #eff6ff;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 99px;
          font-weight: 600;
        }

        .security-status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .shield-green {
          color: #059669;
        }

        .owner-body {
          flex: 1;
          max-width: 960px;
          width: 100%;
          margin: 2rem auto;
          padding: 0 1.5rem;
        }

        .wizard-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .wizard-hero {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          padding: 2.5rem;
          position: relative;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(251, 191, 36, 0.2);
          border: 1px solid rgba(251, 191, 36, 0.4);
          color: #fef08a;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .wizard-hero h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: #f8fafc;
        }

        .wizard-hero p {
          color: #94a3b8;
          font-size: 0.9375rem;
          line-height: 1.5;
          max-width: 700px;
          margin: 0 0 2rem 0;
        }

        .step-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.2s;
        }

        .step-item.active {
          opacity: 1;
        }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8125rem;
        }

        .step-item.active .step-num {
          background: #3b82f6;
          color: white;
        }

        .step-label {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .step-arrow {
          color: #64748b;
        }

        .form-content {
          padding: 2.5rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.5rem 0;
        }

        .section-desc {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .full-width {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
        }

        .form-group input, 
        .form-group select, 
        .form-group textarea {
          padding: 0.65rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.9375rem;
          transition: all 0.2s;
          background: white;
          color: #0f172a;
        }

        .form-group input:focus, 
        .form-group select:focus, 
        .form-group textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
          outline: none;
        }

        .field-hint {
          font-size: 0.75rem;
          color: #64748b;
        }


        .form-subheading {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          background: #f1f5f9;
          border-left: 4px solid #2563eb;
          border-radius: 6px;
          margin: 0.75rem 0 0.25rem 0;
        }

        .amenities-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #334155;
          cursor: pointer;
        }

        .checkbox-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
          cursor: pointer;
        }

        .cascade-select-highlight {
          border-color: #3b82f6 !important;
          background-color: #eff6ff !important;
          font-weight: 600 !important;
        }

        .custom-toggle-link {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .custom-toggle-link:hover {
          color: #1d4ed8;
        }


        .map-picker-box {
          margin: 1.5rem 0;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px -2px rgba(0,0,0,0.05);
        }

        .map-picker-header {
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .map-header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #1e293b;
        }

        .map-header-right {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .map-header-right code {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #0f172a;
        }

        .btn-copy-coords {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.725rem;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-copy-coords:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .map-controls-toolbar {
          padding: 0.6rem 0.85rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .basemap-pills-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .toolbar-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          margin-right: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .basemap-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.725rem;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .basemap-pill:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .basemap-pill.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          box-shadow: 0 1px 3px rgba(37,99,235,0.12);
        }

        .map-actions-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .btn-map-action {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 0.725rem;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-map-action:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .btn-locate {
          background: #10b981 !important;
          border-color: #059669 !important;
          color: white !important;
        }

        .btn-locate:hover {
          background: #059669 !important;
        }

        .btn-locate:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .map-picker-footer-tip {
          padding: 0.5rem 0.85rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          font-size: 0.725rem;
          color: #64748b;
          line-height: 1.4;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .anti-scam-notice-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-left: 4px solid #2563eb;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .anti-scam-notice-box h4 {
          margin: 0 0 0.25rem 0;
          color: #1e3a8a;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .anti-scam-notice-box p {
          margin: 0;
          font-size: 0.8125rem;
          color: #1e40af;
          line-height: 1.4;
        }

        .photo-upload-container {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .photo-actions-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn-file-upload, .btn-camera-capture {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-file-upload {
          background: #2563eb;
          color: white;
          border: 1px solid #1d4ed8;
        }

        .btn-file-upload:hover {
          background: #1d4ed8;
        }

        .btn-camera-capture {
          background: white;
          color: #0f172a;
          border: 1px solid #cbd5e1;
        }

        .btn-camera-capture:hover {
          background: #f1f5f9;
        }

        .photo-counter-badge {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #475569;
          background: #e2e8f0;
          padding: 4px 10px;
          border-radius: 99px;
        }

        .uploading-spinner-text {
          font-size: 0.75rem;
          color: #2563eb;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .empty-photo-dropzone {
          padding: 2rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .empty-photo-icon {
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }

        .empty-photo-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #334155;
          margin: 0;
        }

        .empty-photo-desc {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
          max-width: 480px;
        }

        .photo-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.75rem;
        }

        .photo-thumb-card {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .photo-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: #2563eb;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-delete-photo {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(220, 38, 38, 0.9);
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .btn-delete-photo:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        /* Document upload styling */
        .doc-upload-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .doc-card {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .doc-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .doc-type-icon {
          color: #2563eb;
          flex-shrink: 0;
        }

        .doc-sub {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
          flex: 1;
        }

        .doc-upload-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .btn-doc-upload, .btn-doc-camera {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.45rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-doc-upload {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .btn-doc-upload:hover {
          background: #dbeafe;
        }

        .btn-doc-camera {
          background: white;
          color: #334155;
          border: 1px solid #cbd5e1;
        }

        .btn-doc-camera:hover {
          background: #f8fafc;
        }

        .attached-files-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: 0.35rem;
        }

        .attached-file-chip {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.725rem;
        }

        .file-chip-icon {
          color: #2563eb;
          flex-shrink: 0;
        }

        .file-chip-name {
          color: #0f172a;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .file-chip-size {
          color: #64748b;
          font-size: 0.65rem;
          flex-shrink: 0;
        }

        .file-chip-remove {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 3px;
        }

        .file-chip-remove:hover {
          background: #fee2e2;
        }

        .doc-uploading-tag {
          font-size: 0.725rem;
          color: #2563eb;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
        }

        .doc-status-hint {
          font-size: 0.725rem;
          color: #94a3b8;
          font-style: italic;
        }

        .doc-url-input {
          padding: 0.45rem 0.65rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.75rem;
          margin-top: 0.35rem;
        }

        .declaration-card {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }

        .declaration-checkbox-label {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          cursor: pointer;
        }

        .declaration-checkbox-label input {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          accent-color: #2563eb;
        }

        .declaration-text {
          font-size: 0.8125rem;
          color: #1e40af;
          line-height: 1.5;
        }

        .step-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-next, .btn-submit {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.75rem 1.75rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9375rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-next:hover, .btn-submit:hover {
          background: #1d4ed8;
        }

        .btn-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .btn-back {
          background: white;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
        }

        .fraud-intercept-banner {
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 16px;
          padding: 2.5rem;
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .fraud-icon-box {
          color: #dc2626;
        }

        .fraud-text-box h2 {
          color: #991b1b;
          font-size: 1.35rem;
          margin: 0 0 0.5rem 0;
          font-weight: 800;
        }

        .fraud-desc {
          color: #7f1d1d;
          font-size: 0.9375rem;
          margin: 0 0 1rem 0;
        }

        .fraud-reason {
          background: #fee2e2;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #b91c1c;
          margin-bottom: 1rem;
        }

        .fraud-action {
          font-size: 0.8125rem;
          color: #991b1b;
          line-height: 1.5;
        }

        .btn-return {
          margin-top: 1.5rem;
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .success-banner {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
        }

        .success-icon-box {
          margin-bottom: 1rem;
        }

        .success-banner h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }

        .success-sub {
          color: #64748b;
          font-size: 0.9375rem;
          margin-bottom: 2rem;
        }

        .audit-timeline-card {
          max-width: 500px;
          margin: 0 auto 2rem auto;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .timeline-node {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #cbd5e1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .timeline-item.done .timeline-node {
          background: #10b981;
        }

        .timeline-item.in-progress .timeline-node {
          background: #3b82f6;
        }

        .timeline-item h4 {
          margin: 0 0 2px 0;
          font-size: 0.875rem;
          color: #0f172a;
        }

        .timeline-item p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .success-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-secondary {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
          .doc-upload-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default OwnerListingRegistration;
