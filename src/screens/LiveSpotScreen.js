import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, ActivityIndicator, Linking, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { notifyUser } from '../lib/notify';
import { useAuth } from '../context/AuthContext';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const DURATIONS = [
  { label: '30m',     hours: 0.5  },
  { label: '1 t',     hours: 1    },
  { label: '2 t',     hours: 2    },
  { label: 'Tilpass', hours: null },
];

const BOOKING_FEE_RATE = 0.18;

const TAG_ICON_MAP = {
  'Tak over':  'shield',
  'Innendørs': 'layers',
  'Kamera':    'camera',
};
function tagIcon(tag) {
  if (tag.toLowerCase().startsWith('elbil')) return 'zap';
  if (tag.toLowerCase().includes('belyst')) return 'star';
  return TAG_ICON_MAP[tag] ?? 'map-pin';
}

function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

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
  const { user } = useAuth();

  // ── state ──────────────────────────────────────────────────────────────────
  const [durationIdx, setDurationIdx]   = useState(1);
  const [startNow, setStartNow]         = useState(true);
  const [customMins, setCustomMins]     = useState(90);
  const [planDate, setPlanDate]         = useState(0);
  const [planHour, setPlanHour]         = useState(() => (new Date().getHours() + 1) % 24);
  const [planMinute, setPlanMinute]     = useState(0);
  const [reserving, setReserving]       = useState(false);
  const [confirmed, setConfirmed]       = useState(false);
  const [isSaved, setIsSaved]           = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [availability, setAvailability] = useState({ isOccupied: false, nextOccupiedAt: null, loadingAvail: true });
  const [activeReservation, setActiveReservation] = useState(null);
  const [extending, setExtending]                 = useState(false);

  const isRealSpot = !!(spot.id && String(spot.id).length > 10);

  // ── effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !isRealSpot) return;
    supabase
      .from('saved_spots')
      .select('id')
      .eq('user_id', user.id)
      .eq('spot_id', spot.id)
      .maybeSingle()
      .then(({ data }) => setIsSaved(!!data));
  }, [user, spot.id]);

  // Real-time availability
  useEffect(() => {
    if (!isRealSpot) { setAvailability({ isOccupied: false, nextOccupiedAt: null, loadingAvail: false }); return; }

    const loadAvailability = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('reservations')
        .select('starts_at, ends_at')
        .eq('spot_id', spot.id)
        .in('status', ['confirmed', 'pending'])
        .gte('ends_at', now)
        .order('starts_at', { ascending: true });

      const nowMs = Date.now();
      const active = (data ?? []).find(r => new Date(r.starts_at).getTime() <= nowMs && new Date(r.ends_at).getTime() > nowMs);
      const next   = (data ?? []).find(r => new Date(r.starts_at).getTime() > nowMs);

      setAvailability({
        isOccupied:      !!active,
        nextOccupiedAt:  active ? new Date(active.ends_at) : (next ? new Date(next.starts_at) : null),
        loadingAvail:    false,
      });
    };

    loadAvailability();

    const channel = supabase
      .channel(`avail-${spot.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations', filter: `spot_id=eq.${spot.id}` },
        () => loadAvailability())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [spot.id, isRealSpot]);

  // Active reservation for this user/spot (enables extend UI)
  useEffect(() => {
    if (!user || !isRealSpot) return;
    const loadActive = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('reservations')
        .select('id, starts_at, ends_at, total')
        .eq('spot_id', spot.id)
        .eq('renter_id', user.id)
        .eq('status', 'confirmed')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .maybeSingle();
      setActiveReservation(data ?? null);
    };
    loadActive();
    const interval = setInterval(loadActive, 30000);
    return () => clearInterval(interval);
  }, [user, spot.id, isRealSpot]);

  // ── availability derived ───────────────────────────────────────────────────
  const { isOccupied, nextOccupiedAt, loadingAvail } = availability;
  const availUntilText = (() => {
    if (loadingAvail) return '…';
    if (!isRealSpot)  return spot.until || 'Ledig nå';
    const fmt = (d) => d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    if (isOccupied)   return nextOccupiedAt ? `Opptatt til ${fmt(nextOccupiedAt)}` : 'Opptatt';
    if (nextOccupiedAt) return `Ledig til ${fmt(nextOccupiedAt)}`;
    return 'Ledig nå';
  })();

  // ── derived values (all computed before reserve) ───────────────────────────
  const isCustom   = DURATIONS[durationIdx].hours === null;
  const hours      = isCustom ? customMins / 60 : DURATIONS[durationIdx].hours;
  const subtotal   = Math.round(spot.price * hours);
  const bookingFee = Math.round(subtotal * BOOKING_FEE_RATE);
  const total      = subtotal + bookingFee;

  const now    = new Date();
  const startH = startNow ? now.getHours()   : planHour;
  const startM = startNow ? now.getMinutes() : planMinute;
  const startStr     = `${pad(startH)}:${pad(startM)}`;
  const endTotalMins = Math.round(startH * 60 + startM + hours * 60);
  const endStr       = `${pad(Math.floor(endTotalMins / 60) % 24)}:${pad(endTotalMins % 60)}`;

  const durationStr = hours < 1
    ? `${Math.round(hours * 60)}m`
    : Number.isInteger(hours)
      ? `${hours} t`
      : `${Math.floor(hours)} t ${Math.round((hours % 1) * 60)}m`;

  const priceLabel = hours < 1
    ? `${Math.round(hours * 60)} min × ${spot.price} kr/t`
    : `${durationStr} × ${spot.price} kr/t`;

  // ── smart time chips ───────────────────────────────────────────────────────
  const smartChips = useMemo(() => {
    const h    = new Date().getHours();
    const isWE = [0, 6].includes(new Date().getDay());
    const chips = [];

    if (nextOccupiedAt && !isOccupied) {
      const mins = Math.floor((nextOccupiedAt - new Date()) / 60000);
      if (mins >= 30 && mins <= 720) {
        const t = mins < 60 ? `${mins} min` : mins % 60 === 0 ? `${mins / 60} t` : `${Math.floor(mins / 60)} t ${mins % 60} m`;
        chips.push({ label: `Til opptatt · ${t}`, mins, highlight: true });
      }
    }

    if      (h >= 7  && h < 10) { chips.push({ label: 'Morgen · 2 t', mins: 120 });      chips.push({ label: 'Formiddag · 4 t', mins: 240 }); }
    else if (h >= 10 && h < 12) { chips.push({ label: 'Formiddag · 2 t', mins: 120 });   chips.push({ label: 'Halv dag · 4 t', mins: 240 }); }
    else if (h >= 12 && h < 14) { chips.push({ label: 'Lunsj · 1 t', mins: 60 });        chips.push({ label: 'Lunsj · 1,5 t', mins: 90 }); }
    else if (h >= 14 && h < 17) { chips.push({ label: 'Ettermiddag · 2 t', mins: 120 }); chips.push({ label: 'Halv dag · 3 t', mins: 180 }); }
    else if (h >= 17 && h < 20) { chips.push({ label: 'Middag · 2 t', mins: 120 });      chips.push({ label: 'Kveld · 3 t', mins: 180 }); }
    else                         { chips.push({ label: 'Kveld · 2 t', mins: 120 });       chips.push({ label: 'Natt · 4 t', mins: 240 }); }

    if (isWE) chips.push({ label: 'Heldags · 8 t', mins: 480 });

    return chips.slice(0, 4);
  }, [nextOccupiedAt, isOccupied]);

  // ── handlers ───────────────────────────────────────────────────────────────
  const toggleSave = async () => {
    if (!user || !isRealSpot) return;
    if (isSaved) {
      await supabase.from('saved_spots').delete().eq('user_id', user.id).eq('spot_id', spot.id);
      setIsSaved(false);
    } else {
      await supabase.from('saved_spots').insert({ user_id: user.id, spot_id: spot.id });
      setIsSaved(true);
    }
  };

  const openInMaps = () => {
    const q = encodeURIComponent(`${spot.address}, Bergen, Norge`);
    Linking.openURL(`maps://?daddr=${q}`);
  };

  const applyChip = (mins) => {
    const match = DURATIONS.findIndex(d => d.hours !== null && Math.round(d.hours * 60) === mins);
    if (match >= 0) { setDurationIdx(match); }
    else            { setDurationIdx(3); setCustomMins(mins); }
  };

  const extendBooking = async (extraMins) => {
    if (!activeReservation || extending) return;
    setExtending(true);
    const newEndsAt = new Date(new Date(activeReservation.ends_at).getTime() + extraMins * 60 * 1000);

    // Check that the extended window doesn't overlap another reservation
    const { data: available } = await supabase.rpc('check_spot_availability_excluding', {
      p_spot_id:    spot.id,
      p_starts_at:  activeReservation.starts_at,
      p_ends_at:    newEndsAt.toISOString(),
      p_exclude_id: activeReservation.id,
    });
    if (!available) {
      setExtending(false);
      Alert.alert('Kan ikke forlenge', 'En annen reservasjon starter før den forlengede sluttiden.', [{ text: 'OK' }]);
      return;
    }

    const extraCost = Math.round(spot.price * (extraMins / 60) * (1 + BOOKING_FEE_RATE));
    const { error } = await supabase
      .from('reservations')
      .update({ ends_at: newEndsAt.toISOString(), total: (activeReservation.total ?? 0) + extraCost })
      .eq('id', activeReservation.id);
    if (!error) setActiveReservation(prev => ({ ...prev, ends_at: newEndsAt.toISOString() }));
    setExtending(false);
  };

  const reserve = async () => {
    if (!user || !isRealSpot) { setConfirmed(true); return; }
    setReserving(true);

    const startsAt = (() => {
      if (startNow) return new Date();
      const d = new Date();
      d.setDate(d.getDate() + planDate);
      d.setHours(planHour, planMinute, 0, 0);
      return d;
    })();
    const endsAt = new Date(startsAt.getTime() + hours * 60 * 60 * 1000);

    // Pre-flight availability check before hitting the insert
    const { data: available } = await supabase.rpc('check_spot_availability', {
      p_spot_id:   spot.id,
      p_starts_at: startsAt.toISOString(),
      p_ends_at:   endsAt.toISOString(),
    });
    if (!available) {
      setReserving(false);
      Alert.alert(
        'Plassen er opptatt',
        'Noen andre reserverte denne plassen akkurat nå. Velg et annet tidspunkt.',
        [{ text: 'OK' }],
      );
      return;
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        spot_id:        spot.id,
        renter_id:      user.id,
        starts_at:      startsAt.toISOString(),
        ends_at:        endsAt.toISOString(),
        duration_mins:  Math.round(hours * 60),
        price_subtotal: subtotal,
        booking_fee:    bookingFee,
        total,
        status:         'confirmed',
        payment_status: 'pending',
      })
      .select('id')
      .single();

    setReserving(false);
    if (error) {
      const isConflict = error.message?.includes('tilgjengelig') || error.code === 'P0001' || error.code === '23P01';
      Alert.alert(
        isConflict ? 'Plassen er opptatt' : 'Noe gikk galt',
        isConflict
          ? 'Plassen ble reservert av noen andre i samme øyeblikk. Velg et annet tidspunkt.'
          : 'Reservasjonen kunne ikke fullføres. Prøv igjen.',
        [{ text: 'OK' }],
      );
      return;
    }
    if (true) {
      setReservationId(data?.id ?? null);
      setConfirmed(true);

      // Notify the host
      const { data: spotRow } = await supabase
        .from('spots')
        .select('owner_id')
        .eq('id', spot.id)
        .maybeSingle();
      if (spotRow?.owner_id) {
        notifyUser(spotRow.owner_id, {
          title: 'Ny reservasjon!',
          body: `${spot.address} · ${startStr}–${endStr} (${durationStr})`,
          data: { reservationId: data?.id, spotId: spot.id },
        });
      }

      // Send booking confirmation email (fire-and-forget)
      if (user?.email) {
        supabase.functions.invoke('send-booking-email', {
          body: {
            renterEmail: user.email,
            renterName:  user.user_metadata?.full_name ?? '',
            address:     spot.address,
            startStr,
            endStr,
            durationStr,
            total,
            refLabel:    data?.id ? `#${String(data.id).slice(0, 8).toUpperCase()}` : null,
          },
        });
      }
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  const amenities = (spot.tags ?? []).length > 0 ? spot.tags : [];
  const refLabel  = reservationId ? `#${String(reservationId).slice(0, 8).toUpperCase()}` : null;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F7F2', '#F7F7F2']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 76 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <View style={styles.headerMid}>
            <Text style={styles.headerSub}>{[spot.area, spot.distance].filter(Boolean).join(' · ')}</Text>
            <Text style={styles.headerTitle}>{spot.address}</Text>
          </View>
          <TouchableOpacity onPress={toggleSave} style={[styles.availBadge, isOccupied && !isSaved && styles.availBadgeOccupied]}>
            <Icon name="heart" size={14} color={isSaved ? '#EF8F7A' : isOccupied ? '#B45309' : '#1F6B47'} />
            <Text style={[styles.availText, isSaved && { color: '#EF8F7A' }, isOccupied && !isSaved && { color: '#B45309' }]}>
              {isSaved ? 'Lagret' : isOccupied ? 'Opptatt' : 'Ledig'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
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
                {(spot.tags ?? []).map((tag) => (
                  <View key={tag} style={styles.heroTag}>
                    <Text style={styles.heroTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.heroRight}>
              <View style={styles.mapPinCircle}>
                <Icon name="map-pin" size={28} color="#10B981" />
              </View>
              {spot.walk ? <Text style={styles.heroWalk}>{spot.walk}</Text> : null}
              {spot.walk ? <Text style={styles.heroWalkSub}>gange</Text> : null}
            </View>
          </View>
          <View style={styles.heroFooter}>
            <Icon name="clock" size={12} color={isOccupied ? '#D97706' : '#BCC5CB'} />
            <Text style={[styles.heroUntil, isOccupied && { color: '#D97706' }]}>{availUntilText}</Text>
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

        {/* Planlegg time picker */}
        {!startNow && (
          <View style={styles.timePicker}>
            {/* Date chips */}
            <View style={styles.dateRow}>
              {['I dag', 'I morgen'].map((label, i) => (
                <TouchableOpacity key={i} onPress={() => setPlanDate(i)} style={[styles.dateChip, planDate === i && styles.dateChipActive]}>
                  <Text style={[styles.dateChipText, planDate === i && styles.dateChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hour : Minute steppers */}
            <View style={styles.timeStepRow}>
              {/* Hour */}
              <View style={styles.timeStepper}>
                <TouchableOpacity onPress={() => setPlanHour(h => (h + 1) % 24)} style={styles.stepBtn} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
                  <Icon name="chevron-up" size={22} color="#111416" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{pad(planHour)}</Text>
                <TouchableOpacity onPress={() => setPlanHour(h => (h - 1 + 24) % 24)} style={styles.stepBtn} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
                  <Icon name="chevron-down" size={22} color="#111416" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <Text style={styles.timePickerColon}>:</Text>

              {/* Minute */}
              <View style={styles.timeStepper}>
                <TouchableOpacity onPress={() => setPlanMinute(m => (m + 15) % 60)} style={styles.stepBtn} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
                  <Icon name="chevron-up" size={22} color="#111416" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{pad(planMinute)}</Text>
                <TouchableOpacity onPress={() => setPlanMinute(m => (m - 15 + 60) % 60)} style={styles.stepBtn} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
                  <Icon name="chevron-down" size={22} color="#111416" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Duration */}
        <Text style={styles.sectionLabel}>Varighet</Text>

        {smartChips.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartChipScroll} contentContainerStyle={styles.smartChipContent}>
            {smartChips.map((chip, i) => (
              <TouchableOpacity key={i} onPress={() => applyChip(chip.mins)} style={[styles.smartChip, chip.highlight && styles.smartChipHighlight]} activeOpacity={0.8}>
                {chip.highlight && <View style={styles.smartChipDot} />}
                <Text style={[styles.smartChipText, chip.highlight && styles.smartChipTextHighlight]}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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

        {/* Custom slider */}
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
              minimumTrackTintColor="#10B981"
              maximumTrackTintColor="rgba(16,185,129,0.15)"
              thumbTintColor="#10B981"
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
            <Text style={styles.priceRowLabel}>{priceLabel}</Text>
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

        {/* Amenities from spot tags */}
        {amenities.length > 0 && (
          <View style={styles.amenitiesGrid}>
            {amenities.map((tag) => (
              <View key={tag} style={styles.amenityCard}>
                <View style={styles.amenityIcon}>
                  <Icon name={tagIcon(tag)} size={14} color="#111416" />
                </View>
                <Text style={styles.amenityLabel}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Extend booking banner — shown when user has a running booking */}
        {activeReservation && (
          <View style={styles.extendBanner}>
            <LinearGradient colors={['rgba(16,185,129,0.12)', 'rgba(20,184,166,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
            <View style={styles.extendBannerTop}>
              <View style={styles.extendLiveDot} />
              <Text style={styles.extendTitle}>Booking aktiv</Text>
              <Text style={styles.extendUntil}>
                Slutter {new Date(activeReservation.ends_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={styles.extendSub}>Trenger du mer tid?</Text>
            <View style={styles.extendBtns}>
              <TouchableOpacity onPress={() => extendBooking(30)} style={styles.extendBtn} activeOpacity={0.85} disabled={extending}>
                {extending
                  ? <ActivityIndicator size="small" color="#10B981" />
                  : <Text style={styles.extendBtnText}>+ 30 min</Text>
                }
                <Text style={styles.extendBtnPrice}>{Math.round(spot.price * 0.5 * (1 + BOOKING_FEE_RATE))} kr</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => extendBooking(60)} style={styles.extendBtn} activeOpacity={0.85} disabled={extending}>
                {extending
                  ? <ActivityIndicator size="small" color="#10B981" />
                  : <Text style={styles.extendBtnText}>+ 1 time</Text>
                }
                <Text style={styles.extendBtnPrice}>{Math.round(spot.price * 1 * (1 + BOOKING_FEE_RATE))} kr</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reserve CTA */}
        <TouchableOpacity onPress={reserve} style={[styles.cta, isOccupied && { opacity: 0.45 }]} activeOpacity={0.88} disabled={reserving || isOccupied}>
          <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
          {reserving
            ? <ActivityIndicator color="#fff" style={{ flex: 1 }} />
            : <Text style={styles.ctaText}>Reserver nå</Text>
          }
          {!reserving && (
            <View style={styles.ctaBadge}>
              <Text style={styles.ctaBadgeText}>{total} kr</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation modal */}
      <Modal visible={confirmed} transparent animationType="slide" onRequestClose={() => setConfirmed(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setConfirmed(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.confirmIcon}>
              <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 32 }]} />
              <Icon name="check" size={26} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={styles.confirmTitle}>Reservasjon bekreftet!</Text>
            <Text style={styles.confirmSub}>{spot.address} · {startStr}–{endStr}</Text>
            {refLabel && (
              <View style={styles.refBadge}>
                <Text style={styles.refText}>Bestillingsnr. {refLabel}</Text>
              </View>
            )}
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
            <TouchableOpacity onPress={openInMaps} style={styles.mapsBtn} activeOpacity={0.88}>
              <Icon name="map-pin" size={16} color="#10B981" strokeWidth={2} />
              <Text style={styles.mapsBtnText}>Åpne i Kart</Text>
            </TouchableOpacity>
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
  availBadgeOccupied: { backgroundColor: 'rgba(217,119,6,0.12)', borderColor: 'rgba(217,119,6,0.3)' },
  availText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#1F6B47' },

  heroCard: { borderRadius: 28, overflow: 'hidden', padding: 20, marginBottom: 22, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)', shadowColor: '#111416', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 24, elevation: 4 },
  heroBlob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(16,185,129,0.13)', top: -40, right: -40 },
  heroBlob2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(37,99,235,0.07)', bottom: -30, left: -30 },
  heroInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  heroLeft: { flex: 1 },
  heroLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 1, textTransform: 'uppercase' },
  heroPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  heroPrice: { fontFamily: 'Inter_800ExtraBold', fontSize: 42, color: '#10B981', letterSpacing: -1 },
  heroPriceUnit: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#7B8589' },
  heroTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  heroTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(16,185,129,0.1)' },
  heroTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#0D7A55' },
  heroRight: { alignItems: 'center', gap: 4 },
  mapPinCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroWalk: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#111416', letterSpacing: -0.36, marginTop: 6 },
  heroWalkSub: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#7B8589' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(17,20,22,0.08)' },
  heroUntil: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#7B8589' },

  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },

  startRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  startBtn: { flex: 1, height: 44, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  startBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  startText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#7B8589' },
  startTextActive: { color: '#fff' },

  timePicker: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, padding: 18, marginBottom: 22, gap: 16 },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateChip: { flex: 1, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,20,22,0.06)', borderWidth: 1, borderColor: 'transparent' },
  dateChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  dateChipText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#7B8589' },
  dateChipTextActive: { color: '#fff' },
  timeStepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  timeStepper: { alignItems: 'center', gap: 6 },
  stepBtn: { width: 44, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 40, color: '#111416', letterSpacing: -1, lineHeight: 46 },
  timePickerColon: { fontFamily: 'Inter_800ExtraBold', fontSize: 40, color: '#111416', letterSpacing: -1, marginBottom: 4 },

  smartChipScroll: { marginBottom: 10 },
  smartChipContent: { gap: 8, paddingRight: 4 },
  smartChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  smartChipHighlight: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
  smartChipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  smartChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111416' },
  smartChipTextHighlight: { color: '#0D7A55' },

  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  durationBtn: { flex: 1, paddingVertical: 12, borderRadius: 18, alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  durationBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
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

  extendBanner: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', padding: 16, marginBottom: 14 },
  extendBannerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  extendLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  extendTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#111416', flex: 1 },
  extendUntil: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#7B8589' },
  extendSub: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', marginBottom: 12, marginLeft: 16 },
  extendBtns: { flexDirection: 'row', gap: 10 },
  extendBtn: { flex: 1, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  extendBtnText: { fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: '#10B981', letterSpacing: -0.34 },
  extendBtnPrice: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#0D7A55' },

  cta: { height: 56, borderRadius: 999, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, gap: 12, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8 },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff', flex: 1, letterSpacing: -0.16 },
  ctaBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' },
  ctaBadgeText: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: '#fff' },

  overlay: { flex: 1, backgroundColor: 'rgba(17,20,22,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#F8FAF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 40, height: 4, borderRadius: 999, backgroundColor: 'rgba(17,20,22,0.18)', marginBottom: 24 },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44, marginBottom: 6 },
  confirmSub: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589', marginBottom: 12 },
  refBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', marginBottom: 18 },
  refText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#0D7A55', letterSpacing: 0.4 },
  confirmRow: { flexDirection: 'row', width: '100%', backgroundColor: 'rgba(17,20,22,0.04)', borderRadius: 18, padding: 16, marginBottom: 22 },
  confirmBlock: { flex: 1, alignItems: 'center', gap: 4 },
  confirmBlockLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#7B8589', letterSpacing: 0.8, textTransform: 'uppercase' },
  confirmBlockValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  mapsBtn: { width: '100%', height: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', marginBottom: 10 },
  mapsBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#10B981', letterSpacing: -0.15 },
  doneBtn: { width: '100%', height: 52, borderRadius: 999, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', letterSpacing: -0.15 },
});
