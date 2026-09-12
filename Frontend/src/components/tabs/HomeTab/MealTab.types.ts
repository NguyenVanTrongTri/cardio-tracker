import type { Dispatch, SetStateAction } from 'react';
import { Meal, WorkoutPhase, WorkoutRecord } from '../../../types';

export interface MealTabProps {
  meals: Meal[];
  setMeals: Dispatch<SetStateAction<Meal[]>>;
  workoutStartTime: string;
  checkPreWorkoutAlert: (workoutStartTime: string, mealTime: string) => boolean;
}
