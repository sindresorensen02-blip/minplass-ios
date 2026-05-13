import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SPOTS = [
  { id: 'strand',     address: 'Strandgaten 12',       area: 'Møhlenpris',    distanceKm: 0.4, distance: '0,4 km', walk: '5 min',  price: 45, until: 'Ledig til 18:00', tags: ['Tak over', 'Elbil 11kW'],           featured: true  },
  { id: 'byparken',   address: 'Byparken P3',           area: 'Sentrum',       distanceKm: 0.6, distance: '0,6 km', walk: '7 min',  price: 70, until: 'Ledig til 18:30', tags: ['Innendørs', 'Elbil 22kW', 'Kamera'], featured: false },
  { id: 'olav',       address: 'Olav Kyrres gate 22',   area: 'Sentrum',       distanceKm: 0.7, distance: '0,7 km', walk: '8 min',  price: 60, until: 'Ledig til 16:00', tags: ['Innendørs', 'Kamera'],              featured: false },
  { id: 'nordic',     address: 'Nordic Choice P-plass', area: 'Sentrum',       distanceKm: 0.8, distance: '0,8 km', walk: '10 min', price: 50, until: 'Ledig til 19:00', tags: ['Tak over', 'Elbil 7kW', 'Kamera'],  featured: false },
  { id: 'sandviks',   address: 'Sandviksveien 47',      area: 'Sandviken',     distanceKm: 0.9, distance: '0,9 km', walk: '11 min', price: 38, until: 'Ledig til 20:30', tags: ['Belyst', 'Kamera'],                 featured: false },
  { id: 'nygaard',    address: 'Nygårdsgaten 8',        area: 'Sentrum',       distanceKm: 1.2, distance: '1,2 km', walk: '14 min', price: 55, until: 'Ledig til 17:00', tags: ['Innendørs'],                        featured: false },
  { id: 'danmarkspl', address: 'Danmarksplass 3',       area: 'Sentrum',       distanceKm: 1.5, distance: '1,5 km', walk: '18 min', price: 30, until: 'Ledig til 22:00', tags: ['Belyst'],                           featured: false },
  { id: 'kronstad',   address: 'Kronstad Terrasse',     area: 'Kronstad',      distanceKm: 1.8, distance: '1,8 km', walk: '22 min', price: 28, until: 'Ledig til 21:00', tags: ['Tak over', 'Belyst'],               featured: false },
  { id: 'brann',      address: 'Brann Stadion P-hus',   area: 'Fyllingsdalen', distanceKm: 2.1, distance: '2,1 km', walk: '25 min', price: 25, until: 'Ledig til 23:59', tags: ['Innendørs', 'Belyst', 'Kamera'],    featured: false },
  { id: 'mindemyren', address: 'Mindemyren 12B',        area: 'Mindemyren',    distanceKm: 2.4, distance: '2,4 km', walk: '29 min', price: 20, until: 'Ledig til 23:00', tags: ['Belyst'],                           featured: false },
  { id: 'test1',  address: 'Testeveien 1',  area: 'Testdalen', distanceKm: 0.3, distance: '0,3 km', walk: '4 min',  price: 35, until: 'Ledig til 20:00', tags: ['Belyst', 'Kamera'],              featured: false },
  { id: 'test2',  address: 'Testeveien 2',  area: 'Testdalen', distanceKm: 0.5, distance: '0,5 km', walk: '6 min',  price: 50, until: 'Ledig til 17:30', tags: ['Innendørs'],                     featured: false },
  { id: 'test3',  address: 'Testeveien 3',  area: 'Testdalen', distanceKm: 0.7, distance: '0,7 km', walk: '8 min',  price: 40, until: 'Ledig til 22:00', tags: ['Tak over', 'Belyst'],            featured: false },
  { id: 'test4',  address: 'Testeveien 4',  area: 'Testdalen', distanceKm: 1.0, distance: '1,0 km', walk: '12 min', price: 25, until: 'Ledig til 23:59', tags: ['Belyst'],                        featured: false },
  { id: 'test5',  address: 'Testeveien 5',  area: 'Testdalen', distanceKm: 1.1, distance: '1,1 km', walk: '13 min', price: 60, until: 'Ledig til 16:00', tags: ['Innendørs', 'Elbil 11kW'],      featured: false },
  { id: 'test6',  address: 'Testeveien 6',  area: 'Testdalen', distanceKm: 1.4, distance: '1,4 km', walk: '17 min', price: 30, until: 'Ledig til 21:00', tags: ['Kamera'],                        featured: false },
  { id: 'test7',  address: 'Testeveien 7',  area: 'Testdalen', distanceKm: 1.6, distance: '1,6 km', walk: '19 min', price: 45, until: 'Ledig til 19:30', tags: ['Tak over', 'Kamera'],            featured: false },
  { id: 'test8',  address: 'Testeveien 8',  area: 'Testdalen', distanceKm: 1.9, distance: '1,9 km', walk: '23 min', price: 55, until: 'Ledig til 18:00', tags: ['Innendørs', 'Elbil 22kW'],      featured: false },
  { id: 'test9',  address: 'Testeveien 9',  area: 'Testdalen', distanceKm: 2.2, distance: '2,2 km', walk: '26 min', price: 22, until: 'Ledig til 22:30', tags: ['Belyst'],                        featured: false },
  { id: 'test10', address: 'Testeveien 10', area: 'Testdalen', distanceKm: 2.6, distance: '2,6 km', walk: '31 min', price: 38, until: 'Ledig til 20:00', tags: ['Tak over', 'Belyst', 'Kamera'],  featured: false },
];

const FILTERS = [
  { id: 'near',    label: '< 1 km'       },
  { id: 'ev',      label: 'Elbil lading' },
  { id: 'covered', label: 'Tak over'     },
  { id: 'indoor',  label: 'Innendørs'    },
  { id: 'lit',     label: 'Belyst'       },
  { id: 'camera',  label: 'Kamera'       },
  { id: 'cheap',   label: 'Under 40 kr'  },
];

const SORT_OPTIONS = [
  { id: 'distance',   label: 'Nærmest'      },
  { id: 'price_asc',  label: 'Billigst'     },
  { id: 'price_desc', label: 'Dyrest'       },
  { id: 'avail',      label: 'Lengst ledig' },
];

function matchesFilters(spot, activeFilters) {
  for (const fid of activeFilters) {
    if (fid === 'near'    && spot.distanceKm > 1.0) return false;
    if (fid === 'ev'      && !spot.tags.some(t => t.toLowerCase().startsWith('elbil'))) return false;
    if (fid === 'covered' && !spot.tags.includes('Tak over')) return false;
    if (fid === 'indoor'  && !spot.tags.includes('Innendørs')) return false;
    if (fid === 'lit'     && !spot.tags.includes('Belyst')) return false;
    if (fid === 'camera'  && !spot.tags.includes('Kamera')) return false;
    if (fid === 'cheap'   && spot.price >= 40) return false;
  }
  return true;
}

function applySort(list, sortBy) {
  const arr = [...list];
  if (sortBy === 'price_asc')  return arr.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') return arr.sort((a, b) => b.price - a.price);
  if (sortBy === 'avail')      return arr.sort((a, b) => b.until.localeCompare(a.until));
  return arr.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
}

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [sortBy, setSortBy] = useState('distance');
  const [showSortModal, setShowSortModal] = useState(false);
  const [spots, setSpots] = useState(SPOTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const searchRef = useRef(null);

  const fetchSpots = () => {
    setRefreshing(true);
    supabase
      .from('spots')
      .select('*')
      .eq('active', true)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const liveSpots = data.map((s, i) => ({
            id: s.id,
            address: s.address,
            area: '',
            distanceKm: 99,
            distance: '',
            walk: '',
            price: s.price_per_hour,
            until: `Ledig til ${(s.available_to ?? '20:00').slice(0, 5)}`,
            tags: s.amenities ?? [],
            featured: i === 0,
          }));
          setSpots([...liveSpots, ...SPOTS]);
        }
        setRefreshing(false);
      });
  };

  useEffect(() => { fetchSpots(); }, []);

  useEffect(() => {
    return navigation.getParent()?.addListener('tabPress', () => {
      if ((navigation.getState()?.routes?.length ?? 1) > 1) navigation.popToTop();
    });
  }, [navigation]);

  const toggleFilter = (id) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const visibleSpots = useMemo(() => {
    let list = spots.filter(s => matchesFilters(s, activeFilters));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(s =>
        s.address.toLowerCase().includes(q) ||
        (s.area ?? '').toLowerCase().includes(q),
      );
    }
    return applySort(list, sortBy);
  }, [spots, activeFilters, sortBy, searchQuery]);

  const [ratingTarget, setRatingTarget]   = useState(null);
  const [ratingValue, setRatingValue]     = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submitting, setSubmitting]       = useState(false);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    (async () => {
      const now    = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const { data: res } = await supabase
        .from('reservations')
        .select('id, ends_at, spot_id, spots(address)')
        .eq('renter_id', user.id)
        .in('status', ['confirmed', 'completed'])
        .lt('ends_at', now.toISOString())
        .gt('ends_at', cutoff.toISOString())
        .order('ends_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!res) return;
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('reservation_id', res.id)
        .maybeSingle();
      if (!existing) setRatingTarget(res);
    })();
  }, [user]));

  const submitRating = async () => {
    if (!ratingValue || !ratingTarget) return;
    setSubmitting(true);
    await supabase.from('reviews').insert({
      reservation_id: ratingTarget.id,
      spot_id:        ratingTarget.spot_id,
      renter_id:      user.id,
      rating:         ratingValue,
      comment:        ratingComment.trim() || null,
    });
    setSubmitting(false);
    setRatingTarget(null);
    setRatingValue(0);
    setRatingComment('');
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? 'deg';
  const activeSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label ?? 'Nærmest';
  const hasFilters = activeFilters.size > 0;

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#F7F7F2' }]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 76 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={fetchSpots} activeOpacity={0.7} disabled={refreshing}>
              <Image source={require('../../assets/icon.png')} style={[styles.logo, refreshing && { opacity: 0.5 }]} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hei {firstName}</Text>
              <Text style={styles.headerTitle}>Finn en plass</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Varsler')}>
            <Icon name="bell" size={18} color="#111416" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => searchRef.current?.focus()}
        >
          <View style={styles.searchPin}>
            <Icon name="map-pin" size={15} color="#fff" />
          </View>
          <View style={styles.searchText}>
            <Text style={styles.searchLabel}>Hvor skal du?</Text>
            <TextInput
              ref={searchRef}
              style={styles.searchValue}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Adresse eller område..."
              placeholderTextColor="#BCC5CB"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Icon name="x" size={18} color="#7B8589" strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <Icon name="search" size={18} color="#7B8589" />
          )}
        </TouchableOpacity>

        {/* Filters row + sort button */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersContent}>
            {FILTERS.map((f) => (
              <TouchableOpacity key={f.id} onPress={() => toggleFilter(f.id)} style={[styles.filterChip, activeFilters.has(f.id) && styles.filterChipActive]}>
                <Text style={[styles.filterText, activeFilters.has(f.id) && styles.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowSortModal(true)} style={[styles.sortBtn, hasFilters && styles.sortBtnActive]}>
            <Icon name="filter" size={14} color={hasFilters ? '#fff' : '#2F3437'} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Section heading */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>{visibleSpots.length} plasser · {activeSortLabel}</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Kart')}>
            <Text style={styles.sectionLink}>Se kart</Text>
          </TouchableOpacity>
        </View>

        {/* Spot cards */}
        {visibleSpots.length > 0 ? (
          visibleSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} onPress={() => navigation.navigate('LiveSpot', { spot })} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search" size={32} color="#BCC5CB" />
            <Text style={styles.emptyText}>Ingen plasser matcher filteret</Text>
            <TouchableOpacity onPress={() => setActiveFilters(new Set())} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Nullstill filter</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sort / filter modal */}
      <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sorter og filtrer</Text>

            <Text style={styles.modalSection}>Sorter etter</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => { setSortBy(opt.id); setShowSortModal(false); }} style={styles.sortOption}>
                <Text style={[styles.sortOptionText, sortBy === opt.id && styles.sortOptionTextActive]}>{opt.label}</Text>
                {sortBy === opt.id && <Icon name="check" size={16} color="#10B981" strokeWidth={2.5} />}
              </TouchableOpacity>
            ))}

            {hasFilters && (
              <TouchableOpacity onPress={() => { setActiveFilters(new Set()); setShowSortModal(false); }} style={styles.clearAllBtn}>
                <Text style={styles.clearAllText}>Nullstill alle filtre</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rating prompt */}
      <Modal visible={!!ratingTarget} transparent animationType="slide" onRequestClose={() => setRatingTarget(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setRatingTarget(null)}>
          <Pressable style={[styles.ratingSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.ratingIconWrap}>
              <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]} />
              <Icon name="map-pin" size={22} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.ratingTitle}>Hvordan var parkeringen?</Text>
            <Text style={styles.ratingSub}>{ratingTarget?.spots?.address ?? ''}</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRatingValue(n)} activeOpacity={0.7} style={styles.starBtn}>
                  <Text style={[styles.starChar, n <= ratingValue && styles.starCharActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.ratingInput}
              placeholder="Legg til kommentar (valgfritt)"
              placeholderTextColor="#BCC5CB"
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
              maxLength={200}
            />

            <TouchableOpacity
              onPress={submitRating}
              style={[styles.ratingSubmit, !ratingValue && { opacity: 0.4 }]}
              activeOpacity={0.88}
              disabled={!ratingValue || submitting}
            >
              <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.ratingSubmitText}>Send inn vurdering</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setRatingTarget(null)} style={styles.ratingSkip}>
              <Text style={styles.ratingSkipText}>Hopp over</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SpotCard({ spot, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.spotCard}>
      <LinearGradient colors={['#10B981', '#14B8A6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
      <View style={styles.cardAccentPill} />
      <View style={styles.spotInner}>
        <View style={styles.spotRow}>
          <View style={styles.spotLeft}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.untilText}>{spot.until}</Text>
            </View>
            <Text style={styles.addressText} numberOfLines={1}>{spot.address}</Text>
            <Text style={styles.metaText}>{[spot.area, spot.distance && `${spot.distance} · ${spot.walk} gange`].filter(Boolean).join(' · ')}</Text>
            <View style={styles.tagRow}>
              {spot.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.spotRight}>
            <View style={styles.priceRow}>
              <Text style={styles.priceNum}>{spot.price}</Text>
              <Text style={styles.priceUnit}>kr/t</Text>
            </View>
            <View style={[styles.arrowBtn, { backgroundColor: '#10B981' }]}>
              <Icon name="arrow-right" size={14} color="#fff" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerText: { flex: 1 },
  logo: { width: 90, height: 90, borderRadius: 20, marginLeft: -16 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  greeting: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589', letterSpacing: 0.8, textTransform: 'uppercase' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#111416', letterSpacing: -0.36 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', marginBottom: 12,
    shadowColor: '#111416', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3,
  },
  searchPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  searchText: { flex: 1, minWidth: 0 },
  searchLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase' },
  searchValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14, padding: 0 },

  filtersWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  filtersRow: { flex: 1 },
  filtersContent: { gap: 6, paddingRight: 4 },
  filterChip: { height: 30, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  filterChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  filterText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#2F3437', letterSpacing: -0.12 },
  filterTextActive: { color: '#fff' },
  sortBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sortBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },

  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionLink: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#5FAFD3' },

  spotCard: { borderRadius: 22, marginBottom: 8, overflow: 'hidden', shadowColor: '#111416', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 3 },
  spotInner: { padding: 14 },
  spotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  spotLeft: { flex: 1, minWidth: 0 },
  spotRight: { alignItems: 'flex-end', gap: 6 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9FD6B4' },
  untilText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' },
  addressText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff', letterSpacing: -0.32, marginTop: 4 },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  tag: { height: 22, paddingHorizontal: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.1 },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  priceNum: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#fff', letterSpacing: -0.36 },
  priceUnit: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  cardAccentPill: { position: 'absolute', width: 160, height: 72, borderRadius: 36, backgroundColor: '#064E3B', bottom: -22, right: -28, transform: [{ rotate: '-18deg' }], opacity: 0.75 },
  arrowBtn: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#7B8589', marginTop: 12, marginBottom: 16 },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(17,20,22,0.08)' },
  clearBtnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#111416' },

  ratingSheet: { backgroundColor: '#F8FAF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, alignItems: 'center' },
  ratingIconWrap: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  ratingTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44, marginBottom: 4, textAlign: 'center' },
  ratingSub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589', marginBottom: 22, textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  starBtn: { padding: 4 },
  starChar: { fontSize: 38, color: 'rgba(17,20,22,0.15)' },
  starCharActive: { color: '#F59E0B' },
  ratingInput: { width: '100%', minHeight: 72, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#111416', marginBottom: 14, textAlignVertical: 'top' },
  ratingSubmit: { width: '100%', height: 52, borderRadius: 999, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  ratingSubmitText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', letterSpacing: -0.15 },
  ratingSkip: { paddingVertical: 12 },
  ratingSkipText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#7B8589' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.42)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDE1E4', alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#111416', letterSpacing: -0.36, marginBottom: 20 },
  modalSection: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(17,20,22,0.06)' },
  sortOptionText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#2F3437' },
  sortOptionTextActive: { fontFamily: 'Inter_700Bold', color: '#111416' },
  clearAllBtn: { marginTop: 16, paddingVertical: 14, alignItems: 'center', borderRadius: 14, backgroundColor: 'rgba(229,62,62,0.08)' },
  clearAllText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#C53030' },
});
