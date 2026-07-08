package d.FoodAnalyzer.DTO;

import d.FoodAnalyzer.Model.Food;
import lombok.*;

@Data
@Builder
public class FoodResponse {

    private String foodName;
    private double calories;
    private double protein;
    private double carbs;
    private double fat;

    public static FoodResponse from(Food food){

        return FoodResponse.builder()
                .foodName(food.getFoodName())
                .calories(food.getCalories())
                .protein(food.getProtein())
                .carbs(food.getCarbs())
                .fat(food.getFat())
                .build();

    }

}
