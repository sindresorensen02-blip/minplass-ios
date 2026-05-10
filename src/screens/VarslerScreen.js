import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const GROUPS = [
  {
    title: 'Bookingvarsler',
    rows: [
      { id: 'confirm',  label: 'Bookingbekreftelse',    hint: 'Når reservasjon er godkjent',    default: true },
      { id: 'reminder', label: 'Påminnelse 30 min før', hint: 'Før parkeringen starter',        default: true },
      { id: 'end',      label: 'Parkering avsluttes',   hint: '10 minutter før tid utløper',    default: true },
    ],
  },
  {
    title: 'Kommunikasjon',
    rows: [
      { id: 'message',  label: 'Meldinger fra utleier', hint: 'Direkte meldinger',              default: true },
      { id: 'review',   label: 'Be om vurdering',       hint: 'Etter fullført parkering',       default: false },
    ],
  },
  {
    title: 'Markedsføring',
    rows: [
      { id: 'offers',   label: 'Tilbud og rabatter',    hint: 'Spesialtilbud i ditt område',    default: false },
      { id: 'news',     label: 'Nyheter og oppdateringer', hint: 'MinPlass-nyheter',            default: false },
      { id: 'email',    label: 'E-postvarsler',          hint: 'Ukentlig oppsummering',         default: true },
    ],
  },
];

export default function VarslerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const initial = {};
  GROUPS.forEach(g => g.rows.forEach(r => { initial[r.id] = r.default; }));
  const [toggles, setToggles] = useState(initial);

  const toggle = (id) => setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  const allOn = Object.values(toggles).every(Boolean);
  const toggleAll = () => {
    const val = !allOn;
    const next = {};
    Object.keys(toggles).forEach(k => { next[k] = val; });
    setToggles(next);
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Varsler</Text>
          <View style={s.backBtn} />
        </View>

        {/* Master toggle */}
        <View style={s.masterCard}>
          <View style={s.masterLeft}>
            <Text style={s.masterLabel}>Alle varsler</Text>
            <Text style={s.masterHint}>{allOn ? 'Alle varsler er på' : 'Noen varsler er av'}</Text>
          </View>
          <Switch value={allOn} onValueChange={toggleAll} trackColor={{ false: '#E5E7EB', true: '#111416' }} thumbColor="#fff" />
        </View>

        {GROUPS.map((group) => (
          <View key={group.title} style={s.section}>
            <Text style={s.sectionLabel}>{group.title}</Text>
            <View style={s.card}>
              {group.rows.map((row, i) => (
                <View key={row.id}>
                  {i > 0 && <View style={s.divider} />}
                  <View style={s.row}>
                    <View style={s.rowText}>
                      <Text style={s.rowLabel}>{row.label}</Text>
                      <Text style={s.rowHint}>{row.hint}</Text>
                    </View>
                    <Switch value={toggles[row.id]} onValueChange={() => toggle(row.id)} trackColor={{ false: '#E5E7EB', true: '#111416' }} thumbColor="#fff" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  masterCard: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, marginBottom: 24 },
  masterLeft: { flex: 1 },
  masterLabel: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#111416', letterSpacing: -0.15 },
  masterHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#7B8589', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: 'rgba(17,20,22,0.05)', marginLeft: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  rowHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#7B8589', marginTop: 1 },
});
