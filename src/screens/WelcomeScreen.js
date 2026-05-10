import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const SPOTS = [
  { id: 'strand',   address: 'Strandgaten 12',   area: 'Møhlenpris', distance: '0,4 km', walk: '5 min',  price: 45, until: 'Ledig til 18:00', tags: ['Tak over', 'Elbil 11kW'], featured: true },
  { id: 'sandviks', address: 'Sandviksveien 47',  area: 'Sandviken',  distance: '0,9 km', walk: '11 min', price: 38, until: 'Ledig til 20:30', tags: ['Belyst', 'Kamera'],       featured: false },
  { id: 'nygaard',  address: 'Nygårdsgaten 8',    area: 'Sentrum',    distance: '1,2 km', walk: '14 min', price: 55, until: 'Ledig til 17:00', tags: ['Innendørs'],              featured: false },
];

const FILTERS = [
  { id: 'now', label: 'Nå' },
  { id: 'near', label: '< 1 km' },
  { id: 'ev', label: 'Elbil' },
  { id: 'covered', label: 'Tak over' },
];

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('now');

  useEffect(() => {
    return navigation.getParent()?.addListener('tabPress', () => {
      navigation.popToTop();
    });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hei Julia</Text>
              <Text style={styles.headerTitle}>Finn en plass</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Icon name="bell" size={18} color="#111416" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <View style={styles.searchPin}>
            <Icon name="map-pin" size={15} color="#fff" />
          </View>
          <View style={styles.searchText}>
            <Text style={styles.searchLabel}>Hvor skal du?</Text>
            <Text style={styles.searchValue} numberOfLines={1}>Møhlenpris, Bergen</Text>
          </View>
          <Icon name="search" size={18} color="#7B8589" />
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersContent}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f.id} onPress={() => setActiveFilter(f.id)} style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}>
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section heading */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Ledige nå · 12 plasser</Text>
          <Text style={styles.sectionLink}>Se kart</Text>
        </View>

        {/* Spot cards */}
        {SPOTS.map((spot) => (
          <SpotCard key={spot.id} spot={spot} onPress={() => navigation.navigate('LiveSpot', { spot })} />
        ))}

        {/* Bottom CTA */}
        <TouchableOpacity onPress={() => navigation.navigate('LiveSpot', { spot: SPOTS[0] })} activeOpacity={0.88} style={styles.ctaBtn}>
          <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
          <Text style={styles.ctaText}>Reserver Strandgaten 12</Text>
          <View style={styles.ctaArrow}>
            <Icon name="arrow-right" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
}

function SpotCard({ spot, onPress }) {
  const dark = spot.featured;
  const textColor = dark ? '#fff' : '#111416';
  const muteColor = dark ? 'rgba(255,255,255,0.7)' : '#7B8589';
  const tagBg = dark ? 'rgba(255,255,255,0.14)' : 'rgba(17,20,22,0.06)';
  const tagTextColor = dark ? 'rgba(255,255,255,0.85)' : '#2F3437';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[styles.spotCard, dark && styles.spotFeatured]}>
      {dark && (
        <>
          <LinearGradient colors={['#2F3437', '#111416']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
          <View style={styles.featuredBlob} />
        </>
      )}
      <View style={styles.spotInner}>
        <View style={styles.spotRow}>
          <View style={styles.spotLeft}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={[styles.untilText, { color: muteColor }]}>{spot.until}</Text>
            </View>
            <Text style={[styles.addressText, { color: textColor }]} numberOfLines={1}>{spot.address}</Text>
            <Text style={[styles.metaText, { color: muteColor }]}>{spot.area} · {spot.distance} · {spot.walk} gange</Text>
            <View style={styles.tagRow}>
              {spot.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color: tagTextColor }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.spotRight}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceNum, { color: textColor }]}>{spot.price}</Text>
              <Text style={[styles.priceUnit, { color: muteColor }]}>kr/t</Text>
            </View>
            <View style={styles.arrowBtn}>
              {dark ? (
                <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]} />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#111416', borderRadius: 16 }]} />
              )}
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
  searchPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111416', alignItems: 'center', justifyContent: 'center' },
  searchText: { flex: 1, minWidth: 0 },
  searchLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase' },
  searchValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },

  filtersRow: { marginBottom: 18 },
  filtersContent: { gap: 6, paddingRight: 20 },
  filterChip: { height: 30, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  filterChipActive: { backgroundColor: '#111416', borderColor: '#111416' },
  filterText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#2F3437', letterSpacing: -0.12 },
  filterTextActive: { color: '#fff' },

  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionLink: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#5FAFD3' },

  spotCard: { borderRadius: 22, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', shadowColor: '#111416', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  spotFeatured: { overflow: 'hidden', backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0.07 },
  featuredBlob: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(95,175,211,0.32)', top: 0, right: 0 },
  spotInner: { padding: 14 },
  spotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  spotLeft: { flex: 1, minWidth: 0 },
  spotRight: { alignItems: 'flex-end', gap: 6 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9FD6B4' },
  untilText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  addressText: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: -0.32, marginTop: 4 },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 2 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  tag: { height: 22, paddingHorizontal: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: -0.1 },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  priceNum: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, letterSpacing: -0.36 },
  priceUnit: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  arrowBtn: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },

  ctaBtn: { height: 56, borderRadius: 999, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 26, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.34, shadowRadius: 28, elevation: 8 },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff', letterSpacing: -0.16, flex: 1 },
  ctaArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});
