import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, Pressable, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { colors, radii, spacing, shadow, typography } from '../theme';
import { IconButton, GlassCard } from '../components/Primitives';
import Icon from '../components/Icon';

const TOTAL_MINUTES = 150;

function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}t ${m}m` : `${m}m`;
}

function fmtEndTime(remainingMins) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + remainingMins);
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Circular progress ring
function ProgressRing({ progress, size = 180 }) {
  const strokeWidth = 8;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progress);

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="#5FAFD3"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const EXTEND_OPTIONS = [
  { label: '+30 min', mins: 30, price: 23 },
  { label: '+60 min', mins: 60, price: 45 },
  { label: '+120 min', mins: 120, price: 85 },
];

const PRESETS = [
  'Er på vei! 🚗',
  'Takk, alt bra her!',
  'Litt forsinket, ca 5 min',
];

export default function LiveSpotScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const spot = route?.params?.spot || { address: 'Strandgaten 12', area: 'Møhlenpris', price: 45 };

  const [remaining, setRemaining] = useState(83);
  const [sheet, setSheet] = useState(null); // 'extend' | 'message' | 'end'
  const [selectedExtend, setSelectedExtend] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [messageSent, setMessageSent] = useState(false);

  // Tick down timer
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((t) => (t > 0 ? t - 1 : 0));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const progress = remaining / TOTAL_MINUTES;

  function sendMessage() {
    setMessageSent(true);
    setTimeout(() => {
      setSheet(null);
      setMessageSent(false);
    }, 1200);
  }

  function extendSession() {
    const extra = EXTEND_OPTIONS[selectedExtend].mins;
    setRemaining((t) => t + extra);
    setSheet(null);
  }

  function endSession() {
    setSheet(null);
    navigation.goBack();
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F8F6', '#EDEFEF', '#DDEAF0']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={colors.fg1} />
          </IconButton>
          <View style={styles.headerMid}>
            <Text style={styles.headerTitle}>Aktiv parkering</Text>
            <Text style={styles.headerSub}>{spot.address}</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </View>

        {/* Countdown card */}
        <LinearGradient
          colors={['#2F3437', '#111416']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.countdown}
        >
          {/* Progress ring */}
          <View style={styles.ringWrap}>
            <ProgressRing progress={progress} size={180} />
            <View style={styles.ringCenter}>
              <Text style={styles.timerText}>{fmtTime(remaining)}</Text>
              <Text style={styles.timerSub}>gjenstår</Text>
            </View>
          </View>

          <Text style={styles.endTime}>Slutter {fmtEndTime(remaining)}</Text>

          <TouchableOpacity style={styles.extendBtn} onPress={() => setSheet('extend')}>
            <Icon name="zap" size={14} color="#fff" />
            <Text style={styles.extendBtnText}>Forleng tid</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Host card */}
        <GlassCard style={styles.hostCard}>
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>SH</Text>
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>Sindre H. · ★ 4.9</Text>
              <Text style={styles.hostMeta}>Svarer vanligvis innen 5 min</Text>
            </View>
            <TouchableOpacity style={styles.msgBtn} onPress={() => setSheet('message')}>
              <Text style={styles.msgBtnText}>Send melding</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Actions grid */}
        <View style={styles.actionsGrid}>
          {[
            { icon: 'map-pin', label: 'Naviger' },
            { icon: 'camera',  label: 'Bevis' },
            { icon: 'shield',  label: 'Husregler' },
            { icon: 'bell',    label: 'Få hjelp' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} activeOpacity={0.8}>
              <BlurView intensity={35} tint="light" style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]} />
              <View style={styles.actionBtnInner}>
                <Icon name={a.icon} size={22} color={colors.fg1} />
                <Text style={styles.actionLabel}>{a.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* End session */}
        <TouchableOpacity style={styles.endBtn} onPress={() => setSheet('end')}>
          <Text style={styles.endBtnText}>Avslutt parkering</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Bottom sheets ─── */}
      <BottomSheet visible={sheet === 'extend'} onClose={() => setSheet(null)} title="Forleng parkeringen">
        {EXTEND_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.extendOption, selectedExtend === i && styles.extendOptionActive]}
            onPress={() => setSelectedExtend(i)}
          >
            <Text style={[styles.extendOptionLabel, selectedExtend === i && styles.textWhite]}>{opt.label}</Text>
            <Text style={[styles.extendOptionPrice, selectedExtend === i && styles.textWhiteMuted]}>{opt.price} kr</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.confirmBtn} onPress={extendSession}>
          <Text style={styles.confirmBtnText}>Bekreft forlengelse</Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet visible={sheet === 'message'} onClose={() => setSheet(null)} title="Send melding til utleier">
        {PRESETS.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.presetBtn, selectedPreset === i && styles.presetBtnActive]}
            onPress={() => setSelectedPreset(i)}
          >
            <Text style={[styles.presetText, selectedPreset === i && styles.textWhite]}>{p}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.confirmBtn} onPress={sendMessage}>
          <Text style={styles.confirmBtnText}>{messageSent ? '✓ Sendt!' : 'Send melding'}</Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet visible={sheet === 'end'} onClose={() => setSheet(null)} title="Avslutt parkeringen?">
        <View style={styles.endSummary}>
          <Text style={styles.endSummaryLabel}>Tid igjen</Text>
          <Text style={styles.endSummaryValue}>{fmtTime(remaining)}</Text>
        </View>
        <View style={styles.endSummary}>
          <Text style={styles.endSummaryLabel}>Total kostnad</Text>
          <Text style={styles.endSummaryValue}>{Math.ceil((TOTAL_MINUTES - remaining) / 60) * (spot.price || 45)} kr</Text>
        </View>
        <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnDanger]} onPress={endSession}>
          <Text style={styles.confirmBtnText}>Ja, avslutt</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

function BottomSheet({ visible, onClose, title, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <BlurView intensity={60} tint="light" style={[StyleSheet.absoluteFillObject, { borderRadius: radii.hero }]} />
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <View style={styles.sheetContent}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.s5 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.s4,
  },
  headerMid: { flex: 1 },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.fg1,
    letterSpacing: -0.2,
  },
  headerSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.fg3,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(159,214,180,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(159,214,180,0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9FD6B4',
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#2D7A50',
    textTransform: 'uppercase',
  },

  // Countdown card
  countdown: {
    borderRadius: radii.card,
    padding: spacing.s6,
    alignItems: 'center',
    marginBottom: spacing.s3,
    overflow: 'hidden',
    ...shadow(3),
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.s4 },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 38,
    color: '#fff',
    letterSpacing: -1,
  },
  timerSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  endTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: spacing.s4,
  },
  extendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  extendBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },

  // Host card
  hostCard: { marginBottom: spacing.s3 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.bgMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.fg1 },
  hostInfo: { flex: 1 },
  hostName: { fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.fg1, letterSpacing: -0.14 },
  hostMeta: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.fg3, marginTop: 2 },
  msgBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.bgMint,
  },
  msgBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.fg1 },

  // Actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.s3,
  },
  actionBtn: {
    width: '47%',
    height: 76,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    ...shadow(1),
  },
  actionBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.fg1,
    letterSpacing: -0.1,
  },

  // End button
  endBtn: {
    height: 52,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.accentBlue,
    letterSpacing: -0.15,
  },

  // Bottom sheet
  overlay: { flex: 1, backgroundColor: 'rgba(17,20,22,0.35)' },
  sheet: {
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    overflow: 'hidden',
    paddingHorizontal: spacing.s5,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(23,33,31,0.18)',
    alignSelf: 'center',
    marginBottom: spacing.s4,
  },
  sheetTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: colors.fg1,
    letterSpacing: -0.36,
    marginBottom: spacing.s4,
  },
  sheetContent: { gap: spacing.s2 },

  // Extend options
  extendOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.s4,
    borderRadius: radii.md,
    backgroundColor: 'rgba(23,33,31,0.05)',
  },
  extendOptionActive: { backgroundColor: colors.charcoal },
  extendOptionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.fg1,
    letterSpacing: -0.2,
  },
  extendOptionPrice: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.fg3,
  },

  // Preset messages
  presetBtn: {
    padding: spacing.s4,
    borderRadius: radii.md,
    backgroundColor: 'rgba(23,33,31,0.05)',
  },
  presetBtnActive: { backgroundColor: colors.charcoal },
  presetText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.fg1,
  },

  // Confirm button
  confirmBtn: {
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.s2,
    ...shadow(2),
  },
  confirmBtnDanger: { backgroundColor: '#C0392B' },
  confirmBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: -0.15,
  },

  // End session summary
  endSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.s4,
    borderRadius: radii.md,
    backgroundColor: 'rgba(23,33,31,0.05)',
  },
  endSummaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.fg3,
  },
  endSummaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.fg1,
  },

  textWhite: { color: '#fff' },
  textWhiteMuted: { color: 'rgba(255,255,255,0.65)' },
});
