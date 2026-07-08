package d.FoodAnalyzer.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private int caloriesTaken;
    private int calorieGoal;
    private int caloriePercent;
    private int proteinTaken;
    private int proteinGoal;
    private int proteinPercent;
    private int carbsTaken;
    private int carbsGoal;
    private int carbsPercent;
    private int fatTaken;
    private int fatGoal;
    private int fatPercent;
    private int streak;
    private Double height;
    private Double weight;
}

