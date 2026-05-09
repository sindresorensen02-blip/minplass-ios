import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, shadow, typography } from '../theme';
import { SearchBar, FilterPill, PrimaryButton, GlassCard } from '../components/Primitives';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';

const SPOTS = [
  {
    id: 'strand',
    address: 'Strandgaten 12',
    area: 'Møhlenpris',
    distance: '0,4 km',
    walk: '5 min',
    price: 45,
    until: 'Ledig til 18:00',
    tags: ['Tak over', 'Elbil 11kW'],
    featured: true,
  },
  {
    id: 'sandviks',
    address: 'Sandviksveien 47',
    area: 'Sandviken',
    distance: '0,9 km',
    walk: '11 min',
    price: 38,
    until: 'Ledig til 20:30',
    tags: ['Belyst', 'Kamera'],
    featured: false,
  },
  {
    id: 'nygaard',
    address: 'Nygårdsgaten 8',
    area: 'Sentrum',
    distance: '1,2 km',
    walk: '14 min',
    price: 55,
    until: 'Ledig til 17:00',
    tags: ['Innendørs'],
    featured: false,
  },
];

const FILTERS = [
  { id: 'now',      label: 'Nå' },
  { id: 'near',     label: 'Nær meg' },
  { id: 'ev',       label: 'Elbil' },
  { id: 'covered',  label: 'Tak' },
];

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('now');
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={styles.root}>
      {/* Background */}
      <LinearGradient
        colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>God morgen</Text>
            <Text style={styles.subGreeting}>Finn en ledig plass i Bergen</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>EH</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Hvor skal du?"
          style={styles.search}
        />

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((f) => (
            <FilterPill
              key={f.id}
              active={activeFilter === f.id}
              onPress={() => setActiveFilter(f.id)}
            >
              {f.label}
            </FilterPill>
          ))}
        </ScrollView>

        {/* Section heading */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>LEDIGE NÅ · 12 PLASSER</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Se kart</Text>
          </TouchableOpacity>
        </View>

        {/* Spot list */}
        {SPOTS.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onPress={() => navigation.navigate('LiveSpot', { spot })}
          />
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + 72 }]}>
        <PrimaryButton
          onPress={() => navigation.navigate('LiveSpot', { spot: SPOTS[0] })}
          full
          icon={<Icon name="arrow-right" size={16} color="#fff" />}
        >
          Reserver Strandgaten 12
        </PrimaryButton>
      </View>

      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

function SpotCard({ spot, onPress }) {
  if (spot.featured) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.spotFeatured}>
        <LinearGradient
          colors={['#2F3437', '#111416']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]}
        />
        <SpotCardContent spot={spot} dark />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.spotCard}
    >
      <SpotCardContent spot={spot} dark={false} />
    </TouchableOpacity>
  );
}

function SpotCardContent({ spot, dark }) {
  const textColor = dark ? '#fff' : colors.fg1;
  const muteColor = dark ? 'rgba(255,255,255,0.65)' : colors.fg3;

  return (
    <View style={styles.spotInner}>
      <View style={styles.spotRow}>
        <View style={styles.spotLeft}>
          <View style={styles.spotUntilRow}>
            <View style={[styles.statusDot, { backgroundColor: '#9FD6B4' }]} />
            <Text style={[styles.spotUntil, { color: muteColor }]}>{spot.until}</Text>
          </View>
          <Text style={[styles.spotAddress, { color: textColor }]} numberOfLines={1}>
            {spot.address}
          </Text>
          <Text style={[styles.spotMeta, { color: muteColor }]}>
            {spot.area} · {spot.distance} · {spot.walk} gange
          </Text>
        </View>
        <View style={styles.spotRight}>
          <View style={[styles.pricePill, dark ? styles.pricePillLight : styles.pricePillDark]}>
            <Text style={[styles.priceText, { color: dark ? colors.fg1 : '#fff' }]}>
              {spot.price} kr
            </Text>
            <Text style={[styles.priceUnit, { color: dark ? colors.fg2 : 'rgba(255,255,255,0.7)' }]}>
              /t
            </Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagRow}>
        {spot.tags.map((tag) => (
          <View key={tag} style={[styles.tag, dark ? styles.tagDark : styles.tagLight]}>
            <Text style={[styles.tagText, { color: dark ? 'rgba(255,255,255,0.8)' : colors.fg2 }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s5 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s4,
  },
  greeting: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 26,
    color: colors.fg1,
    letterSpacing: -0.52,
  },
  subGreeting: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.fg3,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: colors.fg1,
  },

  search: { marginBottom: spacing.s3 },

  // Filters
  filtersRow: { marginBottom: spacing.s4 },
  filtersContent: { gap: 8, paddingRight: spacing.s5 },

  // Section
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s3,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.88,
    color: colors.fg3,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.accentBlue,
  },

  // Spot cards
  spotFeatured: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.s2,
    ...shadow(1),
  },
  spotCard: {
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.s2,
    ...shadow(1),
  },
  spotInner: { padding: spacing.s4 },
  spotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  spotLeft: { flex: 1, minWidth: 0 },
  spotRight: { alignItems: 'flex-end' },

  spotUntilRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  spotUntil: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  spotAddress: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.32,
  },
  spotMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 4,
  },

  // Price
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    gap: 2,
  },
  pricePillDark: { backgroundColor: colors.charcoal },
  pricePillLight: { backgroundColor: 'rgba(255,255,255,0.22)' },
  priceText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  priceUnit: { fontFamily: 'Inter_500Medium', fontSize: 12 },

  // Tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.s3 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.sm },
  tagDark: { backgroundColor: 'rgba(255,255,255,0.12)' },
  tagLight: { backgroundColor: 'rgba(23,33,31,0.07)' },
  tagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  // CTA
  cta: {
    position: 'absolute',
    bottom: 0,
    left: spacing.s5,
    right: spacing.s5,
  },
});
