<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BodyMetric extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    
    public $timestamps = false;

    protected $guarded = [];

    // Quan hệ: Thuộc về 1 User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}