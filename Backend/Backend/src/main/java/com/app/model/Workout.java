package com.app.model;

import com.app.constant.EquipmentType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "workouts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type", nullable = false, length = 30)
    private EquipmentType equipmentType;

    @Column(name = "workout_start_time", nullable = false)
    private LocalDateTime workoutStartTime;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "waist_cm", precision = 5, scale = 2)
    private BigDecimal waistCm;

    @Column(name = "active_time")
    private Integer activeTime;

    @Column(precision = 7, scale = 2)
    private BigDecimal calories;

    @Column(name = "efficiency_index", precision = 5, scale = 2)
    private BigDecimal efficiencyIndex;

    @Column(name = "is_zone_2")
    private Boolean isZone2;

    @Column(name = "cortisol_alert")
    private Boolean cortisolAlert;

    @Column(name = "pre_workout_alert")
    private Boolean preWorkoutAlert;

    @Column(name = "pause_duration")
    private Integer pauseDuration;

    @Column(name = "fatigue_level")
    private Integer fatigueLevel;

    @Column(name = "water_consumed_ml")
    private Integer waterConsumedMl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutPhase> phases;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Meal> meals;

    @PrePersist
    protected void onCreate() {
        if (this.isZone2 == null) this.isZone2 = false;
        if (this.cortisolAlert == null) this.cortisolAlert = false;
        if (this.preWorkoutAlert == null) this.preWorkoutAlert = false;
        if (this.pauseDuration == null) this.pauseDuration = 0;
        if (this.waterConsumedMl == null) this.waterConsumedMl = 0;
        this.createdAt = LocalDateTime.now();
    }
}