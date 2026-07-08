package d.FoodAnalyzer.DTO;

import d.FoodAnalyzer.Model.MealType;
import d.FoodAnalyzer.Model.Portion;
import lombok.Data;

@Data
public class UserMealResponse {

    private String foodName;
    private MealType mealType;
    private Portion portionSize;

    private double calories;
    private double protein;
    private double carbs;
    private double fat;
}
