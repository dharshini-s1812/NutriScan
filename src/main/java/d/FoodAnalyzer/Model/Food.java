package d.FoodAnalyzer.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long foodId;
    private String foodName;
    private String servingUnit;
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
}
