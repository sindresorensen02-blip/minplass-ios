import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { colors, radii, spacing, shadow, typography } from '../theme';
import { HostCTAButton } from '../components/Primitives';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';

const PERIODS = ['Uke', 'Måned', 'År'];

const WEEKLY_BARS = [
  { day: 'Ma', amount: 135 },
  { day: 'Ti', amount: 270 },
  { day: 'On', amount: 90  },
  { day: 'To', amount: 315 },
  { day: 'Fr', amount: 180 },
  { day: 'Lø', amount: 225 },
  { day: 'Sø', amount: 25  },
];

const MY_SPOTS = [
  {
    id: 'innk',
    title: 'Innkjørsel',
    area: 'Møhlenpris',
    status: 'active',
    bookings: 8,
    price: 45,
  },
  {
    id: 'garasje',
    title: 'Garasje',
    area: 'Sandviken',
    status: 'paused',
    bookings: 0,
    price: 75,
  },
];

const BAR_MAX = Math.max(...WEEKLY_BARS.map((b) => b.amount));

export default function HostScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

  const totalEarnings = period === 0
    ? '1 240 kr'
    : period === 1
    ? '4 830 kr'
    : '58 560 kr';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Utleier</Text>
            <Text style={styles.headerSub}>Din oversikt</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Icon name="bell" size={20} color={colors.fg2} />
          </TouchableOpacity>
        </View>

        {/* Period switcher */}
        <View style={styles.periodRow}>
          {PERIODS.map((p, i) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(i)}
              style={[styles.periodBtn, period === i && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, period === i && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Earnings display */}
        <Text style={styles.earningsLabel}>
          {period === 0 ? 'Denne uken' : period === 1 ? 'Denne måneden' : 'I år'}
        </Text>
        <Text style={styles.earningsValue}>{totalEarnings}</Text>

        {/* Chart card */}
        <LinearGradient
          colors={['#2F3437', '#111416']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chartCard}
        >
          <Text style={styles.chartTitle}>Ukens inntekter</Text>
          <View style={styles.chartBars}>
            {WEEKLY_BARS.map((bar) => {
              const h = Math.max(4, (bar.amount / BAR_MAX) * 72);
              return (
                <View key={bar.day} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: h }]} />
                  </View>
                  <Text style={styles.barLabel}>{bar.day}</Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {/* My spots */}
        <Text style={styles.spotSectionTitle}>Mine plasser</Text>

        {MY_SPOTS.map((spot) => (
          <TouchableOpacity key={spot.id} style={styles.spotRow} activeOpacity={0.85}>
            <BlurView intensity={30} tint="light" style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]} />
            <View style={styles.spotLeft}>
              <View style={[styles.spotIcon, { backgroundColor: spot.status === 'active' ? colors.bgMint : colors.bgSilver }]}>
                <Icon name="map-pin" size={18} color={colors.fg2} />
              </View>
              <View>
                <Text style={styles.spotTitle}>{spot.title}</Text>
                <Text style={styles.spotMeta}>{spot.area} · {spot.price} kr/t</Text>
              </View>
            </View>
            <View style={styles.spotRight}>
              <View style={[styles.spotStatus, spot.status === 'active' ? styles.statusActive : styles.statusPaused]}>
                <Text style={[styles.spotStatusText, spot.status === 'active' ? styles.statusActiveText : styles.statusPausedText]}>
                  {spot.status === 'active' ? `${spot.bookings} bookinger` : 'Pauset'}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.fg3} />
            </View>
          </TouchableOpacity>
        ))}

        {/* CTA */}
        <HostCTAButton full onPress={() => {}} style={styles.addCTA}>
          + Lei ut en plass til
        </HostCTAButton>
      </ScrollView>

      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.s5 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s5,
  },
  headerTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 26,
    color: colors.fg1,
    letterSpacing: -0.52,
  },
  headerSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.fg3,
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(1),
  },

  // Period switcher
  periodRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(23,33,31,0.06)',
    borderRadius: radii.pill,
    padding: 4,
    marginBottom: spacing.s4,
  },
  periodBtn: {
    flex: 1,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtnActive: {
    backgroundColor: '#fff',
    ...shadow(1),
  },
  periodText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.fg3,
  },
  periodTextActive: { color: colors.fg1 },

  // Earnings
  earningsLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.fg3,
    letterSpacing: 0.52,
    textTransform: 'uppercase',
  },
  earningsValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 42,
    color: colors.fg1,
    letterSpacing: -1.26,
    marginTop: spacing.s1,
    marginBottom: spacing.s5,
  },

  // Chart
  chartCard: {
    borderRadius: radii.card,
    padding: spacing.s5,
    marginBottom: spacing.s5,
    ...shadow(3),
  },
  chartTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.52,
    textTransform: 'uppercase',
    marginBottom: spacing.s4,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 96,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
  },
  bar: {
    width: '100%',
    backgroundColor: '#5FAFD3',
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },

  // Spots section
  spotSectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.fg1,
    letterSpacing: -0.36,
    marginBottom: spacing.s3,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.s4,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.s2,
    ...shadow(1),
  },
  spotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spotIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.fg1,
    letterSpacing: -0.15,
  },
  spotMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.fg3,
    marginTop: 2,
  },
  spotRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spotStatus: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  statusActive: { backgroundColor: 'rgba(139,207,176,0.25)' },
  statusPaused: { backgroundColor: 'rgba(23,33,31,0.07)' },
  spotStatusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  statusActiveText: { color: '#2D7A50' },
  statusPausedText: { color: colors.fg3 },

  // Add CTA
  addCTA: { marginTop: spacing.s3 },
});
