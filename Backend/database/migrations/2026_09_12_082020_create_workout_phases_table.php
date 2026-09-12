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
       Schema::create('workout_phases', function (Blueprint $table) {
        $table->string('id', 36)->primary();
        $table->string('workout_id', 36);
        $table->integer('phase_number');
        $table->string('name', 100);
        $table->integer('duration_minutes')->nullable();
        $table->decimal('speed_kmh', 4, 1)->nullable();
        $table->decimal('incline_degree', 4, 1)->nullable();
        $table->decimal('distance_km', 5, 2)->nullable();
        $table->boolean('is_core_engaged')->default(false);
        $table->decimal('resistance_level', 4, 1)->nullable();
        $table->integer('cadence_rpm')->nullable();
        $table->integer('stroke_rate_spm')->nullable();
        $table->integer('steps_per_min')->nullable();

        $table->foreign('workout_id')->references('id')->on('workouts')->onDelete('cascade');
        $table->index('workout_id', 'idx_workout_phases_workout_id');
    });

    DB::statement('ALTER TABLE workout_phases ADD CONSTRAINT chk_workout_phases_duration CHECK (duration_minutes >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_phases');
    }
};
