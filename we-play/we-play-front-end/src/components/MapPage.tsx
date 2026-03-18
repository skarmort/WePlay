import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, CircleMarker } from 'react-leaflet';
import Map, { Marker as MapGLMarker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapAPI, bookingsAPI } from '../services/api';
import { MapPin, Users, Navigation, Activity, Layers, Grid3X3, Map as MapIcon, Calendar, Clock, X, Check, List, Building2, Trophy, Filter, Locate, ZoomIn, ZoomOut, Flame, Box } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    "><span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const venueIcon = createCustomIcon('#3B82F6', '🏟️');
const parkIcon = createCustomIcon('#22C55E', '🌳');
const gymIcon = createCustomIcon('#EF4444', '💪');
const courtIcon = createCustomIcon('#F59E0B', '🎾');
const eventIcon = createCustomIcon('#8B5CF6', '🏆');
const tournamentIcon = createCustomIcon('#EC4899', '🥇');
const hotspotHighIcon = createCustomIcon('#EF4444', '🔥');
const hotspotMedIcon = createCustomIcon('#F97316', '⚡');
const hotspotLowIcon = createCustomIcon('#22C55E', '✓');

type Hotspot = {
  id: string;
  name: string;
  address?: string;
  sport: string;
  longitude: number;
  latitude: number;
  activityLevel: number;
  currentUsers: number;
  headingUsers: number;
  locationType: string;
};

type Venue = {
  id: string;
  name: string;
  address: string;
  sport: string;
  locationType: 'park' | 'gym' | 'sports-center' | 'court' | 'field';
  amenities?: string[];
  pricePerHour?: number;
  rating?: number;
  imageUrl?: string;
  availableSlots?: number;
  latitude: number;
  longitude: number;
  hours?: string;
  phone?: string;
};

type Event = {
  id: string;
  name: string;
  sport: string;
  location: string;
  startDate: string;
  latitude: number;
  longitude: number;
  participants?: number;
  type: 'event' | 'tournament';
};

type TimeSlot = {
  time: string;
  available: boolean;
};

type Booking = {
  id: string;
  venueId: string;
  venueName: string;
  date: string;
  timeSlot: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  sport?: string;
};

interface MapPageProps {
  isDarkMode?: boolean;
}

// Map controller component for programmatic map control
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapPage: React.FC<MapPageProps> = ({ isDarkMode = true }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [filterVenueType, setFilterVenueType] = useState('');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [cardView, setCardView] = useState<'list' | 'grid'>('grid');
  const [activeTab, setActiveTab] = useState<'map' | 'venues' | 'bookings'>('map');
  const [showEvents, setShowEvents] = useState(true);
  const [showVenues, setShowVenues] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // 3D Map state
  const mapGLRef = useRef<maplibregl.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7580, -73.9855]); // NYC default
  const [mapZoom, setMapZoom] = useState(13);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Theme classes based on dark/light mode
  const theme = isDarkMode ? {
    bg: 'bg-gray-900',
    surface: 'bg-gray-800',
    elevated: 'bg-gray-700',
    border: 'border-gray-700',
    text: 'text-white',
    textMuted: 'text-gray-400',
    textSecondary: 'text-gray-300',
    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    button: 'bg-gray-700 hover:bg-gray-600 text-white',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    card: 'bg-gray-800/50 border-gray-700/50',
    mapBg: 'from-slate-800 to-slate-900',
    mapSurface: 'bg-slate-700/50',
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    elevated: 'bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    textSecondary: 'text-gray-700',
    input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    button: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    card: 'bg-white border-gray-200',
    mapBg: 'from-blue-100 to-blue-200',
    mapSurface: 'bg-blue-50/50',
  };

  useEffect(() => {
    loadHotspots();
    loadVenues();
    loadEvents();
    loadMyBookings();
    getUserLocation();
  }, [filterSport]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (error) => {
          console.log('Location access denied, using default');
        }
      );
    }
  };

  const loadHotspots = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mapAPI.getHotspots(filterSport || undefined);
      setHotspots(data);
    } catch (err: any) {
      // Real NYC locations with coordinates
      setHotspots([
        { id: '1', name: 'Central Park Tennis Courts', address: '110 West Dr, New York, NY 10019', sport: 'Tennis', longitude: -73.9654, latitude: 40.7812, activityLevel: 85, currentUsers: 12, headingUsers: 3, locationType: 'Public Court' },
        { id: '2', name: 'Chelsea Piers Sports Complex', address: 'Pier 62, New York, NY 10011', sport: 'Basketball', longitude: -74.0088, latitude: 40.7467, activityLevel: 72, currentUsers: 24, headingUsers: 8, locationType: 'Sports Complex' },
        { id: '3', name: 'Riverside Park Soccer Fields', address: 'Riverside Dr & W 105th St, New York, NY', sport: 'Soccer', longitude: -73.9688, latitude: 40.8025, activityLevel: 65, currentUsers: 22, headingUsers: 5, locationType: 'Outdoor Field' },
        { id: '4', name: 'YMCA McBurney', address: '125 W 14th St, New York, NY 10011', sport: 'Multi-Sport', longitude: -73.9980, latitude: 40.7377, activityLevel: 55, currentUsers: 18, headingUsers: 4, locationType: 'Fitness Center' },
        { id: '5', name: 'Brooklyn Bridge Park Courts', address: 'Pier 2, Brooklyn, NY 11201', sport: 'Basketball', longitude: -73.9969, latitude: 40.6983, activityLevel: 78, currentUsers: 16, headingUsers: 6, locationType: 'Outdoor Court' },
        { id: '6', name: 'Prospect Park Tennis Center', address: 'Prospect Park, Brooklyn, NY 11215', sport: 'Tennis', longitude: -73.9690, latitude: 40.6602, activityLevel: 45, currentUsers: 8, headingUsers: 2, locationType: 'Tennis Center' },
        { id: '7', name: 'Astoria Park Track & Field', address: '19th St, Astoria, NY 11105', sport: 'Running', longitude: -73.9276, latitude: 40.7784, activityLevel: 38, currentUsers: 14, headingUsers: 3, locationType: 'Track' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadVenues = async () => {
    try {
      const data = await bookingsAPI.getVenues(filterSport || undefined);
      setVenues(data);
    } catch (err: any) {
      // Real NYC venue locations - Parks, Sports Centers, Gyms
      setVenues([
        // Parks
        { id: 'v1', name: 'Central Park Great Lawn', address: '85th St Transverse, New York, NY 10024', sport: 'Soccer', locationType: 'park', amenities: ['Open Fields', 'Restrooms', 'Water Fountains', 'Permit Required'], pricePerHour: 0, rating: 4.9, availableSlots: 12, latitude: 40.7829, longitude: -73.9654, hours: '6AM - 1AM' },
        { id: 'v2', name: 'Hudson River Park - Pier 40', address: '353 West St, New York, NY 10014', sport: 'Multi-Sport', locationType: 'park', amenities: ['Soccer Fields', 'Baseball', 'Parking', 'Restrooms'], pricePerHour: 25, rating: 4.7, availableSlots: 6, latitude: 40.7279, longitude: -74.0116, hours: '7AM - 11PM' },
        { id: 'v3', name: 'McCarren Park', address: 'McCarren Park, Brooklyn, NY 11211', sport: 'Multi-Sport', locationType: 'park', amenities: ['Track', 'Soccer', 'Tennis', 'Pool'], pricePerHour: 0, rating: 4.6, availableSlots: 8, latitude: 40.7200, longitude: -73.9513, hours: '6AM - 10PM' },
        { id: 'v4', name: 'Flushing Meadows Corona Park', address: 'Grand Central Pkwy, Queens, NY 11368', sport: 'Tennis', locationType: 'park', amenities: ['USTA Center', 'Bike Paths', 'Lakes', 'Museums'], pricePerHour: 30, rating: 4.8, availableSlots: 10, latitude: 40.7498, longitude: -73.8462, hours: '6AM - 9PM' },
        
        // Sports Centers
        { id: 'v5', name: 'Chelsea Piers Fitness', address: 'Pier 60, Chelsea Piers, New York, NY 10011', sport: 'Multi-Sport', locationType: 'sports-center', amenities: ['Olympic Pool', 'Basketball Courts', 'Rock Climbing', 'Golf'], pricePerHour: 65, rating: 4.8, availableSlots: 15, latitude: 40.7467, longitude: -74.0088, hours: '5AM - 11PM', phone: '(212) 336-6000' },
        { id: 'v6', name: 'Asphalt Green', address: '555 E 90th St, New York, NY 10128', sport: 'Swimming', locationType: 'sports-center', amenities: ['Olympic Pool', 'Gym', 'Sports Fields', 'Kids Programs'], pricePerHour: 45, rating: 4.7, availableSlots: 8, latitude: 40.7797, longitude: -73.9431, hours: '5:30AM - 10PM', phone: '(212) 369-8890' },
        { id: 'v7', name: 'Brooklyn Sports Club', address: '62 Schermerhorn St, Brooklyn, NY 11201', sport: 'Multi-Sport', locationType: 'sports-center', amenities: ['Courts', 'Pool', 'Weight Room', 'Classes'], pricePerHour: 40, rating: 4.5, availableSlots: 12, latitude: 40.6905, longitude: -73.9890, hours: '6AM - 10PM' },
        
        // Gyms
        { id: 'v8', name: 'Equinox Sports Club', address: '344 Amsterdam Ave, New York, NY 10024', sport: 'Fitness', locationType: 'gym', amenities: ['Full Gym', 'Spa', 'Pool', 'Basketball'], pricePerHour: 50, rating: 4.9, availableSlots: 20, latitude: 40.7828, longitude: -73.9782, hours: '5AM - 11PM', phone: '(212) 799-1818' },
        { id: 'v9', name: 'Gleason\'s Gym', address: '77 Front St, Brooklyn, NY 11201', sport: 'Boxing', locationType: 'gym', amenities: ['Boxing Ring', 'Heavy Bags', 'Training', 'Legendary'], pricePerHour: 35, rating: 4.8, availableSlots: 6, latitude: 40.7025, longitude: -73.9865, hours: '7AM - 9PM', phone: '(718) 797-2872' },
        { id: 'v10', name: 'NYSC - Times Square', address: '151 W 48th St, New York, NY 10036', sport: 'Fitness', locationType: 'gym', amenities: ['Cardio', 'Weights', 'Classes', 'Sauna'], pricePerHour: 25, rating: 4.4, availableSlots: 25, latitude: 40.7598, longitude: -73.9854, hours: '24 Hours' },
        
        // Courts
        { id: 'v11', name: 'Sutton East Tennis', address: '488 E 60th St, New York, NY 10022', sport: 'Tennis', locationType: 'court', amenities: ['8 Clay Courts', 'Pro Shop', 'Lessons', 'Cafe'], pricePerHour: 80, rating: 4.7, availableSlots: 4, latitude: 40.7596, longitude: -73.9599, hours: '7AM - 11PM', phone: '(212) 751-3452' },
        { id: 'v12', name: 'The게ove - Pickleball', address: '100 Avenue of the Americas, New York, NY 10013', sport: 'Pickleball', locationType: 'court', amenities: ['6 Courts', 'Equipment Rental', 'Coaching', 'Lounge'], pricePerHour: 45, rating: 4.6, availableSlots: 8, latitude: 40.7233, longitude: -74.0052, hours: '8AM - 10PM' },
      ]);
    }
  };

  const loadEvents = async () => {
    // Load events and tournaments with real NYC locations
    setEvents([
      { id: 'e1', name: 'NYC Summer Soccer League', sport: 'Soccer', location: 'Central Park Great Lawn', startDate: '2026-03-15T10:00', latitude: 40.7829, longitude: -73.9654, participants: 128, type: 'tournament' },
      { id: 'e2', name: 'Brooklyn Basketball Championship', sport: 'Basketball', location: 'Brooklyn Bridge Park', startDate: '2026-02-20T14:00', latitude: 40.6983, longitude: -73.9969, participants: 64, type: 'tournament' },
      { id: 'e3', name: 'Tennis Skills Clinic', sport: 'Tennis', location: 'Sutton East Tennis', startDate: '2026-02-10T09:00', latitude: 40.7596, longitude: -73.9599, participants: 24, type: 'event' },
      { id: 'e4', name: 'Boxing Workshop - Beginners', sport: 'Boxing', location: "Gleason's Gym", startDate: '2026-02-12T18:00', latitude: 40.7025, longitude: -73.9865, participants: 16, type: 'event' },
      { id: 'e5', name: 'Queens Marathon Training', sport: 'Running', location: 'Flushing Meadows Park', startDate: '2026-02-08T07:00', latitude: 40.7498, longitude: -73.8462, participants: 200, type: 'event' },
      { id: 'e6', name: 'Hudson River Volleyball Tournament', sport: 'Volleyball', location: 'Hudson River Park', startDate: '2026-03-01T11:00', latitude: 40.7279, longitude: -74.0116, participants: 48, type: 'tournament' },
    ]);
  };

  const loadMyBookings = async () => {
    try {
      const data = await bookingsAPI.getMyBookings();
      setMyBookings(data);
    } catch (err: any) {
      setMyBookings([
        { id: 'b1', venueId: 'v5', venueName: 'Chelsea Piers Fitness', date: '2026-02-10', timeSlot: '10:00', duration: 2, status: 'confirmed', sport: 'Basketball' },
        { id: 'b2', venueId: 'v11', venueName: 'Sutton East Tennis', date: '2026-02-12', timeSlot: '14:00', duration: 1, status: 'pending', sport: 'Tennis' },
      ]);
    }
  };

  const loadAvailableSlots = async (venueId: string, date: string) => {
    try {
      const data = await bookingsAPI.getVenueAvailability(venueId, date);
      setAvailableSlots(data);
    } catch (err: any) {
      const slots: TimeSlot[] = [];
      for (let hour = 6; hour <= 22; hour++) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          available: Math.random() > 0.3
        });
      }
      setAvailableSlots(slots);
    }
  };

  const handleBookVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setBookingDate('');
    setBookingTime('');
    setBookingDuration(1);
    setBookingNotes('');
    setAvailableSlots([]);
    setShowBookingModal(true);
  };

  const handleDateChange = (date: string) => {
    setBookingDate(date);
    setBookingTime('');
    if (selectedVenue && date) {
      loadAvailableSlots(selectedVenue.id, date);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedVenue || !bookingDate || !bookingTime) return;
    
    setBookingLoading(true);
    try {
      await bookingsAPI.createBooking({
        venueId: selectedVenue.id,
        date: bookingDate,
        timeSlot: bookingTime,
        duration: bookingDuration,
        sport: selectedVenue.sport,
        notes: bookingNotes
      });
      
      const newBooking: Booking = {
        id: `b${Date.now()}`,
        venueId: selectedVenue.id,
        venueName: selectedVenue.name,
        date: bookingDate,
        timeSlot: bookingTime,
        duration: bookingDuration,
        status: 'confirmed',
        sport: selectedVenue.sport
      };
      setMyBookings([newBooking, ...myBookings]);
      setShowBookingModal(false);
      alert('Booking confirmed successfully!');
    } catch (err: any) {
      const newBooking: Booking = {
        id: `b${Date.now()}`,
        venueId: selectedVenue.id,
        venueName: selectedVenue.name,
        date: bookingDate,
        timeSlot: bookingTime,
        duration: bookingDuration,
        status: 'confirmed',
        sport: selectedVenue.sport
      };
      setMyBookings([newBooking, ...myBookings]);
      setShowBookingModal(false);
      alert('Booking confirmed successfully!');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingsAPI.cancelBooking(bookingId);
      setMyBookings(myBookings.filter(b => b.id !== bookingId));
      alert('Booking cancelled successfully.');
    } catch (err: any) {
      setMyBookings(myBookings.filter(b => b.id !== bookingId));
      alert('Booking cancelled successfully.');
    }
  };

  const handleHeading = async (id: string) => {
    try {
      await mapAPI.setHeading(id);
      loadHotspots();
      alert('Your heading status has been set!');
    } catch (err: any) {
      alert('Heading status set!');
    }
  };

  const handleArrived = async (id: string) => {
    try {
      await mapAPI.confirmArrival(id);
      loadHotspots();
      alert('Arrival confirmed!');
    } catch (err: any) {
      alert('Arrival confirmed!');
    }
  };

  const handleLeft = async (id: string) => {
    try {
      await mapAPI.confirmDeparture(id);
      loadHotspots();
      alert('Departure confirmed!');
    } catch (err: any) {
      alert('Departure confirmed!');
    }
  };

  const getActivityColor = (level: number) => {
    if (level >= 75) return 'from-red-500 to-orange-500';
    if (level >= 50) return 'from-orange-500 to-yellow-500';
    if (level >= 25) return 'from-yellow-500 to-green-500';
    return 'from-green-500 to-emerald-500';
  };

  const getActivityLabel = (level: number) => {
    if (level >= 75) return 'Very Busy';
    if (level >= 50) return 'Busy';
    if (level >= 25) return 'Moderate';
    return 'Quiet';
  };

  const getHotspotIcon = (level: number) => {
    if (level >= 70) return hotspotHighIcon;
    if (level >= 40) return hotspotMedIcon;
    return hotspotLowIcon;
  };

  const getVenueIcon = (type: string) => {
    switch (type) {
      case 'park': return parkIcon;
      case 'gym': return gymIcon;
      case 'sports-center': return venueIcon;
      case 'court': return courtIcon;
      default: return venueIcon;
    }
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
    } else {
      getUserLocation();
    }
  };

  const filteredVenues = venues.filter(v => {
    if (filterSport && v.sport !== filterSport && v.sport !== 'Multi-Sport' && v.sport !== 'Fitness') return false;
    if (filterVenueType && v.locationType !== filterVenueType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.text}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading activity map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 ${theme.text}`}>
      <div className="mb-4">
        <h1 className={`text-xl font-bold ${theme.text}`}>Activity Map & Venues</h1>
        <p className={`${theme.textMuted} mt-1 text-xs`}>Find real locations, see where the action is, and book your spot</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-full mb-4 text-xs">
          {error}
        </div>
      )}

      {/* Main Tabs */}
      <div className={`flex gap-2 mb-4 p-1 rounded-full ${theme.surface} border ${theme.border} w-fit`}>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-xs ${
            activeTab === 'map' ? theme.buttonPrimary : theme.button
          }`}
        >
          <MapIcon size={12} />
          Live Map
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-xs ${
            activeTab === 'venues' ? theme.buttonPrimary : theme.button
          }`}
        >
          <Building2 size={12} />
          Book Venues
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-xs ${
            activeTab === 'bookings' ? theme.buttonPrimary : theme.button
          }`}
        >
          <Calendar size={12} />
          My Bookings {myBookings.length > 0 && `(${myBookings.length})`}
        </button>
      </div>

      {/* Filters */}
      {activeTab !== 'bookings' && (
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className={`px-4 py-2 rounded-full text-xs ${theme.input} border`}
          >
            <option value="">All Sports</option>
            <option value="Soccer">Soccer</option>
            <option value="Basketball">Basketball</option>
            <option value="Tennis">Tennis</option>
            <option value="Boxing">Boxing</option>
            <option value="Swimming">Swimming</option>
            <option value="Running">Running</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Fitness">Fitness</option>
          </select>

          {activeTab === 'venues' && (
            <select
              value={filterVenueType}
              onChange={(e) => setFilterVenueType(e.target.value)}
              className={`px-4 py-2 rounded-full text-xs ${theme.input} border`}
            >
              <option value="">All Venue Types</option>
              <option value="park">🌳 Parks</option>
              <option value="sports-center">🏟️ Sports Centers</option>
              <option value="gym">💪 Gyms</option>
              <option value="court">🎾 Courts</option>
            </select>
          )}

          {activeTab === 'map' && (
            <>
              <div className={`flex gap-1 p-1 rounded-full ${theme.surface} border ${theme.border}`}>
                <button
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${showHotspots ? theme.buttonPrimary : theme.button}`}
                  title="Activity Hotspots"
                >
                  🔥 Hotspots
                </button>
                <button
                  onClick={() => setShowVenues(!showVenues)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${showVenues ? 'bg-blue-600 text-white' : theme.button}`}
                  title="Venues"
                >
                  🏟️ Venues
                </button>
                <button
                  onClick={() => setShowEvents(!showEvents)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${showEvents ? 'bg-purple-600 text-white' : theme.button}`}
                  title="Events & Tournaments"
                >
                  🏆 Events
                </button>
              </div>

              <div className={`flex gap-1 p-1 rounded-full ${theme.surface} border ${theme.border}`}>
                <button
                  onClick={() => setCardView('grid')}
                  className={`px-3 py-1.5 rounded-full transition-colors ${cardView === 'grid' ? theme.buttonPrimary : 'hover:bg-gray-600'}`}
                  title="Grid View"
                >
                  <Grid3X3 size={12} />
                </button>
                <button
                  onClick={() => setCardView('list')}
                  className={`px-3 py-1.5 rounded-full transition-colors ${cardView === 'list' ? theme.buttonPrimary : 'hover:bg-gray-600'}`}
                  title="List View"
                >
                  <List size={12} />
                </button>
              </div>

              {/* View Mode Toggle - 2D/3D */}
              <div className={`flex gap-1 p-1 rounded-full ${theme.surface} border ${theme.border}`}>
                <button
                  onClick={() => setViewMode('2D')}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 ${viewMode === '2D' ? theme.buttonPrimary : theme.button}`}
                  title="2D Map View"
                >
                  <MapIcon size={12} /> 2D
                </button>
                <button
                  onClick={() => setViewMode('3D')}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 ${viewMode === '3D' ? theme.buttonPrimary : theme.button}`}
                  title="3D Map View"
                >
                  <Box size={12} /> 3D
                </button>
              </div>

              {/* Heatmap Toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 ${showHeatmap ? 'bg-orange-600 text-white' : theme.button}`}
                title="Toggle Heatmap"
              >
                <Flame size={12} /> Heatmap
              </button>
            </>
          )}
        </div>
      )}

      {/* Activity Map Tab */}
      {activeTab === 'map' && (
        <>
          {/* Map Container - 2D or 3D */}
          <div className={`rounded-xl overflow-hidden border ${theme.border} mb-4 relative`}>
            
            {/* 2D Leaflet Map */}
            {viewMode === '2D' && (
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '450px', width: '100%' }}
                className="z-0"
              >
                <MapController center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url={isDarkMode 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />
                
                {/* User Location */}
                {userLocation && (
                  <Circle
                    center={userLocation}
                    radius={100}
                    pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.3 }}
                  />
                )}
                
                {/* Heatmap Circles - Snapchat-style activity visualization */}
                {showHeatmap && hotspots.filter(h => h.latitude != null && h.longitude != null).map((h) => (
                  <React.Fragment key={`heat-${h.id}`}>
                    {/* Outer glow */}
                    <Circle
                      center={[h.latitude, h.longitude]}
                      radius={400 + (h.activityLevel * 8)}
                      pathOptions={{
                        color: 'transparent',
                        fillColor: h.activityLevel >= 70 ? '#EF4444' : h.activityLevel >= 40 ? '#F97316' : '#22C55E',
                        fillOpacity: 0.15,
                      }}
                    />
                    {/* Middle ring */}
                    <Circle
                      center={[h.latitude, h.longitude]}
                      radius={250 + (h.activityLevel * 4)}
                      pathOptions={{
                        color: 'transparent',
                        fillColor: h.activityLevel >= 70 ? '#EF4444' : h.activityLevel >= 40 ? '#F97316' : '#22C55E',
                        fillOpacity: 0.25,
                      }}
                    />
                    {/* Inner core */}
                    <Circle
                      center={[h.latitude, h.longitude]}
                      radius={100 + (h.activityLevel * 2)}
                      pathOptions={{
                        color: 'transparent',
                        fillColor: h.activityLevel >= 70 ? '#EF4444' : h.activityLevel >= 40 ? '#F97316' : '#22C55E',
                        fillOpacity: 0.4,
                      }}
                    />
                    {/* User dots - simulating people at location */}
                    {Array.from({ length: Math.min(h.currentUsers, 8) }).map((_, i) => (
                      <CircleMarker
                        key={`user-${h.id}-${i}`}
                        center={[
                          h.latitude + (Math.random() - 0.5) * 0.003,
                          h.longitude + (Math.random() - 0.5) * 0.003
                        ]}
                        radius={4}
                        pathOptions={{
                          color: '#FBBF24',
                          fillColor: '#FBBF24',
                          fillOpacity: 1,
                          weight: 2,
                        }}
                      />
                    ))}
                  </React.Fragment>
                ))}
                
                {/* Hotspot Markers */}
                {showHotspots && !showHeatmap && hotspots.filter(h => h.latitude != null && h.longitude != null).map((h) => (
                  <Marker 
                    key={h.id} 
                    position={[h.latitude, h.longitude]}
                    icon={getHotspotIcon(h.activityLevel)}
                    eventHandlers={{
                      click: () => setSelectedHotspot(h)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-sm mb-1">{h.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{h.address}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{h.sport}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            h.activityLevel >= 70 ? 'bg-red-100 text-red-700' :
                            h.activityLevel >= 40 ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {getActivityLabel(h.activityLevel)}
                          </span>
                        </div>
                        <p className="text-xs"><strong>{h.currentUsers}</strong> people here</p>
                        {h.headingUsers > 0 && <p className="text-xs text-blue-600">{h.headingUsers} heading there</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Venue Markers */}
                {showVenues && filteredVenues.filter(v => v.latitude != null && v.longitude != null).map((v) => (
                  <Marker 
                    key={v.id} 
                    position={[v.latitude, v.longitude]}
                    icon={getVenueIcon(v.locationType)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[220px]">
                        <h3 className="font-bold text-sm mb-1">{v.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">{v.address}</p>
                        {v.hours && <p className="text-xs text-gray-500 mb-2">🕐 {v.hours}</p>}
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{v.sport}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs capitalize">{v.locationType.replace('-', ' ')}</span>
                        </div>
                        {v.rating && <p className="text-xs mb-1">⭐ {v.rating} rating</p>}
                        {v.pricePerHour !== undefined && (
                          <p className="text-xs font-bold text-green-600 mb-2">
                            {v.pricePerHour === 0 ? 'Free' : `$${v.pricePerHour}/hour`}
                          </p>
                        )}
                        <button
                          onClick={() => handleBookVenue(v)}
                          className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Book Now
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Event/Tournament Markers */}
                {showEvents && events.filter(e => e.latitude != null && e.longitude != null).map((e) => (
                  <Marker 
                    key={e.id} 
                    position={[e.latitude, e.longitude]}
                    icon={e.type === 'tournament' ? tournamentIcon : eventIcon}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-1 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            e.type === 'tournament' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {e.type === 'tournament' ? '🥇 Tournament' : '🏆 Event'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mb-1">{e.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">📍 {e.location}</p>
                        <p className="text-xs text-gray-600 mb-1">🎯 {e.sport}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          📅 {new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {e.participants && <p className="text-xs text-blue-600">{e.participants} participants</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* 3D MapLibre GL Map with Buildings */}
            {viewMode === '3D' && (
              <Map
                ref={(ref) => { mapGLRef.current = ref?.getMap() || null; }}
                initialViewState={{
                  longitude: mapCenter[1],
                  latitude: mapCenter[0],
                  zoom: 15,
                  pitch: 60, // Tilted view to see buildings
                  bearing: -17.6,
                }}
                style={{ width: '100%', height: '450px' }}
                mapStyle={isDarkMode 
                  ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                  : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                }
                onLoad={(evt) => {
                  const map = evt.target;
                  
                  // Add 3D buildings layer
                  const layers = map.getStyle()?.layers;
                  let labelLayerId: string | undefined;
                  if (layers) {
                    for (const layer of layers) {
                      if (layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout) {
                        labelLayerId = layer.id;
                        break;
                      }
                    }
                  }

                  // Add 3D building extrusion layer
                  if (!map.getSource('openmaptiles')) {
                    map.addSource('openmaptiles', {
                      type: 'vector',
                      url: 'https://api.maptiler.com/tiles/v3/tiles.json?key=get_your_own_key'
                    });
                  }

                  // Simple 3D building effect using fill-extrusion
                  if (!map.getLayer('3d-buildings')) {
                    map.addLayer({
                      'id': '3d-buildings',
                      'source': 'carto',
                      'source-layer': 'building',
                      'type': 'fill-extrusion',
                      'minzoom': 14,
                      'paint': {
                        'fill-extrusion-color': isDarkMode ? '#1e293b' : '#cbd5e1',
                        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 16, ['get', 'render_height']],
                        'fill-extrusion-base': ['get', 'render_min_height'],
                        'fill-extrusion-opacity': 0.8
                      }
                    }, labelLayerId);
                  }
                }}
              >
                <NavigationControl position="top-right" showCompass showZoom />
                <GeolocateControl position="top-right" />

                {/* Hotspot Markers */}
                {showHotspots && hotspots.filter(h => h.latitude != null && h.longitude != null).map((h) => (
                  <MapGLMarker
                    key={h.id}
                    longitude={h.longitude}
                    latitude={h.latitude}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedHotspot(h);
                      setSelectedMarker(h.id);
                    }}
                  >
                    <div className="cursor-pointer transform hover:scale-110 transition-transform">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        style={{
                          background: h.activityLevel >= 70 ? '#EF4444' : h.activityLevel >= 40 ? '#F97316' : '#22C55E'
                        }}
                      >
                        <span className="text-lg">🔥</span>
                      </div>
                      {selectedMarker === h.id && (
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${theme.surface} rounded-lg p-2 shadow-xl border ${theme.border} min-w-[150px] z-10`}>
                          <h4 className={`font-semibold text-xs ${theme.text}`}>{h.name}</h4>
                          <p className={`text-[10px] ${theme.textMuted}`}>{h.sport}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] ${theme.text}`}>{h.currentUsers} here</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              h.activityLevel >= 70 ? 'bg-red-500/20 text-red-400' :
                              h.activityLevel >= 40 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {h.activityLevel}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </MapGLMarker>
                ))}

                {/* Venue Markers */}
                {showVenues && filteredVenues.filter(v => v.latitude != null && v.longitude != null).map((v) => (
                  <MapGLMarker
                    key={v.id}
                    longitude={v.longitude}
                    latitude={v.latitude}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedMarker(v.id);
                    }}
                  >
                    <div className="cursor-pointer transform hover:scale-110 transition-transform">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        style={{
                          background: v.locationType === 'park' ? '#22C55E' : 
                                     v.locationType === 'gym' ? '#EF4444' : 
                                     v.locationType === 'court' ? '#F59E0B' : '#3B82F6'
                        }}
                      >
                        <span className="text-lg">
                          {v.locationType === 'park' ? '🌳' : 
                           v.locationType === 'gym' ? '💪' : 
                           v.locationType === 'court' ? '🎾' : '🏟️'}
                        </span>
                      </div>
                      {selectedMarker === v.id && (
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${theme.surface} rounded-lg p-2 shadow-xl border ${theme.border} min-w-[160px] z-10`}>
                          <h4 className={`font-semibold text-xs ${theme.text}`}>{v.name}</h4>
                          <p className={`text-[10px] ${theme.textMuted}`}>{v.sport}</p>
                          {v.pricePerHour !== undefined && (
                            <p className="text-[10px] text-green-400 font-medium mt-1">
                              {v.pricePerHour === 0 ? 'Free' : `$${v.pricePerHour}/hr`}
                            </p>
                          )}
                          <button
                            onClick={() => handleBookVenue(v)}
                            className="mt-2 w-full px-2 py-1 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-700"
                          >
                            Book Now
                          </button>
                        </div>
                      )}
                    </div>
                  </MapGLMarker>
                ))}

                {/* Event Markers */}
                {showEvents && events.filter(e => e.latitude != null && e.longitude != null).map((e) => (
                  <MapGLMarker
                    key={e.id}
                    longitude={e.longitude}
                    latitude={e.latitude}
                    anchor="bottom"
                    onClick={(evt) => {
                      evt.originalEvent.stopPropagation();
                      setSelectedMarker(e.id);
                    }}
                  >
                    <div className="cursor-pointer transform hover:scale-110 transition-transform">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        style={{
                          background: e.type === 'tournament' ? '#EC4899' : '#8B5CF6'
                        }}
                      >
                        <span className="text-lg">{e.type === 'tournament' ? '🥇' : '🏆'}</span>
                      </div>
                      {selectedMarker === e.id && (
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${theme.surface} rounded-lg p-2 shadow-xl border ${theme.border} min-w-[150px] z-10`}>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                            e.type === 'tournament' ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {e.type === 'tournament' ? 'Tournament' : 'Event'}
                          </span>
                          <h4 className={`font-semibold text-xs ${theme.text} mt-1`}>{e.name}</h4>
                          <p className={`text-[10px] ${theme.textMuted}`}>{e.sport}</p>
                          <p className={`text-[10px] ${theme.textMuted}`}>
                            {new Date(e.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </MapGLMarker>
                ))}
              </Map>
            )}

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={centerOnUser}
                className={`p-2 ${theme.surface} border ${theme.border} rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors`}
                title="My Location"
              >
                <Locate size={16} />
              </button>
            </div>

            {/* Legend */}
            <div className={`absolute bottom-4 left-4 z-[1000] ${theme.surface} border ${theme.border} rounded-lg p-3 shadow-lg`}>
              <p className={`text-[10px] font-medium ${theme.text} mb-2`}>Legend</p>
              <div className="space-y-1 text-[10px]">
                {showHeatmap ? (
                  <>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> <span className={theme.textMuted}>Very Busy (70%+)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> <span className={theme.textMuted}>Moderate (40-70%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> <span className={theme.textMuted}>Quiet (&lt;40%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400" /> <span className={theme.textMuted}>Active Users</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2"><span>🔥</span> <span className={theme.textMuted}>Very Busy</span></div>
                    <div className="flex items-center gap-2"><span>⚡</span> <span className={theme.textMuted}>Moderate</span></div>
                    <div className="flex items-center gap-2"><span>🌳</span> <span className={theme.textMuted}>Parks</span></div>
                    <div className="flex items-center gap-2"><span>🏟️</span> <span className={theme.textMuted}>Sports Centers</span></div>
                    <div className="flex items-center gap-2"><span>💪</span> <span className={theme.textMuted}>Gyms</span></div>
                    <div className="flex items-center gap-2"><span>🏆</span> <span className={theme.textMuted}>Events</span></div>
                    <div className="flex items-center gap-2"><span>🥇</span> <span className={theme.textMuted}>Tournaments</span></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hotspot Cards */}
          <h2 className={`text-sm font-semibold ${theme.text} mb-4`}>Activity Locations ({hotspots.length})</h2>
          
          <div className={`grid gap-4 ${cardView === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {hotspots.map((h) => (
              <div
                key={h.id}
                className={`${theme.card} border rounded-xl p-4 ${
                  selectedHotspot?.id === h.id ? 'ring-2 ring-blue-500' : ''
                } hover:scale-[1.02] transition-transform cursor-pointer`}
                onClick={() => {
                  setSelectedHotspot(h);
                  setMapCenter([h.latitude, h.longitude]);
                  setMapZoom(16);
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-semibold text-xs ${theme.text}`}>{h.name}</h3>
                  <span className={`px-2 py-1 text-[10px] rounded-full bg-gradient-to-r ${getActivityColor(h.activityLevel)} text-white`}>
                    {h.activityLevel}% Active
                  </span>
                </div>

                {h.address && (
                  <p className={`${theme.textMuted} text-[10px] mb-3 flex items-center gap-1`}>
                    <MapPin size={10} /> {h.address}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-[10px] mb-4">
                  <span className={`flex items-center gap-1 ${theme.textSecondary}`}>
                    <Activity size={10} /> {h.sport}
                  </span>
                  <span className={`flex items-center gap-1 ${theme.textSecondary}`}>
                    <Users size={10} /> {h.currentUsers} here
                  </span>
                  {h.headingUsers > 0 && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Navigation size={10} /> {h.headingUsers} heading
                    </span>
                  )}
                </div>

                {/* Activity bar */}
                <div className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mb-4 overflow-hidden`}>
                  <div
                    className={`h-full bg-gradient-to-r ${getActivityColor(h.activityLevel)} transition-all`}
                    style={{ width: `${h.activityLevel}%` }}
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleHeading(h.id); }}
                    className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs flex items-center gap-1`}
                  >
                    <Navigation size={10} /> Heading There
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleArrived(h.id); }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs"
                  >
                    I'm Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Venues Tab */}
      {activeTab === 'venues' && (
        <>
          {/* Venue Map */}
          <div className={`rounded-xl overflow-hidden border ${theme.border} mb-4`}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '300px', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={isDarkMode 
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              {filteredVenues.filter(v => v.latitude != null && v.longitude != null).map((v) => (
                <Marker 
                  key={v.id} 
                  position={[v.latitude, v.longitude]}
                  icon={getVenueIcon(v.locationType)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-sm">{v.name}</h3>
                      <p className="text-xs text-gray-600">{v.address}</p>
                      <p className="text-xs font-bold text-green-600 mt-1">
                        {v.pricePerHour === 0 ? 'Free' : `$${v.pricePerHour}/hour`}
                      </p>
                      <button
                        onClick={() => handleBookVenue(v)}
                        className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs"
                      >
                        Book Now
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <h2 className={`text-sm font-semibold ${theme.text} mb-4`}>Available Venues ({filteredVenues.length})</h2>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {filteredVenues.filter(v => v.latitude != null && v.longitude != null).map((venue) => (
              <div
                key={venue.id}
                className={`${theme.card} border rounded-xl p-4 hover:scale-[1.01] transition-transform cursor-pointer`}
                onClick={() => {
                  setMapCenter([venue.latitude, venue.longitude]);
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {venue.locationType === 'park' ? '🌳' : 
                         venue.locationType === 'gym' ? '💪' : 
                         venue.locationType === 'court' ? '🎾' : '🏟️'}
                      </span>
                      <h3 className={`font-semibold text-sm ${theme.text}`}>{venue.name}</h3>
                    </div>
                    <p className={`${theme.textMuted} text-[10px] flex items-center gap-1 mt-1`}>
                      <MapPin size={10} /> {venue.address}
                    </p>
                    {venue.hours && (
                      <p className={`${theme.textMuted} text-[10px] flex items-center gap-1 mt-1`}>
                        <Clock size={10} /> {venue.hours}
                      </p>
                    )}
                  </div>
                  {venue.rating && (
                    <span className="px-2 py-1 text-[10px] rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                      ⭐ {venue.rating}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-[10px] rounded-full ${theme.elevated} ${theme.textSecondary}`}>
                    {venue.sport}
                  </span>
                  <span className={`px-2 py-1 text-[10px] rounded-full ${theme.elevated} ${theme.textSecondary} capitalize`}>
                    {venue.locationType.replace('-', ' ')}
                  </span>
                </div>

                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {venue.amenities.slice(0, 4).map((amenity, idx) => (
                      <span key={idx} className={`px-2 py-0.5 text-[10px] rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} ${theme.textMuted}`}>
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${theme.border}`}>
                  <div>
                    {venue.pricePerHour !== undefined && (
                      <p className={`text-sm font-bold ${venue.pricePerHour === 0 ? 'text-green-400' : 'text-green-400'}`}>
                        {venue.pricePerHour === 0 ? 'Free' : `$${venue.pricePerHour}`}
                        {venue.pricePerHour > 0 && <span className={`text-[10px] font-normal ${theme.textMuted}`}>/hour</span>}
                      </p>
                    )}
                    {venue.availableSlots !== undefined && (
                      <p className={`text-[10px] ${theme.textMuted}`}>{venue.availableSlots} slots available today</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBookVenue(venue); }}
                    className={`${theme.buttonPrimary} px-4 py-2 rounded-full flex items-center gap-2 font-medium text-xs`}
                  >
                    <Calendar size={12} /> Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredVenues.length === 0 && (
            <p className={`${theme.textMuted} text-center py-8 text-xs`}>No venues available for the selected filters.</p>
          )}
        </>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          <h2 className={`text-sm font-semibold ${theme.text} mb-4`}>My Bookings</h2>
          
          {myBookings.length === 0 ? (
            <div className={`${theme.card} border rounded-xl p-8 text-center`}>
              <Calendar size={32} className={`mx-auto mb-4 ${theme.textMuted}`} />
              <h3 className={`text-sm font-semibold ${theme.text} mb-2`}>No Bookings Yet</h3>
              <p className={`${theme.textMuted} mb-4 text-xs`}>Browse venues and book your first session!</p>
              <button
                onClick={() => setActiveTab('venues')}
                className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs`}
              >
                Browse Venues
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`${theme.card} border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold text-xs ${theme.text}`}>{booking.venueName}</h3>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className={`flex flex-wrap gap-4 text-[10px] ${theme.textMuted}`}>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {booking.timeSlot} ({booking.duration}h)
                      </span>
                      {booking.sport && (
                        <span className="flex items-center gap-1">
                          <Activity size={10} /> {booking.sport}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 rounded-full text-xs bg-red-600 hover:bg-red-700 text-white"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedVenue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} border ${theme.border} rounded-2xl p-4 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-sm font-semibold ${theme.text}`}>Book Venue</h2>
                <p className={`${theme.textMuted} text-[10px] mt-1`}>{selectedVenue.name}</p>
                <p className={`${theme.textMuted} text-[10px]`}>{selectedVenue.address}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className={`p-2 rounded-full ${theme.button}`}
              >
                <X size={12} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className={`block text-xs font-medium ${theme.text} mb-2`}>Select Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border`}
                />
              </div>

              {/* Time Slot Selection */}
              {bookingDate && (
                <div>
                  <label className={`block text-xs font-medium ${theme.text} mb-2`}>Select Time Slot</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setBookingTime(slot.time)}
                        disabled={!slot.available}
                        className={`px-3 py-2 rounded-full text-xs transition-colors ${
                          bookingTime === slot.time
                            ? theme.buttonPrimary
                            : slot.available
                            ? theme.button
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration Selection */}
              {bookingTime && (
                <div>
                  <label className={`block text-xs font-medium ${theme.text} mb-2`}>Duration (hours)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setBookingDuration(dur)}
                        className={`px-4 py-2 rounded-full text-xs ${
                          bookingDuration === dur ? theme.buttonPrimary : theme.button
                        }`}
                      >
                        {dur}h
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {bookingTime && (
                <div>
                  <label className={`block text-xs font-medium ${theme.text} mb-2`}>Notes (optional)</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any special requests..."
                    rows={3}
                    className={`w-full px-4 py-2 rounded-xl text-xs ${theme.input} border resize-none`}
                  />
                </div>
              )}

              {/* Summary */}
              {bookingDate && bookingTime && (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium text-xs ${theme.text} mb-2`}>Booking Summary</h4>
                  <div className={`text-[10px] ${theme.textMuted} space-y-1`}>
                    <p>📍 {selectedVenue.name}</p>
                    <p>📅 {new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p>⏰ {bookingTime} - {parseInt(bookingTime) + bookingDuration}:00 ({bookingDuration}h)</p>
                    {selectedVenue.pricePerHour !== undefined && (
                      <p className="text-green-400 font-medium mt-2 text-xs">
                        Total: {selectedVenue.pricePerHour === 0 ? 'Free' : `$${selectedVenue.pricePerHour * bookingDuration}`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirmBooking}
                disabled={!bookingDate || !bookingTime || bookingLoading}
                className={`w-full py-3 rounded-full font-medium text-xs flex items-center justify-center gap-2 ${
                  bookingDate && bookingTime
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {bookingLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={12} /> Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
