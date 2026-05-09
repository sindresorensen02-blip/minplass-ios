import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Icon from '../components/Icon';

const RING_SIZE = 168;
const STROKE = 10;
const R = (RING_SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

const REPLY_PRESETS = [
  'Hei! Er det greit at jeg blir litt lenger?',
  'Tusen takk for plassen — alt går fint.',
  'Jeg er litt forsinket, kommer om 10 min.',
];
const EXTEND_OPTIONS = [
  { mins: 30, price: 22 },
  { mins: 60, price: 45 },
  { mins: 120, price: 90 },
];
const ACTIONS = [
  { id: 'nav',   icon: 'map-pin', label: 'Naviger',   hint: 'Åpne i kart' },
  { id: 'photo', icon: 'camera',  label: 'Bevis',     hint: 'Foto av plassen' },
  { id: 'rules', icon: 'shield',  label: 'Husregler', hint: 'Vis betingelser' },
  { id: 'help',  icon: 'layers',  label: 'Få hjelp',  hint: 'MinPlass-support' },
];

export default function LiveSpotScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [totalMins, setTotalMins] = useState(150);
  const [remainMins, setRemainMins] = useState(83);
  const [sheet, setSheet] = useState(null);
  const [presetIdx, setPresetIdx] = useState(1);
  const [extendIdx, setExtendIdx] = useState(1);
  const [messageSent, setMessageSent] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const progress = Math.max(0, Math.min(1, (totalMins - remainMins) / totalMins));
  const remH = Math.floor(remainMins / 60);
  const remM = remainMins % 60;
  const nowMins = 15 * 60 + 37;
  const endTotal = nowMins + remainMins;
  const endsAt = `${String(Math.floor(endTotal / 60) % 24).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
  const dash = C * (1 - progress);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <View style={styles.headerMid}>
            <Text style={styles.headerSub}>Aktiv parkering</Text>
            <Text style={styles.headerTitle}>Strandgaten 12</Text>
          </View>
          <View style={styles.parkertBadge}>
            <View style={styles.parkertDot} />
            <Text style={styles.parkertText}>Parkert</Text>
          </View>
        </View>

        {/* Hero countdown card */}
        <View style={styles.heroCard}>
          <LinearGradient colors={['#2F3437', '#111416']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]} />
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <View style={styles.heroInner}>
            <View style={styles.ringWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R} stroke="rgba(255,255,255,0.14)" strokeWidth={STROKE} fill="none" />
                <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R} stroke="#9FD6B4" strokeWidth={STROKE} fill="none" strokeLinecap="round" strokeDasharray={`${C} ${C}`} strokeDashoffset={dash} />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.ringLabel}>Igjen</Text>
                <View style={styles.ringTime}>
                  <Text style={styles.ringNum}>{remH}</Text>
                  <Text style={styles.ringUnit}>t</Text>
                  <Text style={styles.ringNum}>{String(remM).padStart(2, '0')}</Text>
                  <Text style={styles.ringUnit}>m</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroDetail}>
              <View>
                <Text style={styles.heroDetailLabel}>Slutt</Text>
                <Text style={styles.heroEndTime}>{endsAt}</Text>
              </View>
              <TouchableOpacity onPress={() => setSheet('extend')} style={styles.extendBtn} activeOpacity={0.85}>
                <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
                <Icon name="zap" size={12} color="#fff" />
                <Text style={styles.extendText}>Forleng tid</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Host card */}
        <View style={styles.hostCard}>
          <View style={styles.hostAvatar}>
            <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
            <Text style={styles.hostAvatarText}>SH</Text>
          </View>
          <View style={styles.hostInfo}>
            <Text style={styles.hostLabel}>Utleier</Text>
            <Text style={styles.hostName}>Sondre H.</Text>
            <Text style={styles.hostMeta}>4,9 ★ · svarer typisk på 3 min</Text>
          </View>
          <TouchableOpacity onPress={() => { setMessageSent(false); setSheet('message'); }} style={styles.msgBtn} activeOpacity={0.85}>
            <Icon name="bell" size={13} color="#fff" />
            <Text style={styles.msgBtnText}>Send melding</Text>
          </TouchableOpacity>
        </View>

        {/* Action grid */}
        <View style={styles.actionGrid}>
          {ACTIONS.map((a) => (
            <TouchableOpacity key={a.id} style={styles.actionCard} activeOpacity={0.85}>
              <View style={styles.actionIcon}>
                <Icon name={a.icon} size={15} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionHint}>{a.hint}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* End parking */}
        <TouchableOpacity onPress={() => setSheet('end')} style={styles.endBtn} activeOpacity={0.85}>
          <Icon name="x" size={14} color="#1E40AF" />
          <Text style={styles.endBtnText}>Avslutt parkering</Text>
        </TouchableOpacity>
      </ScrollView>

      {toast && (
        <View style={[styles.toast, { top: insets.top + 16 }]} pointerEvents="none">
          <View style={styles.toastInner}><Text style={styles.toastText}>{toast}</Text></View>
        </View>
      )}

      <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSheet(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            {sheet === 'message' && (
              <View>
                <Text style={styles.sheetSub}>Til utleier · Sondre H.</Text>
                <Text style={styles.sheetTitle}>Send melding</Text>
                <View style={styles.presetList}>
                  {REPLY_PRESETS.map((p, i) => (
                    <TouchableOpacity key={i} onPress={() => setPresetIdx(i)} style={[styles.presetBtn, presetIdx === i && styles.presetBtnActive]}>
                      <Text style={[styles.presetText, presetIdx === i && styles.presetTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {messageSent && (
                  <View style={styles.sentBadge}>
                    <Icon name="shield" size={13} color="#1F6B47" />
                    <Text style={styles.sentText}>Sendt — Sondre er varslet</Text>
                  </View>
                )}
                <View style={styles.sheetActions}>
                  <TouchableOpacity onPress={() => setSheet(null)} style={styles.cancelBtn}><Text style={styles.cancelText}>Avbryt</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setMessageSent(true); setToast('Melding sendt til Sondre H.'); setTimeout(() => setSheet(null), 800); }} style={styles.confirmBtn}>
                    <Text style={styles.confirmText}>Send melding</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {sheet === 'extend' && (
              <View>
                <Text style={styles.sheetSub}>Forleng parkering</Text>
                <Text style={styles.sheetTitle}>Hvor mye lenger?</Text>
                <Text style={styles.sheetNote}>Slutt nå: {endsAt}</Text>
                <View style={styles.extendGrid}>
                  {EXTEND_OPTIONS.map((opt, i) => (
                    <TouchableOpacity key={i} onPress={() => setExtendIdx(i)} style={[styles.extendOption, extendIdx === i && styles.extendOptionActive]}>
                      <Text style={[styles.extendOptTime, extendIdx === i && styles.extendOptTimeActive]}>{opt.mins >= 60 ? `${opt.mins / 60} t` : `${opt.mins} min`}</Text>
                      <Text style={[styles.extendOptPrice, extendIdx === i && styles.extendOptPriceActive]}>+{opt.price} kr</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.sheetActions}>
                  <TouchableOpacity onPress={() => setSheet(null)} style={styles.cancelBtn}><Text style={styles.cancelText}>Avbryt</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { const opt = EXTEND_OPTIONS[extendIdx]; setRemainMins(m => m + opt.mins); setTotalMins(t => t + opt.mins); setToast(`Forlenget med ${opt.mins >= 60 ? `${opt.mins / 60} t` : `${opt.mins} min`}`); setSheet(null); }} style={styles.confirmBtnGradient} activeOpacity={0.88}>
                    <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
                    <Text style={styles.confirmText}>Bekreft +{EXTEND_OPTIONS[extendIdx].price} kr</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {sheet === 'end' && (
              <View>
                <Text style={[styles.sheetSub, { color: '#1E40AF' }]}>Avslutt nå</Text>
                <Text style={styles.sheetTitle}>Avslutte parkering?</Text>
                <Text style={styles.sheetBody}>Du har {remH}t {remM}m igjen. Vi avslutter sesjonen og sender kvittering.</Text>
                <View style={styles.payRow}>
                  <Text style={styles.payLabel}>Å betale</Text>
                  <Text style={styles.payAmount}>112 kr</Text>
                </View>
                <View style={styles.sheetActions}>
                  <TouchableOpacity onPress={() => setSheet(null)} style={styles.cancelBtn}><Text style={styles.cancelText}>Behold</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setToast('Parkering avsluttet · kvittering på vei'); setSheet(null); setTimeout(() => navigation.navigate('Host'), 800); }} style={styles.confirmBtnGradient} activeOpacity={0.88}>
                    <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
                    <Text style={styles.confirmText}>Avslutt og betal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  headerMid: { flex: 1 },
  headerSub: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#111416', letterSpacing: -0.15 },
  parkertBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(159,214,180,0.22)', borderWidth: 1, borderColor: 'rgba(159,214,180,0.4)' },
  parkertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3FA66B' },
  parkertText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#1F6B47' },

  heroCard: { borderRadius: 28, overflow: 'hidden', padding: 22, marginBottom: 12, shadowColor: '#111416', shadowOffset: { width: 0, height: 22 }, shadowOpacity: 0.22, shadowRadius: 44, elevation: 10 },
  heroBlob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(95,175,211,0.32)', top: 0, right: 0 },
  heroBlob2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(159,214,180,0.22)', bottom: 0, left: 0 },
  heroInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringWrap: { width: RING_SIZE, height: RING_SIZE },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' },
  ringTime: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 4 },
  ringNum: { fontFamily: 'Inter_800ExtraBold', fontSize: 34, color: '#fff', letterSpacing: -1 },
  ringUnit: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  heroDetail: { flex: 1, gap: 12 },
  heroDetailLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' },
  heroEndTime: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#fff', letterSpacing: -0.44, marginTop: 2 },
  extendBtn: { height: 36, paddingHorizontal: 14, borderRadius: 999, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  extendText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff' },

  hostCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  hostAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
  hostAvatarText: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: '#fff', zIndex: 1 },
  hostInfo: { flex: 1 },
  hostLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 1, textTransform: 'uppercase' },
  hostName: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#111416', letterSpacing: -0.15 },
  hostMeta: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589', marginTop: 2 },
  msgBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#111416' },
  msgBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff' },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  actionCard: { width: '47.5%', padding: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', gap: 8 },
  actionIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111416', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  actionHint: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#7B8589' },

  endBtn: { height: 52, borderRadius: 999, backgroundColor: 'rgba(37,99,235,0.10)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  endBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1E40AF' },

  toast: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 60 },
  toastInner: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(17,20,22,0.92)' },
  toastText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#fff' },

  overlay: { flex: 1, backgroundColor: 'rgba(17,20,22,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#F8FAF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 999, backgroundColor: 'rgba(17,20,22,0.18)', alignSelf: 'center', marginBottom: 14 },
  sheetSub: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1, textTransform: 'uppercase' },
  sheetTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: '#111416', letterSpacing: -0.4, marginTop: 4 },
  sheetNote: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', marginTop: 4 },
  sheetBody: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2F3437', marginTop: 8, lineHeight: 19 },

  presetList: { marginTop: 14, gap: 8 },
  presetBtn: { padding: 12, borderRadius: 16, backgroundColor: 'rgba(17,20,22,0.04)', borderWidth: 1, borderColor: 'rgba(17,20,22,0.06)' },
  presetBtnActive: { backgroundColor: '#111416', borderColor: '#111416' },
  presetText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111416', lineHeight: 18 },
  presetTextActive: { color: '#fff' },
  sentBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: 'rgba(63,166,107,0.14)', borderWidth: 1, borderColor: 'rgba(63,166,107,0.3)' },
  sentText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1F6B47' },

  extendGrid: { flexDirection: 'row', gap: 8, marginTop: 14 },
  extendOption: { flex: 1, padding: 14, borderRadius: 18, backgroundColor: 'rgba(17,20,22,0.04)', borderWidth: 1, borderColor: 'rgba(17,20,22,0.06)', alignItems: 'center', gap: 4 },
  extendOptionActive: { backgroundColor: '#111416', borderColor: '#111416' },
  extendOptTime: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#111416', letterSpacing: -0.36 },
  extendOptTimeActive: { color: '#fff' },
  extendOptPrice: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589' },
  extendOptPriceActive: { color: 'rgba(255,255,255,0.7)' },

  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, padding: 12, borderRadius: 16, backgroundColor: 'rgba(17,20,22,0.04)', borderWidth: 1, borderColor: 'rgba(17,20,22,0.06)' },
  payLabel: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#7B8589', letterSpacing: 0.6, textTransform: 'uppercase' },
  payAmount: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#111416', letterSpacing: -0.36 },

  sheetActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(17,20,22,0.12)', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#2F3437' },
  confirmBtn: { flex: 2, height: 48, borderRadius: 999, backgroundColor: '#111416', alignItems: 'center', justifyContent: 'center' },
  confirmBtnGradient: { flex: 2, height: 48, borderRadius: 999, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontFamily: 'Inter_800ExtraBold', fontSize: 14, color: '#fff' },
});
