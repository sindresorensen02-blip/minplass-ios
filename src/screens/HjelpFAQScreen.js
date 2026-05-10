import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const FAQS = [
  {
    category: 'Reservasjon',
    items: [
      { q: 'Hvordan reserverer jeg en parkeringsplass?', a: 'Finn en ledig plass på kartet eller hjemskjermen, trykk på den og velg varighet. Bekreft med "Reserver nå" og betalingen trekkes automatisk.' },
      { q: 'Kan jeg avbestille en reservasjon?', a: 'Ja, du kan avbestille gratis opptil 15 minutter etter bestilling. Etter det belastes du for første time. Gå til Historikk og trykk på reservasjonen.' },
      { q: 'Hva skjer om jeg kjører for sent?', a: 'Du kan forlenge parkering direkte i appen. Hvis du overskrider uten forlengelse, kan utleier rapportere det og du belastes for ekstra tid.' },
    ],
  },
  {
    category: 'Betaling',
    items: [
      { q: 'Hvilke betalingsmetoder støttes?', a: 'Vi støtter Visa, Mastercard og Vipps. Du kan legge til flere kort under Betalingsmetoder i profilen din.' },
      { q: 'Når belastes jeg?', a: 'Betalingen gjennomføres når parkeringen avsluttes. Bookingavgiften på 18% er inkludert i totalen du ser.' },
      { q: 'Kan jeg få refusjon?', a: 'Refusjon er mulig ved tekniske problemer eller feil fra utleiers side. Kontakt oss innen 24 timer etter parkering.' },
    ],
  },
  {
    category: 'Utleiere',
    items: [
      { q: 'Hvordan kontakter jeg utleieren?', a: 'På reservasjonssiden finner du en "Send melding"-knapp. Utleiere svarer typisk innen få minutter.' },
      { q: 'Hva gjør jeg om plassen er opptatt?', a: 'Ta et bilde og meld fra via appen. Vi kontakter utleier og finner en løsning. Du belastes ikke.' },
    ],
  },
];

export default function HjelpFAQScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const toggle = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(prev => prev === key ? null : key);
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Hjelp & FAQ</Text>
          <View style={s.backBtn} />
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <LinearGradient colors={['#DCEBDF', '#9ECFE3']} style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]} />
            <Icon name="shield" size={26} color="#111416" strokeWidth={1.8} />
          </View>
          <Text style={s.heroTitle}>Hvordan kan vi hjelpe?</Text>
          <Text style={s.heroSub}>Her finner du svar på de vanligste spørsmålene.</Text>
        </View>

        {FAQS.map((cat) => (
          <View key={cat.category} style={s.section}>
            <Text style={s.sectionLabel}>{cat.category}</Text>
            <View style={s.card}>
              {cat.items.map((item, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = open === key;
                return (
                  <View key={key}>
                    {i > 0 && <View style={s.divider} />}
                    <TouchableOpacity style={s.qRow} onPress={() => toggle(key)} activeOpacity={0.75}>
                      <Text style={s.question}>{item.q}</Text>
                      <Icon name={isOpen ? 'x' : 'chevron-right'} size={16} color="#C4CACC" strokeWidth={2} />
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={s.answerWrap}>
                        <Text style={s.answer}>{item.a}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.contactBtn} onPress={() => navigation.navigate('KontaktOss')} activeOpacity={0.85}>
          <Text style={s.contactBtnText}>Fant du ikke svaret? Kontakt oss</Text>
          <Icon name="chevron-right" size={16} color="#7B8589" strokeWidth={2} />
        </TouchableOpacity>
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
  hero: { alignItems: 'center', marginBottom: 28 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#111416', letterSpacing: -0.4, marginBottom: 6 },
  heroSub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589', textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: 'rgba(17,20,22,0.05)' },
  qRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  question: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', flex: 1, lineHeight: 20, letterSpacing: -0.14 },
  answerWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  answer: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#2F3437', lineHeight: 20 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22 },
  contactBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416' },
});
