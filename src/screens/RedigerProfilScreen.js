import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

export default function RedigerProfilScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [navn, setNavn] = useState('Julia Metlicka');
  const [epost, setEpost] = useState('julka.metlicka@gmail.com');
  const [telefon, setTelefon] = useState('+47 456 78 901');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => { setSaved(false); navigation.goBack(); }, 900); };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Rediger profil</Text>
          <View style={s.backBtn} />
        </View>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <LinearGradient colors={['#DCEBDF', '#9ECFE3']} style={[StyleSheet.absoluteFillObject, { borderRadius: 52 }]} />
            <Text style={s.avatarText}>JM</Text>
          </View>
          <TouchableOpacity style={s.changePhotoBtn}>
            <Text style={s.changePhotoText}>Endre profilbilde</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <Text style={s.sectionLabel}>Personlig informasjon</Text>
        <View style={s.card}>
          <Field label="Fullt navn" value={navn} onChangeText={setNavn} placeholder="Ditt navn" icon="user" />
          <View style={s.divider} />
          <Field label="E-postadresse" value={epost} onChangeText={setEpost} placeholder="din@epost.no" icon="bell" keyboardType="email-address" />
          <View style={s.divider} />
          <Field label="Telefonnummer" value={telefon} onChangeText={setTelefon} placeholder="+47 000 00 000" icon="map-pin" keyboardType="phone-pad" />
        </View>

        <Text style={s.sectionLabel}>Sikkerhet</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.secRow}>
            <View style={s.secIcon}><Icon name="shield" size={15} color="#111416" strokeWidth={1.8} /></View>
            <View style={s.secText}>
              <Text style={s.secLabel}>Endre passord</Text>
              <Text style={s.secHint}>Sist endret for 3 måneder siden</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#C4CACC" strokeWidth={2} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.secRow}>
            <View style={s.secIcon}><Icon name="shield" size={15} color="#111416" strokeWidth={1.8} /></View>
            <View style={s.secText}>
              <Text style={s.secLabel}>Tofaktorautentisering</Text>
              <Text style={s.secHint}>Ikke aktivert</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#C4CACC" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={save} style={s.saveBtn} activeOpacity={0.88}>
          <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
          <Text style={s.saveBtnText}>{saved ? 'Lagret ✓' : 'Lagre endringer'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, icon, keyboardType }) {
  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldIcon}><Icon name={icon} size={14} color="#7B8589" strokeWidth={1.8} /></View>
      <View style={s.fieldBody}>
        <Text style={s.fieldLabel}>{label}</Text>
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#C4CACC" style={s.fieldInput} keyboardType={keyboardType || 'default'} autoCapitalize="none" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.95)', marginBottom: 12 },
  avatarText: { fontFamily: 'Inter_800ExtraBold', fontSize: 28, color: '#111416', zIndex: 1 },
  changePhotoBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(17,20,22,0.15)', backgroundColor: 'rgba(255,255,255,0.72)' },
  changePhotoText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111416' },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, overflow: 'hidden', marginBottom: 22 },
  divider: { height: 1, backgroundColor: 'rgba(17,20,22,0.05)', marginLeft: 56 },
  fieldWrap: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  fieldIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(17,20,22,0.05)', alignItems: 'center', justifyContent: 'center' },
  fieldBody: { flex: 1 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#7B8589', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  fieldInput: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#111416', letterSpacing: -0.15, padding: 0 },
  secRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  secIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17,20,22,0.06)', alignItems: 'center', justifyContent: 'center' },
  secText: { flex: 1 },
  secLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  secHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#7B8589', marginTop: 1 },
  saveBtn: { height: 56, borderRadius: 999, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 6 },
  saveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff', letterSpacing: -0.16 },
});
