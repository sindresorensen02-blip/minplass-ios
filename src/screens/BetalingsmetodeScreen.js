import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const CARDS = [
  { id: '1', type: 'Visa',       last4: '4242', expires: '08/26', default: true },
  { id: '2', type: 'Mastercard', last4: '8821', expires: '11/25', default: false },
];

export default function BetalingsmetodeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState(CARDS);
  const [vipps, setVipps] = useState(true);

  const setDefault = (id) => setCards(prev => prev.map(c => ({ ...c, default: c.id === id })));
  const remove = (id) => setCards(prev => prev.filter(c => c.id !== id));

  return (
    <View style={s.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Betalingsmetoder</Text>
          <View style={s.backBtn} />
        </View>

        <Text style={s.sectionLabel}>Lagrede kort</Text>
        <View style={s.cardList}>
          {cards.map((card, i) => (
            <View key={card.id}>
              {i > 0 && <View style={s.divider} />}
              <View style={s.cardRow}>
                <View style={s.cardIcon}>
                  <Text style={s.cardTypeText}>{card.type === 'Visa' ? 'VISA' : 'MC'}</Text>
                </View>
                <View style={s.cardInfo}>
                  <View style={s.cardTopRow}>
                    <Text style={s.cardNumber}>{card.type} •••• {card.last4}</Text>
                    {card.default && (
                      <View style={s.defaultBadge}><Text style={s.defaultText}>Standard</Text></View>
                    )}
                  </View>
                  <Text style={s.cardExpiry}>Utløper {card.expires}</Text>
                </View>
                <View style={s.cardActions}>
                  {!card.default && (
                    <TouchableOpacity onPress={() => setDefault(card.id)} style={s.actionBtn}>
                      <Text style={s.actionBtnText}>Sett standard</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => remove(card.id)} style={s.removeBtn}>
                    <Icon name="x" size={14} color="#DC2626" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>Digital betaling</Text>
        <View style={s.cardList}>
          <View style={s.cardRow}>
            <View style={[s.cardIcon, { backgroundColor: 'rgba(255,91,36,0.12)' }]}>
              <Text style={[s.cardTypeText, { color: '#FF5B24', fontSize: 11 }]}>Vipps</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardNumber}>Vipps</Text>
              <Text style={s.cardExpiry}>{vipps ? 'Tilkoblet · +47 456 78 901' : 'Ikke tilkoblet'}</Text>
            </View>
            <TouchableOpacity onPress={() => setVipps(v => !v)} style={[s.vippsToggle, vipps && s.vippsToggleActive]}>
              <Text style={[s.vippsToggleText, vipps && s.vippsToggleTextActive]}>{vipps ? 'Koble fra' : 'Koble til'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.addBtn} activeOpacity={0.85}>
          <View style={s.addBtnIcon}><Icon name="wallet" size={16} color="#111416" strokeWidth={1.8} /></View>
          <Text style={s.addBtnText}>Legg til nytt kort</Text>
          <Icon name="chevron-right" size={16} color="#7B8589" strokeWidth={2} />
        </TouchableOpacity>

        <View style={s.secureNote}>
          <Icon name="shield" size={13} color="#3FA66B" strokeWidth={1.8} />
          <Text style={s.secureText}>Kortinformasjonen din er kryptert og trygt lagret.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  cardList: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, overflow: 'hidden', marginBottom: 22 },
  divider: { height: 1, backgroundColor: 'rgba(17,20,22,0.05)', marginLeft: 66 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  cardIcon: { width: 44, height: 30, borderRadius: 6, backgroundColor: 'rgba(17,20,22,0.06)', alignItems: 'center', justifyContent: 'center' },
  cardTypeText: { fontFamily: 'Inter_800ExtraBold', fontSize: 10, color: '#111416', letterSpacing: 0.5 },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  cardExpiry: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#7B8589', marginTop: 2 },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(63,166,107,0.15)', borderWidth: 1, borderColor: 'rgba(63,166,107,0.3)' },
  defaultText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#1F6B47' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(17,20,22,0.15)' },
  actionBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#111416' },
  removeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(239,68,68,0.08)', alignItems: 'center', justifyContent: 'center' },
  vippsToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(17,20,22,0.15)' },
  vippsToggleActive: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' },
  vippsToggleText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111416' },
  vippsToggleTextActive: { color: '#DC2626' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, marginBottom: 16 },
  addBtnIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17,20,22,0.06)', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', flex: 1 },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  secureText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', flex: 1, lineHeight: 17 },
});
