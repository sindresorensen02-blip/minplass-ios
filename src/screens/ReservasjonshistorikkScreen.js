import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const HISTORY = [
  { id: '1', address: 'Strandgaten 12',  area: 'Møhlenpris', date: '5. mai 2026',    duration: '2 t',   price: 109, status: 'fullfort' },
  { id: '2', address: 'Nygårdsgaten 8',  area: 'Sentrum',    date: '1. mai 2026',    duration: '1 t',   price: 74,  status: 'fullfort' },
  { id: '3', address: 'Sandviksveien 47',area: 'Sandviken',  date: '28. apr 2026',   duration: '3 t',   price: 163, status: 'fullfort' },
  { id: '4', address: 'Damsgårdsveien 3',area: 'Laksevåg',   date: '20. apr 2026',   duration: '30m',   price: 54,  status: 'avbrutt' },
  { id: '5', address: 'Strandgaten 12',  area: 'Møhlenpris', date: '12. apr 2026',   duration: '4 t',   price: 218, status: 'fullfort' },
];

const STATUS = {
  fullfort: { label: 'Fullført', color: '#1F6B47', bg: 'rgba(63,166,107,0.12)', dot: '#3FA66B' },
  avbrutt:  { label: 'Avbrutt',  color: '#92400E', bg: 'rgba(217,119,6,0.12)',  dot: '#D97706' },
  kommende: { label: 'Kommende', color: '#1E40AF', bg: 'rgba(37,99,235,0.12)',  dot: '#2563EB' },
};

export default function ReservasjonshistorikkScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('alle');

  const filtered = filter === 'alle' ? HISTORY : HISTORY.filter(h => h.status === filter);
  const total = HISTORY.filter(h => h.status === 'fullfort').reduce((sum, h) => sum + h.price, 0);

  return (
    <View style={s.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Historikk</Text>
          <View style={s.backBtn} />
        </View>

        {/* Summary card */}
        <View style={s.summaryCard}>
          <LinearGradient colors={['#2F3437', '#111416']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
          <View style={s.blob} />
          <View style={s.summaryInner}>
            <View style={s.summaryBlock}>
              <Text style={s.summaryValue}>{HISTORY.filter(h => h.status === 'fullfort').length}</Text>
              <Text style={s.summaryLabel}>Fullførte</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryBlock}>
              <Text style={s.summaryValue}>48 t</Text>
              <Text style={s.summaryLabel}>Totalt parkert</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryBlock}>
              <Text style={s.summaryValue}>{total} kr</Text>
              <Text style={s.summaryLabel}>Totalt betalt</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={s.filterRow}>
          {['alle', 'fullfort', 'avbrutt'].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[s.filterBtn, filter === f && s.filterBtnActive]}>
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>
                {f === 'alle' ? 'Alle' : f === 'fullfort' ? 'Fullført' : 'Avbrutt'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <View style={s.list}>
          {filtered.map((item, i) => {
            const st = STATUS[item.status];
            return (
              <View key={item.id}>
                {i > 0 && <View style={s.divider} />}
                <TouchableOpacity style={s.item} activeOpacity={0.75}>
                  <View style={s.itemLeft}>
                    <View style={s.itemIconWrap}>
                      <Icon name="map-pin" size={14} color="#111416" strokeWidth={1.8} />
                    </View>
                    <View style={s.itemInfo}>
                      <Text style={s.itemAddress}>{item.address}</Text>
                      <Text style={s.itemMeta}>{item.area} · {item.date} · {item.duration}</Text>
                    </View>
                  </View>
                  <View style={s.itemRight}>
                    <Text style={s.itemPrice}>{item.price} kr</Text>
                    <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                      <View style={[s.statusDot, { backgroundColor: st.dot }]} />
                      <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
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
  summaryCard: { borderRadius: 22, overflow: 'hidden', padding: 20, marginBottom: 18, shadowColor: '#111416', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 6 },
  blob: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(95,175,211,0.28)', top: -20, right: -20 },
  summaryInner: { flexDirection: 'row', alignItems: 'center' },
  summaryBlock: { flex: 1, alignItems: 'center', gap: 4 },
  summaryValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#fff', letterSpacing: -0.4 },
  summaryLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
  summaryDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { flex: 1, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  filterBtnActive: { backgroundColor: '#111416', borderColor: '#111416' },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#7B8589' },
  filterTextActive: { color: '#fff' },
  list: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: 'rgba(17,20,22,0.05)', marginLeft: 66 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17,20,22,0.06)', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemAddress: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  itemMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#7B8589', marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 5 },
  itemPrice: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.2 },
});
