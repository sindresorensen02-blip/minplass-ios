import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';
import Icon from './Icon';

const TABS = [
  { id: 'home',    icon: 'home',    label: 'Hjem' },
  { id: 'search',  icon: 'search',  label: 'Finn' },
  { id: 'map',     icon: 'map-pin', label: 'Kart' },
  { id: 'saved',   icon: 'heart',   label: 'Lagret' },
  { id: 'profile', icon: 'user',    label: 'Profil' },
];

export default function BottomNav({ activeTab = 'home', onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View style={styles.inner}>
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress && onTabPress(tab.id)}
              style={[styles.tab, active && styles.tabActive]}
              activeOpacity={0.75}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={active ? '#fff' : 'rgba(255,255,255,0.55)'}
                strokeWidth={active ? 2 : 1.5}
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
    left: 16,
    right: 16,
    bottom: 0,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    ...shadow(4),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
  },
  tabActive: {
    flex: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  tabLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: -0.1,
  },
});
