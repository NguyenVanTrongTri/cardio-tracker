import React from 'react';
import { Flame, Bike, Waves, Footprints, Compass } from 'lucide-react';
import { EquipmentType, WorkoutPhase } from '../../../types';

export const formatDate = (isoStr: string) => {
  try {
    const date = new Date(isoStr);
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');

    const today = new Date();
    const isToday = 
      date.getUTCFullYear() === today.getUTCFullYear() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCDate() === today.getUTCDate();

    if (isToday) {
      return `${hour}:${minute} Hôm nay`;
    }

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const weekday = weekdayNames[date.getUTCDay()];

    return `${hour}:${minute} ${weekday}, ${day}/${month}/${year}`;
  } catch {
    return isoStr;
  }
};



export const renderPhaseDetails = (p: WorkoutPhase, eq?: EquipmentType) => {
  if (eq === 'STATIONARY_BIKE') {
    return `Mức ${p.resistanceLevel || 0} • ${p.cadenceRpm || 70} RPM`;
  }
  if (eq === 'ROWING_MACHINE') {
    return `Damper ${p.resistanceLevel || 0} • ${p.strokeRateSpm || 24} SPM`;
  }
  if (eq === 'STAIR_CLIMBER') {
    return `Mức ${p.resistanceLevel || 0} • ${p.stepsPerMin || 60} bậc/p`;
  }
  return `Dốc ${p.inclineDegree}° • ${p.speedKmh} km/h`;
};
