package com.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "meal_food_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealFoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal grams;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal calories;
}