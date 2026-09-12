<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutPhase extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    
    // Tắt timestamps nếu bảng workout_phases không có cột created_at/updated_at
    public $timestamps = false;

    protected $guarded = [];

    // Quan hệ: Thuộc về 1 Workout
    public function workout(): BelongsTo
    {
        return $this->belongsTo(Workout::class, 'workout_id', 'id');
    }
}