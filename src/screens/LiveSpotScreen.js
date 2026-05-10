import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const DURATIONS = [
  { label: '30m',      hours: 0.5 },
  { label: '1 t',      hours: 1 },
  { label: '2 t',      hours: 2 },
  { label: 'Tilpass',  hours: null },
];

const AMENITIES = [
  { icon: 'shield',   label: 'Tak over' },
  { icon: 'zap',      label: 'Elbil 11kW' },
  { icon: 'sun',      label: 'Belyst' },
  { icon: 'eye',      label: 'Kamera' },
];

const BOOKING_FEE_RATE = 0.18;

export default function LiveSpotScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const spot = route?.params?.spot ?? {
    address: 'Strandgaten 12',
    area: 'Møhlenpris',
    distance: '0,4 km',
    walk: '5 min',
    price: 45,
    until: 'Ledig til 18:00',
    tags: ['Tak over', 'Elbil 11kW'],
  };

  const [durationIdx, setDurationIdx] = useState(1);
  const [startNow, setStartNow] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [customMins, setCustomMins] = useState(90);

  const isCustom = DURATIONS[durationIdx].hours === null;
  const hours = isCustom ? customMins / 60 : DURATIONS[durationIdx].hours;
  const subtotal = Math.round(spot.price * hours);
  const bookingFee = Math.round(subtotal * BOOKING_FEE_RATE);
  const total = subtotal + bookingFee;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const endMins = nowMins + hours * 60;
  const startStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const endStr = `${String(Math.floor(endMins / 60) % 24).padStart(2, '0')}:${String(Math.round(endMins) % 60).padStart(2, '0')}`;
  const durationStr = customMins < 60 || (!isCustom && hours === 0.5)
    ? `${Math.round(hours * 60)}m`
    : Number.isInteger(hours) ? `${hours} t` : `${Math.floor(hours)} t ${Math.round((hours % 1) * 60)}m`;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <View style={styles.headerMid}>
            <Text style={styles.headerSub}>{spot.area} · {spot.distance}</Text>
            <Text style={styles.headerTitle}>{spot.address}</Text>
          </View>
          <View style={styles.availBadge}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Ledig</Text>
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <LinearGradient colors={['#2F3437', '#111416']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]} />
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <View style={styles.heroInner}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Timepris</Text>
              <View style={styles.heroPriceRow}>
                <Text style={styles.heroPrice}>{spot.price}</Text>
                <Text style={styles.heroPriceUnit}>kr/t</Text>
              </View>
              <View style={styles.heroTagRow}>
                {spot.tags.map((tag) => (
                  <View key={tag} style={styles.heroTag}>
                    <Text style={styles.heroTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.heroRight}>
              <View style={styles.mapPinCircle}>
                <Icon name="map-pin" size={28} color="#fff" />
              </View>
              <Text style={styles.heroWalk}>{spot.walk}</Text>
              <Text style={styles.heroWalkSub}>gange</Text>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <Icon name="clock" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.heroUntil}>{spot.until}</Text>
          </View>
        </View>

        {/* When to start */}
        <Text style={styles.sectionLabel}>Når starter du?</Text>
        <View style={styles.startRow}>
          <TouchableOpacity onPress={() => setStartNow(true)} style={[styles.startBtn, startNow && styles.startBtnActive]} activeOpacity={0.85}>
            <Icon name="zap" size={13} color={startNow ? '#fff' : '#7B8589'} />
            <Text style={[styles.startText, startNow && styles.startTextActive]}>Nå · {startStr}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStartNow(false)} style={[styles.startBtn, !startNow && styles.startBtnActive]} activeOpacity={0.85}>
            <Icon name="clock" size={13} color={!startNow ? '#fff' : '#7B8589'} />
            <Text style={[styles.startText, !startNow && styles.startTextActive]}>Planlegg</Text>
          </TouchableOpacity>
        </View>

        {/* Duration */}
        <Text style={styles.sectionLabel}>Varighet</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d, i) => (
            <TouchableOpacity key={i} onPress={() => setDurationIdx(i)} style={[styles.durationBtn, durationIdx === i && styles.durationBtnActive]} activeOpacity={0.85}>
              <Text style={[styles.durationText, durationIdx === i && styles.durationTextActive]}>{d.label}</Text>
              {d.hours !== null && (
                <Text style={[styles.durationPrice, durationIdx === i && styles.durationPriceActive]}>{Math.round(spot.price * d.hours)} kr</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tilpass slider */}
        {isCustom && (
          <View style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderDuration}>{durationStr}</Text>
              <Text style={styles.sliderPrice}>{subtotal} kr</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={30}
              maximumValue={720}
              step={30}
              value={customMins}
              onValueChange={setCustomMins}
              minimumTrackTintColor="#111416"
              maximumTrackTintColor="rgba(17,20,22,0.12)"
              thumbTintColor="#111416"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>30m</Text>
              <Text style={styles.sliderLabelText}>12 t</Text>
            </View>
          </View>
        )}

        {/* Time summary */}
        <View style={styles.timeCard}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Starter</Text>
            <Text style={styles.timeValue}>{startStr}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Slutter</Text>
            <Text style={styles.timeValue}>{endStr}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Varighet</Text>
            <Text style={styles.timeValue}>{durationStr}</Text>
          </View>
        </View>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>{hours} t × {spot.price} kr/t</Text>
            <Text style={styles.priceRowValue}>{subtotal} kr</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>Bookingavgift (18%)</Text>
            <Text style={styles.priceRowValue}>{bookingFee} kr</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Totalt</Text>
            <Text style={styles.priceTotalValue}>{total} kr</Text>
          </View>
        </View>

        {/* Host */}
        <View style={styles.hostCard}>
          <View style={styles.hostAvatar}>
            <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
            <Text style={styles.hostAvatarText}>SH</Text>
          </View>
          <View style={styles.hostInfo}>
            <Text style={styles.hostLabel}>Utleier</Text>
            <Text style={styles.hostName}>Sondre H.</Text>
            <Text style={styles.hostMeta}>4,9 ★ · svarer på 3 min</Text>
          </View>
          <View style={styles.hostRating}>
            <Text style={styles.hostRatingNum}>4,9</Text>
            <Text style={styles.hostRatingSub}>60 anmeldelser</Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.amenitiesGrid}>
          {AMENITIES.map((a) => (
            <View key={a.label} style={styles.amenityCard}>
              <View style={styles.amenityIcon}>
                <Icon name={a.icon} size={14} color="#111416" />
              </View>
              <Text style={styles.amenityLabel}>{a.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={() => setConfirmed(true)} style={styles.cta} activeOpacity={0.88}>
          <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
          <Text style={styles.ctaText}>Reserver nå</Text>
          <View style={styles.ctaBadge}>
            <Text style={styles.ctaBadgeText}>{total} kr</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation modal */}
      <Modal visible={confirmed} transparent animationType="slide" onRequestClose={() => setConfirmed(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setConfirmed(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.confirmIcon}>
              <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 32 }]} />
              <Icon name="check" size={26} color="#fff" />
            </View>
            <Text style={styles.confirmTitle}>Reservasjon bekreftet!</Text>
            <Text style={styles.confirmSub}>{spot.address} · {startStr}–{endStr}</Text>
            <View style={styles.confirmRow}>
              <View style={styles.confirmBlock}>
                <Text style={styles.confirmBlockLabel}>Betalt</Text>
                <Text style={styles.confirmBlockValue}>{total} kr</Text>
              </View>
              <View style={styles.confirmBlock}>
                <Text style={styles.confirmBlockLabel}>Varighet</Text>
                <Text style={styles.confirmBlockValue}>{durationStr}</Text>
              </View>
              <View style={styles.confirmBlock}>
                <Text style={styles.confirmBlockLabel}>Slutter</Text>
                <Text style={styles.confirmBlockValue}>{endStr}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => { setConfirmed(false); navigation.goBack(); }} style={styles.doneBtn} activeOpacity={0.88}>
              <Text style={styles.doneBtnText}>Tilbake til forsiden</Text>
            </TouchableOpacity>
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
  headerSub: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589', letterSpacing: 0.2 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32, marginTop: 1 },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(159,214,180,0.22)', borderWidth: 1, borderColor: 'rgba(159,214,180,0.4)' },
  availDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3FA66B' },
  availText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#1F6B47' },

  heroCard: { borderRadius: 28, overflow: 'hidden', padding: 20, marginBottom: 22, shadowColor: '#111416', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 36, elevation: 10 },
  heroBlob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(95,175,211,0.28)', top: -40, right: -40 },
  heroBlob2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(159,214,180,0.2)', bottom: -30, left: -30 },
  heroInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  heroLeft: { flex: 1 },
  heroLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' },
  heroPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  heroPrice: { fontFamily: 'Inter_800ExtraBold', fontSize: 42, color: '#fff', letterSpacing: -1 },
  heroPriceUnit: { fontFamily: 'Inter_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  heroTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  heroTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  heroTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  heroRight: { alignItems: 'center', gap: 4 },
  mapPinCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroWalk: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#fff', letterSpacing: -0.36, marginTop: 6 },
  heroWalkSub: { fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  heroUntil: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },

  startRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  startBtn: { flex: 1, height: 44, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  startBtnActive: { backgroundColor: '#111416', borderColor: '#111416' },
  startText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#7B8589' },
  startTextActive: { color: '#fff' },

  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  durationBtn: { flex: 1, paddingVertical: 12, borderRadius: 18, alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  durationBtnActive: { backgroundColor: '#111416', borderColor: '#111416' },
  durationText: { fontFamily: 'Inter_800ExtraBold', fontSize: 15, color: '#111416', letterSpacing: -0.3 },
  durationTextActive: { color: '#fff' },
  durationPrice: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#7B8589' },
  durationPriceActive: { color: 'rgba(255,255,255,0.6)' },

  sliderCard: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 18, padding: 16, marginBottom: 14 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  sliderDuration: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44 },
  sliderPrice: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#7B8589', letterSpacing: -0.32 },
  slider: { width: '100%', height: 36 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  sliderLabelText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589' },

  timeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 18, padding: 16, marginBottom: 22 },
  timeBlock: { flex: 1, alignItems: 'center', gap: 4 },
  timeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#7B8589', letterSpacing: 0.8, textTransform: 'uppercase' },
  timeValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#111416', letterSpacing: -0.36 },
  timeDivider: { width: 1, height: 32, backgroundColor: 'rgba(17,20,22,0.08)' },

  priceCard: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 18, padding: 16, marginBottom: 14, gap: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRowLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589' },
  priceRowValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111416' },
  priceDivider: { height: 1, backgroundColor: 'rgba(17,20,22,0.08)' },
  priceTotalLabel: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#111416' },
  priceTotalValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#111416', letterSpacing: -0.36 },

  hostCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  hostAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  hostAvatarText: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: '#fff', zIndex: 1 },
  hostInfo: { flex: 1 },
  hostLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 1, textTransform: 'uppercase' },
  hostName: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  hostMeta: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#7B8589', marginTop: 2 },
  hostRating: { alignItems: 'flex-end', gap: 2 },
  hostRatingNum: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#111416', letterSpacing: -0.36 },
  hostRatingSub: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#7B8589' },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  amenityCard: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  amenityIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(17,20,22,0.06)', alignItems: 'center', justifyContent: 'center' },
  amenityLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111416' },

  cta: { height: 56, borderRadius: 999, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, gap: 12, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8 },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff', flex: 1, letterSpacing: -0.16 },
  ctaBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' },
  ctaBadgeText: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: '#fff' },

  overlay: { flex: 1, backgroundColor: 'rgba(17,20,22,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#F8FAF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44, alignItems: 'center' },
  sheetHandle: { width: 40, height: 4, borderRadius: 999, backgroundColor: 'rgba(17,20,22,0.18)', marginBottom: 24 },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44, marginBottom: 6 },
  confirmSub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589', marginBottom: 22 },
  confirmRow: { flexDirection: 'row', width: '100%', backgroundColor: 'rgba(17,20,22,0.04)', borderRadius: 18, padding: 16, marginBottom: 22 },
  confirmBlock: { flex: 1, alignItems: 'center', gap: 4 },
  confirmBlockLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#7B8589', letterSpacing: 0.8, textTransform: 'uppercase' },
  confirmBlockValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  doneBtn: { width: '100%', height: 52, borderRadius: 999, backgroundColor: '#111416', alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', letterSpacing: -0.15 },
});
