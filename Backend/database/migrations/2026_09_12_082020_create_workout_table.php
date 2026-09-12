<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('workouts', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36);
            $table->enum('equipment_type', ['TREADMILL', 'STATIONARY_BIKE', 'ROWING_MACHINE', 'STAIR_CLIMBER', 'OUTDOOR_RUN']);
            $table->dateTime('workout_start_time');
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->decimal('waist_cm', 5, 2)->nullable();
            $table->integer('active_time')->nullable();
            $table->decimal('calories', 7, 2)->nullable();
            $table->decimal('efficiency_index', 5, 2)->nullable();
            $table->boolean('is_zone_2')->default(false);
            $table->boolean('cortisol_alert')->default(false);
            $table->boolean('pre_workout_alert')->default(false);
            $table->integer('pause_duration')->default(0);
            $table->tinyInteger('fatigue_level')->nullable();
            $table->integer('water_consumed_ml')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Khóa ngoại, Index & Check Constraints (thủ công qua DB statement nếu cần)
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id', 'idx_workouts_user_id');
            $table->index('workout_start_time', 'idx_workouts_start_time');
        });

        // Thêm các ràng buộc CHECK (Laravel hỗ trợ qua DB::statement cho MySQL)
        DB::statement('ALTER TABLE workouts ADD CONSTRAINT chk_workouts_active_time CHECK (active_time >= 0)');
        DB::statement('ALTER TABLE workouts ADD CONSTRAINT chk_workouts_calories CHECK (calories >= 0)');
        DB::statement('ALTER TABLE workouts ADD CONSTRAINT chk_workouts_fatigue_level CHECK (fatigue_level BETWEEN 1 AND 5)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_phases');
    }
};
