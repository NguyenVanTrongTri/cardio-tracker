<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Meal extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    
    public $timestamps = false;

    protected $guarded = [];

    // Quan hệ: Thuộc về 1 Workout
    public function workout(): BelongsTo
    {
        return $this->belongsTo(Workout::class, 'workout_id', 'id');
    }

    // Quan hệ: Có nhiều món ăn trong bữa
    public function foodItems(): HasMany
    {
        return $this->hasMany(MealFoodItem::class, 'meal_id', 'id');
    }
}