package d.FoodAnalyzer.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BarcodeResponse {
    private String barcode;
    private String productName;
    private String brand;
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
}
