import React, { createContext, useContext, useState } from 'react';

const SpotsContext = createContext(null);

const INITIAL_SPOTS = [
  { id: 'innk',    title: 'Innkjørsel · Møhlenpris', sub: 'Aktiv · 8 reservasjoner', price: '45', active: true },
  { id: 'garasje', title: 'Garasje · Sandviken',     sub: 'Pause · gjenoppta',       price: '75', active: false },
];

export function SpotsProvider({ children }) {
  const [spots, setSpots] = useState(INITIAL_SPOTS);

  const addSpot = (spot) => {
    setSpots(prev => [
      ...prev,
      {
        id: String(Date.now()),
        title: `${spot.typeLabel} · ${spot.area}`,
        sub: `Aktiv · 0 reservasjoner`,
        price: spot.price,
        active: true,
      },
    ]);
  };

  const updateSpot = (id, changes) => {
    setSpots(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
  };

  const deleteSpot = (id) => {
    setSpots(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SpotsContext.Provider value={{ spots, addSpot, updateSpot, deleteSpot }}>
      {children}
    </SpotsContext.Provider>
  );
}

export function useSpots() {
  return useContext(SpotsContext);
}
