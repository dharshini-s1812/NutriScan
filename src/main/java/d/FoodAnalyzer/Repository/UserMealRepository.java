package d.FoodAnalyzer.Repository;

import d.FoodAnalyzer.Model.MealType;
import d.FoodAnalyzer.Model.UserMeal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface UserMealRepository extends JpaRepository<UserMeal,Long> {
    List<UserMeal> findByUserId(Long Id);
    List<UserMeal> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<UserMeal> findByUserIdAndCreatedAtBetweenAndMealType(
            Long userId,
            LocalDateTime start,
            LocalDateTime end,
            MealType mealType
    );
    List<UserMeal> findByUserIdAndCreatedAtBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
    boolean existsByUserIdAndCreatedAtBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );


}
