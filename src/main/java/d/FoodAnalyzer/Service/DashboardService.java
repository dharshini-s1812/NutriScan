package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.DTO.DashboardResponse;
import d.FoodAnalyzer.Model.*;
import d.FoodAnalyzer.Repository.UserMealRepository;
import d.FoodAnalyzer.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final UserRepository userRepository;
    private final UserMealRepository userMealRepository;

    public DashboardResponse getDashboard(Long userId) {
        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails details = user.getUserDetails();
        Double weight = details.getWeight();
        Double height = details.getHeight();
        int age = details.getAge();
        Gender gender = details.getGender();
        Goal goal = details.getGoal();
        double bmr;
        if (gender == Gender.MALE) {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        double caloriesGoal = bmr * 1.4;
        double proteinPerKg;
        switch (goal) {
            case WEIGHT_LOSS:
                caloriesGoal -= 500;
                proteinPerKg = 1.8;
                break;
            case WEIGHT_GAIN:
                caloriesGoal += 400;
                proteinPerKg = 2.0;
                break;
            default:
                proteinPerKg = 1.2;
        }
        double proteinGoal = weight * proteinPerKg;
        double fatGoal = (caloriesGoal * 0.30) / 9;
        double carbGoal = (caloriesGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4;
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(23, 59, 59);
        List<UserMeal> meals =
                userMealRepository.findByUserIdAndCreatedAtBetween(userId, start, end);
        int caloriesTaken = 0;
        int proteinTaken = 0;
        int carbsTaken = 0;
        int fatTaken = 0;
        for (UserMeal meal : meals) {
            caloriesTaken += meal.getCalories();
            proteinTaken += meal.getProtein();
            carbsTaken += meal.getCarbs();
            fatTaken += meal.getFat();
        }
        int caloriePercentage = Math.min((int) ((caloriesTaken * 100.0) / caloriesGoal), 100);
        int proteinPercentage = Math.min((int) ((proteinTaken * 100.0) / proteinGoal), 100);
        int carbsPercentage = Math.min((int) ((carbsTaken * 100.0) / carbGoal), 100);
        int fatPercentage = Math.min((int) ((fatTaken * 100.0) / fatGoal), 100);
        int streak = calculateStreak(user.getId());
        return new DashboardResponse(
                caloriesTaken,
                (int) Math.round(caloriesGoal),
                caloriePercentage,
                proteinTaken,
                (int) Math.round(proteinGoal),
                proteinPercentage,
                carbsTaken,
                (int) Math.round(carbGoal),
                carbsPercentage,
                fatTaken,
                (int) Math.round(fatGoal),
                fatPercentage,
                streak,
                height,
                weight
        );
    }

    private int calculateStreak(Long userId) {
        int streak = 0;
        LocalDate date = LocalDate.now();
        while (true) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);
            boolean mealExists =
                    userMealRepository.existsByUserIdAndCreatedAtBetween(
                            userId, start, end);
            if (!mealExists) {
                break;
            }
            streak++;
            date = date.minusDays(1);
        }
        return streak;
    }
}
