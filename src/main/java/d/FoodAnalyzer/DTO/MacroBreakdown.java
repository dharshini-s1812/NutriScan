package d.FoodAnalyzer.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MacroBreakdown {

    private int protein;
    private int carbs;
    private int fat;

    private int proteinPercent;
    private int carbsPercent;
    private int fatPercent;
}
