import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

export default function PersonvernScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [posisjon, setPosisjon] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [markedsforing, setMarkedsforing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <View style={s.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Personvern</Text>
          <View style={s.backBtn} />
        </View>

        <Text style={s.sectionLabel}>Datadeling</Text>
        <View style={s.card}>
          <ToggleRow label="Posisjonsdata" hint="Brukes for å finne plasser i nærheten" value={posisjon} onToggle={() => setPosisjon(v => !v)} />
          <View style={s.divider} />
          <ToggleRow label="Bruksanalyse" hint="Hjelper oss å forbedre appen" value={analytics} onToggle={() => setAnalytics(v => !v)} />
          <View style={s.divider} />
          <ToggleRow label="Markedsføringscookies" hint="Tilpassede annonser og tilbud" value={markedsforing} onToggle={() => setMarkedsforing(v => !v)} />
        </View>

        <Text style={s.sectionLabel}>Dine data</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row}>
            <View style={s.rowIcon}><Icon name="clock" size={14} color="#111416" strokeWidth={1.8} /></View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>Behandlingsgrunnlag</Text>
              <Text style={s.rowHint}>Les vår personvernerklæring</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#C4CACC" strokeWidth={2} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.row}>
            <View style={s.rowIcon}><Icon name="layers" size={14} color="#111416" strokeWidth={1.8} /></View>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>Last ned mine data</Text>
              <Text style={s.rowHint}>Eksporter alt vi har lagret om deg</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#C4CACC" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>Konto</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => setDeleteModal(true)}>
            <View style={[s.rowIcon, { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
              <Icon name="x" size={14} color="#DC2626" strokeWidth={2} />
            </View>
            <View style={s.rowText}>
              <Text style={[s.rowLabel, { color: '#DC2626' }]}>Slett konto</Text>
              <Text style={s.rowHint}>Permanent sletting av alle data</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#C4CACC" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={s.gdprNote}>
          <Icon name="shield" size={13} color="#3FA66B" strokeWidth={1.8} />
          <Text style={s.gdprText}>Dine data behandles i henhold til GDPR og norsk personvernlov.</Text>
        </View>
      </ScrollView>

      <Modal visible={deleteModal} transparent animationType="slide" onRequestClose={() => setDeleteModal(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setDeleteModal(false)}>
          <TouchableOpacity activeOpacity={1} style={s.sheet} onPress={() => {}}>
            <View style={s.sheetHandle} />
            <View style={s.deleteIcon}>
              <Icon name="x" size={22} color="#DC2626" strokeWidth={2} />
            </View>
            <Text style={s.sheetTitle}>Slett konto?</Text>
            <Text style={s.sheetBody}>Dette vil permanent slette alle dine data, reservasjoner og betalingsinformasjon. Handlingen kan ikke angres.</Text>
            <TouchableOpacity style={s.deleteBtn} activeOpacity={0.85}>
              <Text style={s.deleteBtnText}>Slett konto permanent</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModal(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Avbryt</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function ToggleRow({ label, hint, value, onToggle }) {
  return (
    <View style={s.row}>
      <View style={s.rowText}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowHint}>{hint}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#E5E7EB', true: '#111416' }} thumbColor="#fff" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, overflow: 'hidden', marginBottom: 22 },
  divider: { height: 1, backgroundColor: 'rgba(17,20,22,0.05)', marginLeft: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17,20,22,0.06)', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  rowHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#7B8589', marginTop: 1 },
  gdprNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4, marginTop: 4 },
  gdprText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', flex: 1, lineHeight: 17 },
  overlay: { flex: 1, backgroundColor: 'rgba(17,20,22,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#F8FAF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44, alignItems: 'center' },
  sheetHandle: { width: 40, height: 4, borderRadius: 999, backgroundColor: 'rgba(17,20,22,0.18)', marginBottom: 24 },
  deleteIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  sheetTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#111416', letterSpacing: -0.4, marginBottom: 10 },
  sheetBody: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  deleteBtn: { width: '100%', height: 52, borderRadius: 999, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  deleteBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#DC2626' },
  cancelBtn: { width: '100%', height: 52, borderRadius: 999, backgroundColor: '#111416', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff' },
});
