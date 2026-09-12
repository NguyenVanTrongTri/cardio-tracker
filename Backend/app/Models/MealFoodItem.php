<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealFoodItem extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    
    public $timestamps = false;

    protected $guarded = [];

    // Quan hệ: Thuộc về 1 Meal
    public function meal(): BelongsTo
    {
        return $this->belongsTo(Meal::class, 'meal_id', 'id');
    }
}