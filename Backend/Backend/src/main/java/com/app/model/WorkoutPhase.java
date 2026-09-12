package com.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "workout_phases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutPhase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @Column(name = "phase_number", nullable = false)
    private Integer phaseNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "speed_kmh", precision = 4, scale = 1)
    private BigDecimal speedKmh;

    @Column(name = "incline_degree", precision = 4, scale = 1)
    private BigDecimal inclineDegree;

    @Column(name = "distance_km", precision = 5, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "is_core_engaged")
    private Boolean isCoreEngaged;

    @Column(name = "resistance_level", precision = 4, scale = 1)
    private BigDecimal resistanceLevel;

    @Column(name = "cadence_rpm")
    private Integer cadenceRpm;

    @Column(name = "stroke_rate_spm")
    private Integer strokeRateSpm;

    @Column(name = "steps_per_min")
    private Integer stepsPerMin;

    @PrePersist
    protected void onCreate() {
        if (this.isCoreEngaged == null) {
            this.isCoreEngaged = false;
        }
    }
}