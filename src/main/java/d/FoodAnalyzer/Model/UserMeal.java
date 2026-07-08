package d.FoodAnalyzer.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class UserMeal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mealId;
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private UserInfo user;
    @Enumerated(EnumType.STRING)
    private MealType mealType;
    private String foodName;
    @Enumerated(EnumType.STRING)
    private Portion portionSize;
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
}
