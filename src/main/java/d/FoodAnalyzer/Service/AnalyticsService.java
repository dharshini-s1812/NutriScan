package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.DTO.*;
import d.FoodAnalyzer.Model.UserMeal;
import d.FoodAnalyzer.Repository.UserMealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final UserMealRepository userMealRepository;
    private final DashboardService dashboardService;

    public AnalyticsResponse getAnalytics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.minusDays(6).atStartOfDay();
        LocalDateTime end = today.atTime(23, 59, 59);
        List<UserMeal> meals =
                userMealRepository.findByUserIdAndCreatedAtBetween(
                        userId,
                        start,
                        end
                );
        Map<LocalDate, Double> caloriesMap = new HashMap<>();
        Map<LocalDate, Double> proteinMap = new HashMap<>();
        Double totalCalories = 0.0;
        Double totalProtein = 0.0;
        Double totalCarbs = 0.0;
        Double totalFat = 0.0;
        for (UserMeal meal : meals) {
            LocalDate date = meal.getCreatedAt().toLocalDate();
            caloriesMap.put(
                    date,
                    caloriesMap.getOrDefault(date, 0.0) + meal.getCalories()
            );
            proteinMap.put(
                    date,
                    proteinMap.getOrDefault(date, 0.0) + meal.getProtein()
            );
            totalCalories += meal.getCalories();
            totalProtein += meal.getProtein();
            totalCarbs += meal.getCarbs();
            totalFat += meal.getFat();
        }
        int streak = calculateStreak(userId);
        Double averageCalories = totalCalories / 7;
        int calorieChange = calculateCalorieChange(userId);
        List<DailyCalories> calorieTrend =
                buildCalorieTrend(caloriesMap);
        List<DailyProtein> proteinTrend =
                buildProteinTrend(proteinMap);
        MacroBreakdown macroBreakdown =
                buildMacroBreakdown(totalProtein, totalCarbs, totalFat);
        DashboardResponse dashboard = dashboardService.getDashboard(userId);
        return new AnalyticsResponse(
                streak,
                averageCalories,
                calorieChange,
                calorieTrend,
                macroBreakdown,
                proteinTrend,
                dashboard.getCalorieGoal(),
                dashboard.getProteinGoal(),
                dashboard.getCarbsGoal(),
                dashboard.getFatGoal()
        );
    }

    public int calculateStreak(Long userId) {
        int streak = 0;
        LocalDate date = LocalDate.now();
        while (true) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);
            boolean mealExists = userMealRepository
                    .existsByUserIdAndCreatedAtBetween(userId, start, end);
            if (!mealExists) {
                break;
            }
            streak++;
            date = date.minusDays(1);
        }
        return streak;
    }

    private int calculateAverageCalories(Long userId) {

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.minusDays(6).atStartOfDay();
        LocalDateTime end = today.atTime(23,59,59);
        List<UserMeal> meals =
                userMealRepository.findByUserIdAndCreatedAtBetween(
                        userId,
                        start,
                        end
                );
        int totalCalories = 0;
        for(UserMeal meal : meals){
            totalCalories += meal.getCalories();
        }
        return totalCalories / 7;
    }

    private int calculateCalorieChange(Long userId) {

        LocalDate today = LocalDate.now();
        LocalDateTime currentStart = today.minusDays(6).atStartOfDay();
        LocalDateTime currentEnd = today.atTime(23, 59, 59);
        LocalDateTime previousStart = today.minusDays(13).atStartOfDay();
        LocalDateTime previousEnd = today.minusDays(7).atTime(23, 59, 59);
        List<UserMeal> currentMeals =
                userMealRepository.findByUserIdAndCreatedAtBetween(
                        userId, currentStart, currentEnd);
        List<UserMeal> previousMeals =
                userMealRepository.findByUserIdAndCreatedAtBetween(
                        userId, previousStart, previousEnd);
        int currentTotal = 0;
        int previousTotal = 0;
        for (UserMeal meal : currentMeals) {
            currentTotal += meal.getCalories();
        }
        for (UserMeal meal : previousMeals) {
            previousTotal += meal.getCalories();
        }
        double currentAverage = currentTotal / 7.0;
        double previousAverage = previousTotal / 7.0;
        if (previousAverage == 0) {
            return 0;
        }
        return (int) Math.round(
                ((currentAverage - previousAverage) / previousAverage) * 100
        );
    }

    private List<DailyCalories> buildCalorieTrend(
            Map<LocalDate, Double> caloriesMap) {
        List<DailyCalories> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            trend.add(new DailyCalories(
                    date.getDayOfWeek().name().substring(0, 3),
                    (int) Math.round(caloriesMap.getOrDefault(date, 0.0))
            ));
        }
        return trend;
    }

    private List<DailyProtein> buildProteinTrend(
            Map<LocalDate, Double> proteinMap) {
        List<DailyProtein> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            trend.add(new DailyProtein(
                    date.getDayOfWeek().name().substring(0, 3),
                    (int) Math.round(proteinMap.getOrDefault(date, 0.0))
            ));
        }
        return trend;
    }

    private MacroBreakdown buildMacroBreakdown(
            double protein,
            double carbs,
            double fat) {
        double total = protein + carbs + fat;
        if (total == 0) {
            return new MacroBreakdown(0, 0, 0, 0, 0, 0);
        }
        int proteinPercent = (int) Math.round((protein * 100) / total);
        int carbsPercent = (int) Math.round((carbs * 100) / total);
        int fatPercent = (int) Math.round((fat * 100) / total);
        return new MacroBreakdown(
                (int) Math.round(protein),
                (int) Math.round(carbs),
                (int) Math.round(fat),
                proteinPercent,
                carbsPercent,
                fatPercent
        );
    }
}
