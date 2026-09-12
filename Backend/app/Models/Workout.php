<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workout extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];

    // Quan hệ: Thuộc về 1 User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Quan hệ: Có nhiều giai đoạn tập (Phases)
    public function workoutPhases(): HasMany
    {
        return $this->hasMany(WorkoutPhase::class, 'workout_id', 'id');
    }

    // Quan hệ: Có nhiều bữa ăn đi kèm buổi tập
    public function meals(): HasMany
    {
        return $this->hasMany(Meal::class, 'workout_id', 'id');
    }
}