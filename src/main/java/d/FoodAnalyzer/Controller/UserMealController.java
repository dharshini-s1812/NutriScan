package d.FoodAnalyzer.Controller;


import d.FoodAnalyzer.DTO.UserMealRequest;
import d.FoodAnalyzer.DTO.UserMealResponse;
import d.FoodAnalyzer.Model.UserMeal;
import d.FoodAnalyzer.Repository.FoodRepository;
import d.FoodAnalyzer.Service.UserMealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;



@RestController
public class UserMealController {
    @Autowired
    private UserMealService userMealService;

    @PostMapping("/addMeal")
    public ResponseEntity<?> AddMeal(@RequestParam Long userId, @RequestBody UserMealRequest request) {
        System.out.println("Reached controller");
        return ResponseEntity.ok(userMealService.storeUserMeal(userId, request));
    }

    @GetMapping("/todayMeal")
    public ResponseEntity<List<UserMeal>> getTodayEntries(Long userId) {
        return ResponseEntity.ok(userMealService.getTodayEntries(userId));
    }
    @GetMapping("/meals/history")
    public ResponseEntity<?> history(
            @RequestParam Long userId,
            @RequestParam LocalDate date,
            @RequestParam(required = false) String type) {

        return ResponseEntity.ok(userMealService.history(userId, date, type));
    }
    @DeleteMapping("/deleteMeal/{mealId}")
    public ResponseEntity<?> deleteMeal(@PathVariable Long mealId) {
        userMealService.deleteMeal(mealId);
        return ResponseEntity.ok("Meal deleted successfully");
    }

}


