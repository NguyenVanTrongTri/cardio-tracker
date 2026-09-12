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
        Schema::create('meal_food_items', function (Blueprint $table) {
        $table->string('id', 36)->primary();
        $table->string('meal_id', 36);
        $table->string('food_name');
        $table->decimal('grams', 6, 2);
        $table->decimal('calories', 6, 2);

        $table->foreign('meal_id')->references('id')->on('meals')->onDelete('cascade');
        $table->index('meal_id', 'idx_meal_food_items_meal_id');
    });

    DB::statement('ALTER TABLE meal_food_items ADD CONSTRAINT chk_meal_food_items_grams CHECK (grams >= 0)');
    DB::statement('ALTER TABLE meal_food_items ADD CONSTRAINT chk_meal_food_items_calories CHECK (calories >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_food_items');
    }
};
