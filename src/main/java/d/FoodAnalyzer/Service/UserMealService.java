package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.DTO.UserMealRequest;
import d.FoodAnalyzer.DTO.UserMealResponse;
import d.FoodAnalyzer.Model.Food;
import d.FoodAnalyzer.Model.MealType;
import d.FoodAnalyzer.Model.UserInfo;
import d.FoodAnalyzer.Model.UserMeal;
import d.FoodAnalyzer.Repository.FoodRepository;
import d.FoodAnalyzer.Repository.UserMealRepository;
import d.FoodAnalyzer.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserMealService {

    private final UserRepository userRepository;
    private final UserMealRepository userMealRepository;
    private final FoodRepository foodRepository;

    public List<UserMeal> getTodayEntries(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        return userMealRepository.findByUserIdAndCreatedAtBetween(userId,start, end);
    }

    public UserMealResponse storeUserMeal(Long userId, UserMealRequest request) {

        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserMeal meal = new UserMeal();
        meal.setUser(user);
        meal.setFoodName(request.getFoodName());
        meal.setMealType(request.getMealType());
        meal.setPortionSize(request.getPortionSize());
        meal.setCreatedAt(LocalDateTime.now());

        if (request.getCalories() != null) {
            meal.setCalories(request.getCalories());
            meal.setProtein(request.getProtein());
            meal.setCarbs(request.getCarbs());
            meal.setFat(request.getFat());

        }
        else {
            Food food = foodRepository.findByFoodName(request.getFoodName())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Food not found: " + request.getFoodName()));
            int grams = switch (request.getPortionSize()) {
                case SMALL -> 150;
                case MEDIUM -> 350;
                case LARGE -> 600;
            };
            double factor = grams / 100.0;
            meal.setCalories(food.getCalories() * factor);
            meal.setProtein(food.getProtein() * factor);
            meal.setCarbs(food.getCarbs() * factor);
            meal.setFat(food.getFat() * factor);
        }
        UserMeal savedMeal = userMealRepository.save(meal);
        UserMealResponse response = new UserMealResponse();
        response.setFoodName(savedMeal.getFoodName());
        response.setMealType(savedMeal.getMealType());
        response.setPortionSize(savedMeal.getPortionSize());
        response.setCalories(savedMeal.getCalories());
        response.setProtein(savedMeal.getProtein());
        response.setCarbs(savedMeal.getCarbs());
        response.setFat(savedMeal.getFat());
        return response;
    }

    public List<UserMeal> history(Long userId, LocalDate date, String type) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        if (type == null || type.isBlank()) {
            return userMealRepository.findByUserIdAndCreatedAtBetween(
                    userId, start, end);
        }
        MealType mealType = MealType.valueOf(type.toUpperCase());
        return userMealRepository.findByUserIdAndCreatedAtBetweenAndMealType(
                userId, start, end, mealType);
    }

    public void deleteMeal(Long mealId) {
        userMealRepository.deleteById(mealId);
    }
}
