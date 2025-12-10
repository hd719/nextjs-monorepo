-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle');

-- CreateEnum
CREATE TYPE "Units" AS ENUM ('metric', 'imperial');

-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('usda', 'edamam', 'open_food_facts', 'user', 'cookbook');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('cardio', 'strength', 'flexibility', 'sports', 'other');

-- CreateEnum
CREATE TYPE "ExerciseDifficulty" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "ExerciseSource" AS ENUM ('usda', 'user', 'verified');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'other');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('pending', 'accepted', 'blocked');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('weight_loss', 'steps', 'workouts', 'nutrition', 'custom');

-- CreateEnum
CREATE TYPE "UserGoalType" AS ENUM ('weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'nutrition');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "date_of_birth" DATE,
    "gender" "Gender",
    "height_cm" DECIMAL(5,2),
    "activity_level" "ActivityLevel",
    "goal_type" "GoalType",
    "target_weight_kg" DECIMAL(5,2),
    "daily_calorie_goal" INTEGER,
    "daily_protein_goal_g" INTEGER,
    "daily_carb_goal_g" INTEGER,
    "daily_fat_goal_g" INTEGER,
    "units_preference" "Units" NOT NULL DEFAULT 'metric',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "barcode" TEXT,
    "serving_size_g" DECIMAL(10,2) NOT NULL,
    "serving_size_unit" TEXT,
    "calories_per_100g" DECIMAL(10,2) NOT NULL,
    "protein_g" DECIMAL(10,2) NOT NULL,
    "carbs_g" DECIMAL(10,2) NOT NULL,
    "fat_g" DECIMAL(10,2) NOT NULL,
    "fiber_g" DECIMAL(10,2),
    "sugar_g" DECIMAL(10,2),
    "sodium_mg" DECIMAL(10,2),
    "source" "FoodSource" NOT NULL,
    "source_id" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "muscle_groups" TEXT[],
    "met_value" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "instructions" TEXT[],
    "equipment" TEXT[],
    "difficulty" "ExerciseDifficulty",
    "source" "ExerciseSource" NOT NULL DEFAULT 'user',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "food_item_id" TEXT NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "quantity_g" DECIMAL(10,2) NOT NULL,
    "servings" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "calories_burned" INTEGER,
    "sets" INTEGER,
    "reps" INTEGER,
    "weight_kg" DECIMAL(6,2),
    "distance_km" DECIMAL(8,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weight_kg" DECIMAL(5,2),
    "body_fat_percentage" DECIMAL(5,2),
    "muscle_mass_kg" DECIMAL(5,2),
    "waist_cm" DECIMAL(5,2),
    "hips_cm" DECIMAL(5,2),
    "chest_cm" DECIMAL(5,2),
    "thigh_cm" DECIMAL(5,2),
    "bicep_cm" DECIMAL(5,2),
    "photo_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_cache" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "recipe_slug" TEXT NOT NULL,
    "servings" INTEGER NOT NULL,
    "total_calories" DECIMAL(10,2) NOT NULL,
    "calories_per_serving" DECIMAL(10,2) NOT NULL,
    "protein_g" DECIMAL(10,2) NOT NULL,
    "carbs_g" DECIMAL(10,2) NOT NULL,
    "fat_g" DECIMAL(10,2) NOT NULL,
    "fiber_g" DECIMAL(10,2),
    "sugar_g" DECIMAL(10,2),
    "sodium_mg" DECIMAL(10,2),
    "ingredients_breakdown" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "meals" JSONB NOT NULL,
    "total_calories" DECIMAL(10,2),
    "total_protein_g" DECIMAL(10,2),
    "total_carbs_g" DECIMAL(10,2),
    "total_fat_g" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_start_date" DATE NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "food_item_id" TEXT,
    "recipe_id" TEXT,
    "quantity_g" DECIMAL(10,2) NOT NULL,
    "servings" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "goal_type" "UserGoalType" NOT NULL,
    "title" TEXT NOT NULL,
    "target_value" DECIMAL(10,2),
    "target_unit" TEXT,
    "start_date" DATE NOT NULL,
    "target_date" DATE,
    "current_value" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friends" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL,
    "requested_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "challenge_type" "ChallengeType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "target_value" DECIMAL(10,2),
    "target_unit" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "max_participants" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participants" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_value" DECIMAL(10,2),
    "rank" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_items_barcode_key" ON "food_items"("barcode");

-- CreateIndex
CREATE INDEX "food_items_name_idx" ON "food_items"("name");

-- CreateIndex
CREATE INDEX "food_items_barcode_idx" ON "food_items"("barcode");

-- CreateIndex
CREATE INDEX "food_items_source_idx" ON "food_items"("source");

-- CreateIndex
CREATE INDEX "food_items_verified_idx" ON "food_items"("verified");

-- CreateIndex
CREATE INDEX "food_items_created_by_idx" ON "food_items"("created_by");

-- CreateIndex
CREATE INDEX "exercises_name_idx" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "exercises_category_idx" ON "exercises"("category");

-- CreateIndex
CREATE INDEX "exercises_verified_idx" ON "exercises"("verified");

-- CreateIndex
CREATE INDEX "exercises_created_by_idx" ON "exercises"("created_by");

-- CreateIndex
CREATE INDEX "diary_entries_user_id_idx" ON "diary_entries"("user_id");

-- CreateIndex
CREATE INDEX "diary_entries_date_idx" ON "diary_entries"("date");

-- CreateIndex
CREATE INDEX "diary_entries_food_item_id_idx" ON "diary_entries"("food_item_id");

-- CreateIndex
CREATE INDEX "diary_entries_user_id_date_idx" ON "diary_entries"("user_id", "date");

-- CreateIndex
CREATE INDEX "workout_logs_user_id_idx" ON "workout_logs"("user_id");

-- CreateIndex
CREATE INDEX "workout_logs_date_idx" ON "workout_logs"("date");

-- CreateIndex
CREATE INDEX "workout_logs_exercise_id_idx" ON "workout_logs"("exercise_id");

-- CreateIndex
CREATE INDEX "workout_logs_user_id_date_idx" ON "workout_logs"("user_id", "date");

-- CreateIndex
CREATE INDEX "weight_entries_user_id_idx" ON "weight_entries"("user_id");

-- CreateIndex
CREATE INDEX "weight_entries_date_idx" ON "weight_entries"("date");

-- CreateIndex
CREATE INDEX "weight_entries_user_id_date_idx" ON "weight_entries"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_cache_recipe_id_key" ON "recipe_cache"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_cache_recipe_id_idx" ON "recipe_cache"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_cache_recipe_slug_idx" ON "recipe_cache"("recipe_slug");

-- CreateIndex
CREATE INDEX "meal_plan_templates_user_id_idx" ON "meal_plan_templates"("user_id");

-- CreateIndex
CREATE INDEX "meal_plan_templates_is_public_idx" ON "meal_plan_templates"("is_public");

-- CreateIndex
CREATE INDEX "meal_plans_user_id_idx" ON "meal_plans"("user_id");

-- CreateIndex
CREATE INDEX "meal_plans_week_start_date_idx" ON "meal_plans"("week_start_date");

-- CreateIndex
CREATE INDEX "meal_plans_food_item_id_idx" ON "meal_plans"("food_item_id");

-- CreateIndex
CREATE INDEX "meal_plans_user_id_week_start_date_idx" ON "meal_plans"("user_id", "week_start_date");

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE INDEX "goals_is_active_idx" ON "goals"("is_active");

-- CreateIndex
CREATE INDEX "goals_is_completed_idx" ON "goals"("is_completed");

-- CreateIndex
CREATE INDEX "goals_user_id_is_active_idx" ON "goals"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "friends_user_id_idx" ON "friends"("user_id");

-- CreateIndex
CREATE INDEX "friends_friend_id_idx" ON "friends"("friend_id");

-- CreateIndex
CREATE INDEX "friends_status_idx" ON "friends"("status");

-- CreateIndex
CREATE INDEX "friends_requested_by_idx" ON "friends"("requested_by");

-- CreateIndex
CREATE UNIQUE INDEX "friends_user_id_friend_id_key" ON "friends"("user_id", "friend_id");

-- CreateIndex
CREATE INDEX "challenges_created_by_idx" ON "challenges"("created_by");

-- CreateIndex
CREATE INDEX "challenges_is_public_idx" ON "challenges"("is_public");

-- CreateIndex
CREATE INDEX "challenges_start_date_idx" ON "challenges"("start_date");

-- CreateIndex
CREATE INDEX "challenges_end_date_idx" ON "challenges"("end_date");

-- CreateIndex
CREATE INDEX "challenge_participants_challenge_id_idx" ON "challenge_participants"("challenge_id");

-- CreateIndex
CREATE INDEX "challenge_participants_user_id_idx" ON "challenge_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_challenge_id_user_id_key" ON "challenge_participants"("challenge_id", "user_id");

-- AddForeignKey
ALTER TABLE "food_items" ADD CONSTRAINT "food_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_templates" ADD CONSTRAINT "meal_plan_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
