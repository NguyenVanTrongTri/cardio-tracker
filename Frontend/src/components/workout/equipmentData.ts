import { EquipmentType, WorkoutPhase } from '../../types';

export interface EquipmentDef {
  id: EquipmentType;
  name: string;
  shortName: string;
  label?: string;   
  enabled?: boolean;
  tag: string;
  badgeColor: string;
  bgLight: string;
  description: string;
  
  // Parameter 1 (e.g. Incline, Resistance, Damper, Level)
  param1: {
    key: 'inclineDegree' | 'resistanceLevel';
    label: string;
    unit: string;
    step: string;
    min: number;
    max: number;
    description: string;
  };

  // Parameter 2 (e.g. Speed, Cadence RPM, Stroke Rate SPM, Steps/min)
  param2: {
    key: 'speedKmh' | 'cadenceRpm' | 'strokeRateSpm' | 'stepsPerMin';
    label: string;
    unit: string;
    step: string;
    min: number;
    max: number;
    description: string;
  };

  // Optional Parameter 3 (e.g. Speed for bike/rower/stepper)
  param3?: {
    key: 'speedKmh';
    label: string;
    unit: string;
    step: string;
    min: number;
    max: number;
  };

  coreFocus: {
    label: string;
    description: string;
  };

  zone2Criteria: string;
  defaultPhases: {
    phase1: WorkoutPhase;
    phase2: WorkoutPhase;
    phase3: WorkoutPhase;
  };
}

export const EQUIPMENT_LIST: EquipmentDef[] = [
  {
    id: 'TREADMILL',
    name: 'Máy Chạy Bộ (Treadmill)',
    shortName: 'Máy Chạy Bộ',
    tag: 'Tối ưu Zone 2 bụng',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bgLight: 'from-emerald-500/10 to-teal-500/5',
    description: 'Đi bộ dốc cao 8°-12° siết chặt cơ bụng, đốt mỡ tối đa mà không gây áp lực lên khớp gối.',
    param1: {
      key: 'inclineDegree',
      label: 'Độ dốc',
      unit: '°',
      step: '0.5',
      min: 0,
      max: 15,
      description: 'Mục tiêu Phase 2 ≥ 8.0°',
    },
    param2: {
      key: 'speedKmh',
      label: 'Tốc độ',
      unit: 'km/h',
      step: '0.1',
      min: 1,
      max: 16,
      description: 'Đi bộ nhanh 4.8 - 5.5 km/h',
    },
    coreFocus: {
      label: 'Siết Cơ Bụng (Core Engagement)',
      description: 'Kích hoạt cơ bụng sâu, bảo vệ cột sống và săn chắc vòng eo',
    },
    zone2Criteria: 'Dốc ≥ 8.0° • Tốc độ 4.8-5.5 km/h • Thời gian 40-48 phút',
    defaultPhases: {
      phase1: {
        phaseNumber: 1,
        name: 'Warm-up',
        durationMinutes: 7,
        speedKmh: 4.5,
        inclineDegree: 3.0,
      },
      phase2: {
        phaseNumber: 2,
        name: 'Fat Burn',
        durationMinutes: 30,
        speedKmh: 5.2,
        inclineDegree: 8.5,
        isCoreEngaged: true,
      },
      phase3: {
        phaseNumber: 3,
        name: 'Cool-down',
        durationMinutes: 5,
        speedKmh: 4.0,
        inclineDegree: 2.0,
      },
    },
  },
  {
    id: 'STATIONARY_BIKE',
    name: 'Xe Đạp Thể Dục (Stationary Bike)',
    shortName: 'Xe Đạp Thể Dục',
    tag: 'Bảo vệ khớp tối đa',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    bgLight: 'from-blue-500/10 to-indigo-500/5',
    description: 'Đạp xe trong nhà kết hợp mức kháng lực từ tính và nhịp guồng chân ổn định để giữ nhịp tim đốt mỡ.',
    param1: {
      key: 'resistanceLevel',
      label: 'Kháng lực',
      unit: 'Level',
      step: '1',
      min: 1,
      max: 20,
      description: 'Mục tiêu Phase 2 Level 6 - 10',
    },
    param2: {
      key: 'cadenceRpm',
      label: 'Vòng đạp',
      unit: 'RPM',
      step: '1',
      min: 30,
      max: 130,
      description: 'Tối ưu Zone 2: 70 - 85 vòng/phút',
    },
    param3: {
      key: 'speedKmh',
      label: 'Tốc độ',
      unit: 'km/h',
      step: '0.5',
      min: 5,
      max: 45,
    },
    coreFocus: {
      label: 'Thẳng Lưng & Khóa Cơ Trọng Tâm',
      description: 'Không dồn hết trọng lượng lên tay lái, siết bụng dồn lực vào đùi sau và cơ mông',
    },
    zone2Criteria: 'Kháng lực Level ≥ 6 • RPM 70-85 • Giữ nhịp tim Zone 2',
    defaultPhases: {
      phase1: {
        phaseNumber: 1,
        name: 'Warm-up',
        durationMinutes: 7,
        speedKmh: 16.0,
        inclineDegree: 0,
        resistanceLevel: 4,
        cadenceRpm: 65,
      },
      phase2: {
        phaseNumber: 2,
        name: 'Fat Burn',
        durationMinutes: 30,
        speedKmh: 22.0,
        inclineDegree: 0,
        resistanceLevel: 8,
        cadenceRpm: 78,
        isCoreEngaged: true,
      },
      phase3: {
        phaseNumber: 3,
        name: 'Cool-down',
        durationMinutes: 5,
        speedKmh: 14.0,
        inclineDegree: 0,
        resistanceLevel: 3,
        cadenceRpm: 55,
      },
    },
  },
  {
    id: 'ROWING_MACHINE',
    name: 'Máy Chèo Thuyền (Rowing Machine)',
    shortName: 'Máy Chèo Thuyền',
    tag: 'Kích hoạt 85% nhóm cơ',
    badgeColor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    bgLight: 'from-cyan-500/10 to-sky-500/5',
    description: 'Chèo thuyền trong nhà huy động cơ chân, lưng xô, tay và cơ bụng; đốt năng lượng toàn thân vượt trội.',
    param1: {
      key: 'resistanceLevel',
      label: 'Kháng lực',
      unit: 'Damper',
      step: '1',
      min: 1,
      max: 10,
      description: 'Bánh đà Damper 4 - 6 chuẩn Zone 2',
    },
    param2: {
      key: 'strokeRateSpm',
      label: 'Nhịp chèo',
      unit: 'SPM',
      step: '1',
      min: 15,
      max: 45,
      description: 'Nhịp chèo đều 22 - 26 nhịp/phút',
    },
    param3: {
      key: 'speedKmh',
      label: 'Tốc độ',
      unit: 'km/h',
      step: '0.2',
      min: 5,
      max: 25,
    },
    coreFocus: {
      label: 'Gồng Chặt Core & Mở Rộng Lồng Ngực',
      description: 'Khóa cơ bụng khi duỗi chân đạp và ngả người 11 giờ để bảo vệ đốt sống thắt lưng',
    },
    zone2Criteria: 'Damper 4-6 • Nhịp chèo 22-26 SPM • Đều nhịp thở',
    defaultPhases: {
      phase1: {
        phaseNumber: 1,
        name: 'Warm-up',
        durationMinutes: 5,
        speedKmh: 9.0,
        inclineDegree: 0,
        resistanceLevel: 3,
        strokeRateSpm: 20,
      },
      phase2: {
        phaseNumber: 2,
        name: 'Fat Burn',
        durationMinutes: 30,
        speedKmh: 13.5,
        inclineDegree: 0,
        resistanceLevel: 5,
        strokeRateSpm: 24,
        isCoreEngaged: true,
      },
      phase3: {
        phaseNumber: 3,
        name: 'Cool-down',
        durationMinutes: 5,
        speedKmh: 8.0,
        inclineDegree: 0,
        resistanceLevel: 2,
        strokeRateSpm: 18,
      },
    },
  },
  {
    id: 'STAIR_CLIMBER',
    name: 'Máy Leo Cầu Thang (Stair Climber)',
    shortName: 'Máy Leo Cầu Thang',
    tag: 'Siết mông & đùi sau',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    bgLight: 'from-amber-500/10 to-orange-500/5',
    description: 'Leo bậc thang liên tục với trọng lực, tác động cực sâu vào cơ mông, đùi sau và cải thiện thể tích phổi.',
    param1: {
      key: 'resistanceLevel',
      label: 'Mức độ',
      unit: 'Level',
      step: '1',
      min: 1,
      max: 20,
      description: 'Mức Level 5 - 8 duy trì nhịp tim',
    },
    param2: {
      key: 'stepsPerMin',
      label: 'Tốc độ',
      unit: 'bậc/p',
      step: '2',
      min: 25,
      max: 130,
      description: '60 - 80 bậc/phút đều đặn',
    },
    coreFocus: {
      label: 'Thả Lỏng Tay Vịn & Giữ Thẳng Người',
      description: 'Không tựa dồn lực lên tay cầm máy, giữ lưng thẳng để cơ mông và đùi làm việc 100%',
    },
    zone2Criteria: '60-80 bậc/phút • Level 5-8 • Không tỳ tay lên thanh vịn',
    defaultPhases: {
      phase1: {
        phaseNumber: 1,
        name: 'Warm-up',
        durationMinutes: 5,
        speedKmh: 2.5,
        inclineDegree: 0,
        resistanceLevel: 3,
        stepsPerMin: 45,
      },
      phase2: {
        phaseNumber: 2,
        name: 'Fat Burn',
        durationMinutes: 30,
        speedKmh: 4.0,
        inclineDegree: 0,
        resistanceLevel: 7,
        stepsPerMin: 68,
        isCoreEngaged: true,
      },
      phase3: {
        phaseNumber: 3,
        name: 'Cool-down',
        durationMinutes: 5,
        speedKmh: 2.0,
        inclineDegree: 0,
        resistanceLevel: 2,
        stepsPerMin: 35,
      },
    },
  },
  {
    id: 'OUTDOOR_RUN',
    name: 'Chạy / Đi Bộ Ngoài Trời (Outdoor)',
    shortName: 'Ngoài Trời',
    tag: 'Không khí tự nhiên',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    bgLight: 'from-purple-500/10 to-indigo-500/5',
    description: 'Vận động ngoài trời trên đường phố hoặc công viên, thích nghi với địa hình tự nhiên và nhịp thở.',
    param1: {
      key: 'inclineDegree',
      label: 'Địa hình',
      unit: '% dốc',
      step: '0.5',
      min: 0,
      max: 15,
      description: 'Độ dốc mặt đường ước tính',
    },
    param2: {
      key: 'speedKmh',
      label: 'Tốc độ',
      unit: 'km/h',
      step: '0.1',
      min: 2,
      max: 18,
      description: 'Tốc độ duy trì theo nhịp thở',
    },
    coreFocus: {
      label: 'Siết Bụng & Duy Trì Nhịp Thở 2-2',
      description: 'Giữ vai thả lỏng, hít vào 2 bước, thở ra 2 bước, bụng siết nhẹ ổn định xương chậu',
    },
    zone2Criteria: 'Vận động vừa sức, vẫn nói chuyện thành câu trọn vẹn',
    defaultPhases: {
      phase1: {
        phaseNumber: 1,
        name: 'Warm-up',
        durationMinutes: 8,
        speedKmh: 4.8,
        inclineDegree: 0,
      },
      phase2: {
        phaseNumber: 2,
        name: 'Fat Burn',
        durationMinutes: 30,
        speedKmh: 6.2,
        inclineDegree: 2.0,
        isCoreEngaged: true,
      },
      phase3: {
        phaseNumber: 3,
        name: 'Cool-down',
        durationMinutes: 5,
        speedKmh: 4.2,
        inclineDegree: 0,
      },
    },
  },
];

export function getEquipmentDef(type: EquipmentType): EquipmentDef {
  return EQUIPMENT_LIST.find((eq) => eq.id === type) || EQUIPMENT_LIST[0];
}
