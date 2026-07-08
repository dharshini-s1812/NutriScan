package d.FoodAnalyzer.DTO;

import d.FoodAnalyzer.Model.Allergies;
import lombok.Data;

import java.util.List;

@Data
public class ProfileResponse {
    private String username;
    private String name;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String goal;
    private List<Allergies> allergies;
    private Integer streak;
    private String memberSince;
}
