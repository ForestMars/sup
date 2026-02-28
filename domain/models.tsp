@service({ title: "FeedMe Nurse POC", version: "0.1.0" })
namespace FeedMeNurse {

  model MenuItemNutrition {
    sodiumMg: int;
    containsPeanuts: bool;
    viscosityLevel: string;
  }

  model MenuItem {
    id: string @key;
    name: string;
    nutrition: MenuItemNutrition;
  }

  model DietaryRestriction {
    type: string; // e.g., "lowSodium", "peanutAllergy", "viscosity"
    maxSodium?: int;
    containsPeanuts?: bool;
    viscosityLevel?: string;
  }

  model Patient {
    id: string @key;
    name: string;
    dietaryRestrictions: DietaryRestriction[];
  }

  @route("/menu-items")
  op AddMenuItem(name: string, nutrition: MenuItemNutrition) : MenuItem;

  @route("/patients/{patientId}/restrictions")
  op UpdateDietaryRestriction(patientId: string, restriction: DietaryRestriction) : Patient;

  @route("/patients/{patientId}/meal-choice")
  op SubmitMealChoice(patientId: string, menuItemId: string) : record { patientId: string; menuItemId: string; };
}
