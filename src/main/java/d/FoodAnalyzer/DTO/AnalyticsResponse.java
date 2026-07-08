package d.FoodAnalyzer.DTO;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsResponse {

    private int streak;
    private Double averageCalories;
    private int calorieChangePercent;
    private List<DailyCalories> calorieTrend;
    private MacroBreakdown macroBreakdown;
    private List<DailyProtein> proteinTrend;
    private int calorieGoal;
    private int proteinGoal;
    private int carbsGoal;
    private int fatGoal;
}
