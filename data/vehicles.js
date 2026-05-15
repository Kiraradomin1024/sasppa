import { vehiclesPart1 } from './vehicles-part1';
import { vehiclesPart2 } from './vehicles-part2';
import { vehiclesPart3 } from './vehicles-part3';

export const allVehicles = [...vehiclesPart1, ...vehiclesPart2, ...vehiclesPart3];

// Sort all vehicles by tier (priority), then alphabetically within same tier
const sortedByPriority = [...allVehicles].sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));

// Tier system: exact counts - Top 50, Top 100, Top 200, All
export const TIER_LIMITS = { 1: 50, 2: 100, 3: 200, 4: Infinity };

export const TIERS = [
  { id: 1, label: "Top 50", desc: "Les 50 véhicules les plus connus", icon: "⭐", count: 50 },
  { id: 2, label: "Top 100", desc: "Les 100 véhicules essentiels", icon: "🔥", count: 100 },
  { id: 3, label: "Top 200", desc: "200 véhicules pour aller plus loin", icon: "💎", count: 200 },
  { id: 4, label: "Tout", desc: "Tous les véhicules disponibles", icon: "🏆", count: allVehicles.length },
];

export function getVehiclesByTier(tierLevel) {
  const limit = TIER_LIMITS[tierLevel] || allVehicles.length;
  return sortedByPriority.slice(0, Math.min(limit, sortedByPriority.length));
}

export function getTierCount(tierLevel) {
  const limit = TIER_LIMITS[tierLevel] || allVehicles.length;
  return Math.min(limit, allVehicles.length);
}

export function getCategories() {
  return [...new Set(allVehicles.map(v => v.category))].sort();
}

export function getManufacturers() {
  return [...new Set(allVehicles.map(v => v.manufacturer))].sort();
}

export function getVehiclesByCategory(category, tierLevel = 4) {
  const pool = getVehiclesByTier(tierLevel);
  return pool.filter(v => v.category === category);
}

export function getRandomChoices(correctVehicle, count = 4, pool = allVehicles) {
  const others = pool.filter(v => v.id !== correctVehicle.id);
  const shuffled = others.sort(() => Math.random() - 0.5);
  const choices = shuffled.slice(0, count - 1);
  choices.push(correctVehicle);
  return choices.sort(() => Math.random() - 0.5);
}

import resolvedImages from './resolved-images.json';

export function getVehicleImageUrl(vehicle) {
  return resolvedImages[vehicle.name] || `https://placehold.co/600x338/0a0a0f/00FF88?text=${encodeURIComponent(vehicle.name)}&font=roboto`;
}

export function getCategoryIcon(category) {
  const icons = {
    'Compactes': '🚗', 'Coupés': '🏎️', 'Berlines': '🚙', 'Sportives': '⚡',
    'Super-sportives': '💨', 'Grosses cylindrées': '💪', 'Sportives classiques': '🎩', 'SUV': '🛻',
    'Tout-terrain': '🏔️', 'Motos': '🏍️', 'Vans': '🚐', 'Commercial': '🚛',
    'Hélicoptères': '🚁', 'Avions': '✈️', 'Bateaux': '🚤', 'Secours': '🚨',
    'Militaire': '🎖️', 'Utilitaires': '🔧',
  };
  return icons[category] || '🚗';
}

export function getCategoryColor(category) {
  const colors = {
    'Compactes': '#00FF88', 'Coupés': '#00D4FF', 'Berlines': '#B026FF',
    'Sportives': '#FF6B35', 'Super-sportives': '#FF1744', 'Grosses cylindrées': '#FFD600',
    'Sportives classiques': '#E040FB', 'SUV': '#00BFA5', 'Tout-terrain': '#8D6E63',
    'Motos': '#FF4081', 'Vans': '#78909C', 'Commercial': '#A1887F',
    'Hélicoptères': '#40C4FF', 'Avions': '#448AFF', 'Bateaux': '#26C6DA',
    'Secours': '#FF1744', 'Militaire': '#4CAF50', 'Utilitaires': '#9E9E9E',
  };
  return colors[category] || '#00FF88';
}
