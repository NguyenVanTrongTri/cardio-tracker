import { useState, useCallback } from 'react';
import { WorkoutRecord } from '../types';
import { API_ENDPOINTS } from '../services/apiConfig';

export const useWorkoutHistory = () => {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.WORKOUTS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = (data.data || []).map((w: any) => ({
          ...w,
          phases: w.workoutPhases || [],
          efficiencyIndex: w.efficiencyIndex || "0.0",
          weightKg: w.weightKg || null,
          waistCm: w.waistCm || null,
          calPerMinute: w.calPerMinute || (w.activeTime > 0 ? (Number(w.calories) / Number(w.activeTime)).toFixed(1) : "0.0"),
        }));
        setWorkouts(formattedData);
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteWorkout = async (id: string) => {
    try {
        const response = await fetch(`${API_ENDPOINTS.WORKOUTS}/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (response.ok) {
          setWorkouts((prev) => prev.filter((w) => w.id !== id));
          return true;
        }
    } catch (error) {
        console.error('Lỗi xóa buổi tập:', error);
    }
    return false;
  };

  return { workouts, setWorkouts, isLoading, loadData, deleteWorkout };
};
