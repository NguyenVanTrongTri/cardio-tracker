import { Flame, Bike, Waves, Footprints, Compass } from 'lucide-react';
import { EquipmentType } from '../../../types';

export const getEquipmentIcon = (type: EquipmentType, size: number = 16) => {
    switch (type) {
      case 'TREADMILL':
        return <Flame size={size} className="text-emerald-500 fill-emerald-500" />;
      case 'STATIONARY_BIKE':
        return <Bike size={size} className="text-blue-500" />;
      case 'ROWING_MACHINE':
        return <Waves size={size} className="text-cyan-500" />;
      case 'STAIR_CLIMBER':
        return <Footprints size={size} className="text-amber-500" />;
      case 'OUTDOOR_RUN':
        return <Compass size={size} className="text-purple-500" />;
      default:
        return null;
    }
  };
