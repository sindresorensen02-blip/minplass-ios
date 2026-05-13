import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PLACEHOLDER_SPOTS = [
  { id: 'strand',   address: 'Strandgaten 12',   area: 'Møhlenpris', price: 45, available: true,  latitude: 60.3913, longitude: 5.3221, tags: ['Tak over', 'Elbil 11kW'] },
  { id: 'sandviks', address: 'Sandviksveien 47',  area: 'Sandviken',  price: 38, available: true,  latitude: 60.4012, longitude: 5.3180, tags: ['Belyst', 'Kamera'] },
  { id: 'nygaard',  address: 'Nygårdsgaten 8',    area: 'Sentrum',    price: 55, available: false, latitude: 60.3856, longitude: 5.3317, tags: ['Innendørs'] },
  { id: 'danm',     address: 'Damsgårdsveien 3',  area: 'Laksevåg',   price: 30, available: true,  latitude: 60.3951, longitude: 5.2998, tags: ['Belyst'] },
  { id: 'kronstad', address: 'Kronstad Terrasse',  area: 'Kronstad',   price: 28, available: true,  latitude: 60.3789, longitude: 5.3450, tags: ['Tak over', 'Belyst'] },
  { id: 'brann',    address: 'Brann Stadion P-hus', area: 'Fyllingsdalen', price: 25, available: true, latitude: 60.3660, longitude: 5.2940, tags: ['Innendørs', 'Belyst', 'Kamera'] },
];

const MAP_FILTERS = [
  { key: 'ledig',     label: 'Ledig nå',   match: (s) => s.available },
  { key: 'elbil',     label: 'Elbil',       match: (s) => s.tags.some(t => t.toLowerCase().includes('elbil')) },
  { key: 'tak',       label: 'Tak over',    match: (s) => s.tags.some(t => t.toLowerCase().includes('tak')) },
  { key: 'billig',    label: 'Under 40 kr', match: (s) => s.price < 40 },
  { key: 'innendors', label: 'Innendørs',   match: (s) => s.tags.some(t => t.toLowerCase().includes('innend')) },
];

const BERGEN = {
  latitude: 60.3913,
  longitude: 5.3221,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function KartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [spots, setSpots] = useState(PLACEHOLDER_SPOTS);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [countdownText, setCountdownText] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    supabase
      .from('spots')
      .select('id, address, price_per_hour, amenities, available_to, active, lat, lng, spot_type')
      .eq('active', true)
      .eq('moderation_status', 'approved')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const live = data.map(s => ({
            id: s.id,
            address: s.address,
            area: '',
            price: s.price_per_hour,
            available: s.active,
            latitude: s.lat,
            longitude: s.lng,
            tags: s.amenities ?? [],
            until: `Ledig til ${(s.available_to ?? '20:00').slice(0, 5)}`,
            isLive: true,
          }));
          setSpots([...live, ...PLACEHOLDER_SPOTS]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch the next/active booking within 24 h and subscribe to changes
  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const now = new Date().toISOString();
      const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('reservations')
        .select('id, starts_at, ends_at, spots(id, address, price_per_hour, amenities)')
        .eq('renter_id', user.id)
        .in('status', ['confirmed', 'pending'])
        .gte('ends_at', now)
        .lte('starts_at', in24h)
        .order('starts_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      setActiveBooking(data ?? null);
    };

    fetch();

    const channel = supabase
      .channel(`kart-booking-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations', filter: `renter_id=eq.${user.id}` }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Recompute countdown label every 30 s
  useEffect(() => {
    if (!activeBooking) { setCountdownText(''); return; }

    const update = () => {
      const now = Date.now();
      const start = new Date(activeBooking.starts_at).getTime();
      const end = new Date(activeBooking.ends_at).getTime();

      const fmtMins = (ms) => {
        const m = Math.round(ms / 60000);
        if (m < 60) return `${m} min`;
        const h = Math.floor(m / 60), rem = m % 60;
        return rem ? `${h} t ${rem} min` : `${h} t`;
      };

      if (now < start) {
        setCountdownText(`Starter om ${fmtMins(start - now)}`);
      } else if (now <= end) {
        setCountdownText(`Aktiv · ${fmtMins(end - now)} igjen`);
      } else {
        setActiveBooking(null);
      }
    };

    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [activeBooking]);

  const focusSpot = (spot) => {
    setSelected(spot);
    mapRef.current?.animateToRegion({
      latitude: spot.latitude - 0.004,
      longitude: spot.longitude,
      latitudeDelta: 0.018,
      longitudeDelta: 0.018,
    }, 400);
  };

  const resetView = () => {
    setSelected(null);
    mapRef.current?.animateToRegion(BERGEN, 400);
  };

  const openSpot = (spot) => {
    const spotPayload = {
      id: spot.id,
      address: spot.address,
      area: spot.area,
      price: spot.price,
      tags: spot.tags ?? [],
      until: spot.until ?? '',
      distanceKm: spot.distanceKm ?? 99,
      distance: spot.distance ?? '',
      walk: spot.walk ?? '',
      featured: false,
      isLive: spot.isLive ?? false,
    };
    navigation.navigate('Hjem', { screen: 'LiveSpot', params: { spot: spotPayload } });
  };

  const visibleSpots = activeFilter
    ? spots.filter(MAP_FILTERS.find(f => f.key === activeFilter).match)
    : spots;

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={BERGEN}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
      >
        {visibleSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            onPress={() => focusSpot(spot)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={[styles.pin, selected?.id === spot.id && styles.pinSelected]}>
              {selected?.id === spot.id ? (
                <LinearGradient
                  colors={['#10B981', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                />
              ) : null}
              <Text style={[styles.pinText, selected?.id === spot.id && styles.pinTextSelected]}>
                {spot.price} kr
              </Text>
            </View>
            <View style={[styles.pinTail, { borderTopColor: selected?.id === spot.id ? '#2563EB' : '#111416' }]} />
          </Marker>
        ))}
      </MapView>

      {/* Top overlay: search bar + filter chips + booking banner */}
      <View style={[styles.topOverlay, { top: insets.top + 12 }]}>
        <View style={styles.searchBar}>
          <View style={styles.searchPin}>
            <Icon name="map-pin" size={13} color="#fff" />
          </View>
          <Text style={styles.searchValue}>Bergen, Norge</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#7B8589" />
          ) : (
            <Icon name="search" size={16} color="#7B8589" />
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {MAP_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeBooking?.spots && (
          <TouchableOpacity
            style={styles.bookingBanner}
            activeOpacity={0.88}
            onPress={() => openSpot({
              id: activeBooking.spots.id,
              address: activeBooking.spots.address,
              area: '',
              price: activeBooking.spots.price_per_hour,
              tags: activeBooking.spots.amenities ?? [],
              isLive: true,
            })}
          >
            <LinearGradient
              colors={['#10B981', '#14B8A6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 14 }]}
            />
            <View style={styles.bookingBannerDot} />
            <View style={styles.bookingBannerBody}>
              <Text style={styles.bookingBannerCountdown}>{countdownText}</Text>
              <Text style={styles.bookingBannerAddress} numberOfLines={1}>{activeBooking.spots.address}</Text>
            </View>
            <Icon name="arrow-right" size={16} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Reset / my-location button */}
      <TouchableOpacity
        style={[styles.locBtn, { bottom: insets.bottom + 110 }]}
        onPress={resetView}
        activeOpacity={0.85}
      >
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.92)' }]} />
        <Icon name="map-pin" size={18} color="#111416" />
      </TouchableOpacity>

      {/* Bottom spot card */}
      {selected && (
        <View style={[styles.spotCard, { bottom: insets.bottom + 90 }]}>
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.96)' }]} />
          <View style={styles.spotCardInner}>
            <View style={styles.spotCardLeft}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: selected.available ? '#10B981' : '#7B8589' }]} />
                <Text style={styles.statusText}>{selected.available ? 'Ledig nå' : 'Opptatt'}</Text>
                {selected.isLive && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.spotAddress}>{selected.address}</Text>
              {selected.area ? <Text style={styles.spotArea}>{selected.area}</Text> : null}
            </View>
            <View style={styles.spotCardRight}>
              <Text style={styles.spotPrice}>{selected.price}</Text>
              <Text style={styles.spotUnit}>kr/t</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.reserveBtn}
            activeOpacity={0.88}
            onPress={() => openSpot(selected)}
          >
            <LinearGradient
              colors={['#10B981', '#14B8A6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 14 }]}
            />
            <Text style={styles.reserveBtnText}>Se plass</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topOverlay: { position: 'absolute', left: 16, right: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  searchPin: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  searchValue: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },

  filterScroll: { marginTop: 8 },
  filterContent: { gap: 6, paddingRight: 4 },
  filterChip: {
    height: 32, paddingHorizontal: 13, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  filterChipActive: { backgroundColor: '#111416', borderColor: '#111416' },
  filterChipText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#111416' },
  filterChipTextActive: { color: '#fff' },

  locBtn: {
    position: 'absolute', right: 16,
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },

  pin: {
    height: 30, paddingHorizontal: 10, borderRadius: 20,
    backgroundColor: '#111416',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  pinSelected: { height: 34, paddingHorizontal: 12 },
  pinText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  pinTextSelected: { color: '#fff', fontSize: 13 },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderLeftColor: 'transparent',
    borderRightWidth: 5, borderRightColor: 'transparent',
    borderTopWidth: 6, borderTopColor: '#111416',
    alignSelf: 'center',
  },

  spotCard: {
    position: 'absolute', left: 16, right: 16,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 6,
  },
  spotCardInner: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
  spotCardLeft: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 0.8, textTransform: 'uppercase' },
  liveBadge: { backgroundColor: '#10B981', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  liveBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#fff', letterSpacing: 0.5 },
  spotAddress: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  spotArea: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', marginTop: 2 },
  spotCardRight: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  spotPrice: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44 },
  spotUnit: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589' },

  reserveBtn: {
    height: 44, marginHorizontal: 16, marginBottom: 16,
    borderRadius: 14, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  reserveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', letterSpacing: -0.15 },

  bookingBanner: {
    marginTop: 8,
    height: 56, borderRadius: 14, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, gap: 10,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  bookingBannerDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  bookingBannerBody: { flex: 1 },
  bookingBannerCountdown: {
    fontFamily: 'Inter_700Bold', fontSize: 10,
    color: 'rgba(255,255,255,0.8)', letterSpacing: 0.3, textTransform: 'uppercase',
  },
  bookingBannerAddress: {
    fontFamily: 'Inter_700Bold', fontSize: 13,
    color: '#fff', letterSpacing: -0.13, marginTop: 1,
  },
});
