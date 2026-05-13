import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadow } from '../theme';
import Icon from './Icon';

const TABS = [
  { id: 'Hjem',   icon: 'home',    label: 'Hjem' },
  { id: 'Kart',   icon: 'map-pin', label: 'Kart' },
  { id: 'Lagret', icon: 'heart',   label: 'Lagret' },
  { id: 'Profil', icon: 'user',    label: 'Profil' },
];

export default function BottomNav({ activeTab = 'home', onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 6 }]}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFFFFF' }]} />
      <View style={styles.inner}>
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress && onTabPress(tab.id)}
              style={[styles.tab, active && styles.tabActive]}
              activeOpacity={0.8}
            >
              {active && (
                <LinearGradient
                  colors={['#10B981', '#14B8A6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]}
                />
              )}
              <Icon
                name={tab.icon}
                size={20}
                color={active ? '#fff' : 'rgba(17,20,22,0.35)'}
                strokeWidth={active ? 2.5 : 1.5}
              />
              {active && (
                <Text style={styles.tabLabel}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(17,20,22,0.07)',
    shadowColor: '#111416',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 6,
  },
  tab: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    overflow: 'hidden',
  },
  tabActive: {
    flex: 2.2,
  },
  tabLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: -0.13,
  },
});
