import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

const SPOTS = [
  { id: 'strand',   address: 'Strandgaten 12',  area: 'Møhlenpris', price: 45, available: true,  latitude: 60.3913, longitude: 5.3221 },
  { id: 'sandviks', address: 'Sandviksveien 47', area: 'Sandviken',  price: 38, available: true,  latitude: 60.4012, longitude: 5.3180 },
  { id: 'nygaard',  address: 'Nygårdsgaten 8',   area: 'Sentrum',    price: 55, available: false, latitude: 60.3856, longitude: 5.3317 },
  { id: 'danm',     address: 'Damsgårdsveien 3', area: 'Laksevåg',   price: 30, available: true,  latitude: 60.3951, longitude: 5.2998 },
];

const BERGEN = {
  latitude: 60.3913,
  longitude: 5.3221,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function KartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const focusSpot = (spot) => {
    setSelected(spot);
    mapRef.current?.animateToRegion({
      latitude: spot.latitude - 0.004,
      longitude: spot.longitude,
      latitudeDelta: 0.018,
      longitudeDelta: 0.018,
    }, 400);
  };

  const resetView = () => {
    setSelected(null);
    mapRef.current?.animateToRegion(BERGEN, 400);
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={BERGEN}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
      >
        {SPOTS.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            onPress={() => focusSpot(spot)}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={[styles.pin, selected?.id === spot.id && styles.pinSelected]}>
              {selected?.id === spot.id ? (
                <LinearGradient
                  colors={['#10B981', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                />
              ) : null}
              <Text style={[styles.pinText, selected?.id === spot.id && styles.pinTextSelected]}>
                {spot.price} kr
              </Text>
            </View>
            <View style={[styles.pinTail, { borderTopColor: selected?.id === spot.id ? '#2563EB' : '#111416' }]} />
          </Marker>
        ))}
      </MapView>

      {/* Search bar overlay */}
      <View style={[styles.searchOverlay, { top: insets.top + 12 }]}>
        <View style={styles.searchBar}>
          <View style={styles.searchPin}>
            <Icon name="map-pin" size={13} color="#fff" />
          </View>
          <Text style={styles.searchValue}>Bergen, Norge</Text>
          <Icon name="search" size={16} color="#7B8589" />
        </View>
      </View>

      {/* My location button */}
      <TouchableOpacity
        style={[styles.locBtn, { bottom: insets.bottom + 110 }]}
        onPress={resetView}
        activeOpacity={0.85}
      >
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.92)' }]} />
        <Icon name="navigation" size={18} color="#111416" />
      </TouchableOpacity>

      {/* Bottom spot card */}
      {selected && (
        <View style={[styles.spotCard, { bottom: insets.bottom + 90 }]}>
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.96)' }]} />
          <View style={styles.spotCardInner}>
            <View style={styles.spotCardLeft}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: selected.available ? '#9FD6B4' : '#7B8589' }]} />
                <Text style={styles.statusText}>{selected.available ? 'Ledig nå' : 'Opptatt'}</Text>
              </View>
              <Text style={styles.spotAddress}>{selected.address}</Text>
              <Text style={styles.spotArea}>{selected.area}</Text>
            </View>
            <View style={styles.spotCardRight}>
              <Text style={styles.spotPrice}>{selected.price}</Text>
              <Text style={styles.spotUnit}>kr/t</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.reserveBtn} activeOpacity={0.88} onPress={() => setSelected(null)}>
            <LinearGradient colors={['#10B981', '#14B8A6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 14 }]} />
            <Text style={styles.reserveBtnText}>Reserver</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  searchOverlay: { position: 'absolute', left: 16, right: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  searchPin: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#111416', alignItems: 'center', justifyContent: 'center' },
  searchValue: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111416', letterSpacing: -0.14 },

  locBtn: {
    position: 'absolute', right: 16,
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },

  pin: {
    height: 30, paddingHorizontal: 10, borderRadius: 20,
    backgroundColor: '#111416',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  pinSelected: { height: 34, paddingHorizontal: 12 },
  pinText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  pinTextSelected: { color: '#fff', fontSize: 13 },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderLeftColor: 'transparent',
    borderRightWidth: 5, borderRightColor: 'transparent',
    borderTopWidth: 6, borderTopColor: '#111416',
    alignSelf: 'center',
  },

  spotCard: {
    position: 'absolute', left: 16, right: 16,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: '#111416', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 6,
  },
  spotCardInner: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
  spotCardLeft: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#7B8589', letterSpacing: 0.8, textTransform: 'uppercase' },
  spotAddress: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111416', letterSpacing: -0.32 },
  spotArea: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#7B8589', marginTop: 2 },
  spotCardRight: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  spotPrice: { fontFamily: 'Inter_800ExtraBold', fontSize: 22, color: '#111416', letterSpacing: -0.44 },
  spotUnit: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#7B8589' },

  reserveBtn: {
    height: 44, marginHorizontal: 16, marginBottom: 16,
    borderRadius: 14, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  reserveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', letterSpacing: -0.15 },
});
