<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // Cấu hình vì bảng dùng id là VARCHAR(36) thay vì số tự tăng (auto-increment)
    public $incrementing = false;
    protected $keyType = 'string';

    // Cho phép mass assignment các cột trong bảng users của Cardio Tracker
    protected $fillable = [
        'id',
        'email',
        'password_hash',
        'full_name',
        'role',
        'gender',
        'height_cm',
        'birth_year',
        'target_waist_cm',
        'target_weight_kg',
        'weight_kg',
        'target_date',
    ];

    // Ẩn mật khẩu khi trả về JSON
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }

    /**
     * Quan hệ 1-N: Một User có nhiều buổi tập (Workouts)
     */
    public function workouts(): HasMany
    {
        return $this->hasMany(Workout::class, 'user_id', 'id');
    }

    /**
     * Quan hệ 1-N: Một User có nhiều bản ghi số đo cơ thể (Body Metrics)
     */
    public function bodyMetrics(): HasMany
    {
        return $this->hasMany(BodyMetric::class, 'user_id', 'id');
    }
}