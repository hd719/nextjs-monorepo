/**
 * Form validators for profile fields
 * Each validator returns undefined if valid, or an error message if invalid
 */

export const displayNameValidator = ({ value }: { value: string }) => {
  if (value && value.length < 2) {
    return "Display name must be at least 2 characters";
  }
  return undefined;
};

export const heightValidator = ({ value }: { value: string }) => {
  if (!value) return undefined;
  const height = parseFloat(value);
  if (isNaN(height)) return "Height must be a number";
  if (height < 36 || height > 96) {
    return "Height must be between 36 and 96 inches";
  }
  return undefined;
};

export const weightValidator = ({ value }: { value: string }) => {
  if (!value) return undefined;
  const weight = parseFloat(value);
  if (isNaN(weight)) return "Weight must be a number";
  if (weight < 50 || weight > 1000) {
    return "Weight must be between 50 and 1000 lbs";
  }
  return undefined;
};

export const calorieGoalValidator = ({ value }: { value: string }) => {
  const calories = parseInt(value);
  if (isNaN(calories)) return "Calories must be a number";
  if (calories < 500 || calories > 10000) {
    return "Calories must be between 500 and 10000";
  }
  return undefined;
};

export const proteinGoalValidator = ({ value }: { value: string }) => {
  const protein = parseInt(value);
  if (isNaN(protein)) return "Protein must be a number";
  if (protein < 0 || protein > 500) {
    return "Protein must be between 0 and 500g";
  }
  return undefined;
};

export const carbGoalValidator = ({ value }: { value: string }) => {
  const carbs = parseInt(value);
  if (isNaN(carbs)) return "Carbs must be a number";
  if (carbs < 0 || carbs > 1000) {
    return "Carbs must be between 0 and 1000g";
  }
  return undefined;
};

export const fatGoalValidator = ({ value }: { value: string }) => {
  const fat = parseInt(value);
  if (isNaN(fat)) return "Fat must be a number";
  if (fat < 0 || fat > 300) {
    return "Fat must be between 0 and 300g";
  }
  return undefined;
};
