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
        Schema::create('body_metrics', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36);
            $table->date('metric_date');
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->decimal('waist_cm', 5, 2)->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            
            // Khóa ngoại & Unique
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'metric_date'], 'uq_user_metric_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('body_metrics');
    }
};
