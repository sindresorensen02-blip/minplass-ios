import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const SECTIONS = [
  {
    title: 'Konto',
    rows: [
      { icon: 'user',   label: 'Rediger profil',       hint: 'Navn, bilde, kontaktinfo', screen: 'RedigerProfil' },
      { icon: 'wallet', label: 'Betalingsmetoder',      hint: 'Kort og Vipps',            screen: 'Betalingsmetoder' },
      { icon: 'clock',  label: 'Reservasjonshistorikk', hint: 'Tidligere og aktive',      screen: 'Reservasjonshistorikk' },
    ],
  },
  {
    title: 'Preferanser',
    rows: [
      { icon: 'bell',   label: 'Varsler',    hint: 'Push og e-post',   screen: 'Varsler' },
      { icon: 'shield', label: 'Personvern', hint: 'Data og samtykke', screen: 'Personvern' },
    ],
  },
  {
    title: 'Support',
    rows: [
      { icon: 'layers', label: 'Hjelp & FAQ',  hint: 'Vanlige spørsmål',  screen: 'HjelpFAQ' },
      { icon: 'bell',   label: 'Kontakt oss',  hint: 'Chat eller e-post', screen: 'KontaktOss' },
      { icon: 'star',   label: 'Vurder appen', hint: 'Del din mening',    screen: 'VurderAppen' },
    ],
  },
];

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut } = useAuth();
  const [stats, setStats] = useState({ reservations: '—', hours: '—', rating: '—' });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from('reservations')
        .select('duration_mins', { count: 'exact' })
        .eq('renter_id', user.id)
        .eq('status', 'completed'),
      supabase
        .from('reviews')
        .select('rating')
        .eq('reviewer_id', user.id),
    ]).then(([resResult, reviewResult]) => {
      const completed = resResult.data ?? [];
      const totalMins = completed.reduce((sum, r) => sum + (r.duration_mins ?? 0), 0);
      const reviews = reviewResult.data ?? [];
      const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—';
      setStats({
        reservations: String(resResult.count ?? completed.length),
        hours: `${Math.round(totalMins / 60)}`,
        rating: avgRating,
      });
    });
  }, [user]);

  const initials = (profile?.full_name ?? user?.email ?? 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const memberYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : '—';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7F7F2', '#F7F7F2']} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color="#111416" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Min profil</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Avatar + name */}
        <View style={styles.heroSection}>
          <View style={styles.avatarOuter}>
            <LinearGradient colors={['#DCEBDF', '#9ECFE3']} style={[StyleSheet.absoluteFillObject, { borderRadius: 52 }]} />
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{profile?.full_name ?? '—'}</Text>
          <Text style={styles.heroEmail}>{user?.email ?? ''}</Text>
          <View style={styles.memberBadge}>
            <View style={styles.memberDot} />
            <Text style={styles.memberText}>Medlem siden {memberYear}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsCard}>
          {[
            { value: stats.reservations, label: 'Reservasjoner' },
            { value: stats.hours !== '0' ? stats.hours : '—', label: 'Timer parkert' },
            { value: stats.rating, label: 'Din vurdering' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.rows.map((row, i) => (
                <React.Fragment key={row.label}>
                  <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => row.screen && navigation.navigate(row.screen)}>
                    <View style={styles.rowIconWrap}>
                      <Icon name={row.icon} size={15} color="#111416" strokeWidth={1.8} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                      <Text style={styles.rowHint}>{row.hint}</Text>
                    </View>
                    <Icon name="chevron-right" size={16} color="#C4CACC" strokeWidth={2} />
                  </TouchableOpacity>
                  {i < section.rows.length - 1 && <View style={styles.rowDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={signOut}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>

        <Text style={styles.version}>MinPlass · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },

  heroSection: { alignItems: 'center', marginBottom: 24 },
  avatarOuter: { width: 104, height: 104, borderRadius: 52, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.95)', marginBottom: 14, shadowColor: '#111416', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  avatarText: { fontFamily: 'Inter_800ExtraBold', fontSize: 34, color: '#111416', zIndex: 1 },
  heroName: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44, marginBottom: 4 },
  heroEmail: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7B8589', marginBottom: 10 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(159,214,180,0.2)', borderWidth: 1, borderColor: 'rgba(159,214,180,0.4)' },
  memberDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3FA66B' },
  memberText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1F6B47' },

  statsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, padding: 20, marginBottom: 28, shadowColor: '#111416', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  statBlock: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#7B8589', textAlign: 'center' },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(17,20,22,0.08)' },

  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#7B8589', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 22, overflow: 'hidden', shadowColor: '#111416', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },

  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  rowIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17,20,22,0.06)', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },
  rowHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#7B8589', marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: 'rgba(17,20,22,0.05)', marginLeft: 66 },

  logoutBtn: { height: 52, borderRadius: 999, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoutText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#DC2626', letterSpacing: -0.15 },

  version: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#C4CACC', textAlign: 'center', marginBottom: 8 },
});
