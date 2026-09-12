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
        Schema::create('meals', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('workout_id', 36);
            $table->string('category', 50);
            $table->string('meal_time', 20);
            $table->decimal('total_calories', 7, 2)->nullable();

            $table->foreign('workout_id')->references('id')->on('workouts')->onDelete('cascade');
            $table->index('workout_id', 'idx_meals_workout_id');
        });

        DB::statement('ALTER TABLE meals ADD CONSTRAINT chk_meals_total_calories CHECK (total_calories >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meals');
    }
};
