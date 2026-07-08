package d.FoodAnalyzer.DTO;

import d.FoodAnalyzer.Model.MealType;
import d.FoodAnalyzer.Model.Portion;
import lombok.Data;

@Data
public class UserMealRequest {

    private Long id;
    private MealType mealType;
    private String foodName;
    private Portion portionSize;
    private Double calories;
    private Double protein;
    private Double carbs;
    private Double fat;
}
