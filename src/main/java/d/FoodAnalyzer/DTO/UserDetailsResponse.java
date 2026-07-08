package d.FoodAnalyzer.DTO;

import d.FoodAnalyzer.Model.Allergies;
import d.FoodAnalyzer.Model.Gender;
import d.FoodAnalyzer.Model.Goal;
import lombok.Data;

import java.util.List;

@Data
public class UserDetailsResponse {
    private String name;
    private String email;
    private int age;
    private double height;
    private double weight;
    private Gender gender;
    private Goal goal;
    private List<Allergies> allergies;
}
