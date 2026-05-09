import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import BottomNav from '../components/BottomNav';

const PERIODS = [
  { id: 'week',  label: 'Uke',   heading: 'denne uken',    value: '1 240', total: '4 820 kr / måned' },
  { id: 'month', label: 'Måned', heading: 'denne måneden', value: '4 820', total: '54 600 kr / år' },
  { id: 'year',  label: 'År',    heading: 'i år',          value: '54 600', total: '4 utleiere i ditt nabolag' },
];

const BARS = [36, 48, 22, 60, 44, 86, 52];
const BAR_DAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

const SPOTS = [
  { id: 'innk',    title: 'Innkjørsel · Møhlenpris', sub: 'Aktiv · 8 reservasjoner', price: '45', active: true },
  { id: 'garasje', title: 'Garasje · Sandviken',     sub: 'Pause · gjenoppta',       price: '75', active: false },
];

export default function HostScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('profile');
  const cur = PERIODS.find(p => p.id === period);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Utleier</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="bell" size={18} color="#111416" />
          </TouchableOpacity>
        </View>

        {/* Earnings heading */}
        <View style={styles.earningsSection}>
          <Text style={styles.earningsLabel}>Inntekt · {cur.heading}</Text>
          <Text style={styles.earningsValue}>{cur.value} kr</Text>
          <Text style={styles.earningsSub}>{cur.heading}.</Text>
        </View>

        {/* Period switcher */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => setPeriod(p.id)} style={[styles.periodBtn, period === p.id && styles.periodBtnActive]}>
              <Text style={[styles.periodText, period === p.id && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dark earnings card */}
        <View style={styles.earningsCard}>
          <LinearGradient colors={['#2F3437', '#111416']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 34 }]} />
          <View style={styles.cardBlob1} />
          <View style={styles.cardBlob2} />
          <View style={styles.cardInner}>
            <Text style={styles.cardTrend}>Trend · {cur.total}</Text>
            <View style={styles.cardValueRow}>
              <Text style={styles.cardValue}>{cur.value}</Text>
              <Text style={styles.cardUnit}>kr</Text>
            </View>
            {/* Bar chart */}
            <View style={styles.barsContainer}>
              {BARS.map((h, i) => (
                <View key={i} style={styles.barWrap}>
                  <View style={[styles.bar, { height: `${h}%`, backgroundColor: i === 5 ? '#9FD6B4' : 'rgba(255,255,255,0.22)' }]} />
                </View>
              ))}
            </View>
            <View style={styles.barLabels}>
              {BAR_DAYS.map((d, i) => (
                <Text key={i} style={[styles.barLabel, { color: i === 5 ? '#9FD6B4' : 'rgba(255,255,255,0.5)' }]}>{d}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Spot rows */}
        {SPOTS.map((spot) => (
          <TouchableOpacity key={spot.id} style={styles.spotRow} activeOpacity={0.85}>
            <View style={[styles.spotDot, { backgroundColor: spot.active ? 'rgba(159,214,180,0.3)' : 'rgba(17,20,22,0.07)' }]}>
              <View style={[styles.spotDotInner, { backgroundColor: spot.active ? '#3FA66B' : '#7B8589' }]} />
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotTitle}>{spot.title}</Text>
              <Text style={styles.spotSub}>{spot.sub}</Text>
            </View>
            <Text style={styles.spotPrice}>{spot.price} kr/t</Text>
            <Icon name="chevron-right" size={16} color="#7B8589" />
          </TouchableOpacity>
        ))}

        {/* CTA */}
        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.ctaText}>Lei ut en plass til</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#111416', letterSpacing: -0.13 },

  earningsSection: { marginBottom: 16 },
  earningsLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589', letterSpacing: 1, textTransform: 'uppercase' },
  earningsValue: { fontFamily: 'Inter_700Bold', fontSize: 42, color: '#111416', letterSpacing: -1.26, marginTop: 6, lineHeight: 46 },
  earningsSub: { fontFamily: 'Inter_600SemiBold', fontSize: 22, color: '#7B8589', letterSpacing: -0.44 },

  periodRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  periodBtn: { flex: 1, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' },
  periodBtnActive: { backgroundColor: '#111416', borderColor: '#111416' },
  periodText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#111416', letterSpacing: -0.13 },
  periodTextActive: { color: '#fff' },

  earningsCard: { borderRadius: 34, overflow: 'hidden', padding: 22, marginBottom: 16, shadowColor: '#111416', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.18, shadowRadius: 48, elevation: 10 },
  cardBlob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(95,175,211,0.32)', top: 0, right: 0 },
  cardBlob2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(159,214,180,0.22)', bottom: 0, left: 0 },
  cardInner: { position: 'relative' },
  cardTrend: { fontFamily: 'Inter_700Bold', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' },
  cardValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 },
  cardValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 46, color: '#fff', letterSpacing: -1.38 },
  cardUnit: { fontFamily: 'Inter_500Medium', fontSize: 16, color: 'rgba(255,255,255,0.65)' },

  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 64, marginTop: 20 },
  barWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6 },
  barLabels: { flexDirection: 'row', marginTop: 8, gap: 6 },
  barLabel: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 10, textAlign: 'center' },

  spotRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  spotDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  spotDotInner: { width: 10, height: 10, borderRadius: 5 },
  spotInfo: { flex: 1 },
  spotTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  spotSub: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', marginTop: 2 },
  spotPrice: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111416' },

  cta: { height: 56, borderRadius: 999, backgroundColor: '#DCEBDF', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.16 },
});
