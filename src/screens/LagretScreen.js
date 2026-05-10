import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const SAVED = [
  { id: 'a', address: 'Strandgaten 12',  area: 'Møhlenpris', price: 45, tags: ['Tak over', 'Elbil'] },
  { id: 'b', address: 'Nygårdsgaten 8',  area: 'Sentrum',    price: 55, tags: ['Innendørs'] },
];

export default function LagretScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lagret</Text>
        <Text style={styles.sub}>Dine favorittsplasser</Text>

        {SAVED.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Icon name="heart" size={28} color="#7B8589" /></View>
            <Text style={styles.emptyLabel}>Ingen lagrede plasser</Text>
            <Text style={styles.emptySub}>Trykk ♥ på en plass for å lagre den her</Text>
          </View>
        ) : (
          SAVED.map((s) => (
            <TouchableOpacity key={s.id} style={styles.card} activeOpacity={0.85}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardAddress}>{s.address}</Text>
                  <Text style={styles.cardMeta}>{s.area} · {s.price} kr/t</Text>
                </View>
                <TouchableOpacity style={styles.heartBtn}>
                  <Icon name="heart" size={16} color="#EF8F7A" />
                </TouchableOpacity>
              </View>
              <View style={styles.tagRow}>
                {s.tags.map((t) => (
                  <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontFamily: 'Inter_800ExtraBold', fontSize: 26, color: '#111416', letterSpacing: -0.52 },
  sub: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#7B8589', marginTop: 2, marginBottom: 20 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  emptyLabel: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#111416', letterSpacing: -0.34 },
  emptySub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589', textAlign: 'center', paddingHorizontal: 20 },
  card: { padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardAddress: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#111416', letterSpacing: -0.15 },
  cardMeta: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', marginTop: 2 },
  heartBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239,143,122,0.12)', alignItems: 'center', justifyContent: 'center' },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(17,20,22,0.06)' },
  tagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#2F3437' },
});
