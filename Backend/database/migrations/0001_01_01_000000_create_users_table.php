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
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('email')->unique();
            $table->string('password_hash')->nullable();
            $table->string('full_name', 100);
            $table->enum('role', ['ADMIN', 'USER'])->default('USER');
            $table->enum('gender', ['MALE', 'FEMALE'])->nullable();
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->integer('birth_year')->nullable();
            $table->decimal('target_waist_cm', 5, 2)->nullable();
            $table->decimal('target_weight_kg', 5, 2)->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->date('target_date')->nullable();
            $table->timestamps(); // Tự động tạo created_at và updated_at
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
