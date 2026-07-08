package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.DTO.BarcodeResponse;
import d.FoodAnalyzer.DTO.FoodResponse;
import d.FoodAnalyzer.Model.Food;
import d.FoodAnalyzer.Repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class FoodService {

    private final BarcodeService barcodeService;
    private final GeminiService geminiService;
    private final FoodRepository repository;
    private final NutritionApiService nutritionApiService;

    public Object identifyFood(MultipartFile image) throws Exception {
        try {
            BarcodeResponse barcode =
                    barcodeService.identify(image);
            return Map.of(
                    "type", "BARCODE",
                    "product", barcode
            );

        } catch (Exception e) {

        }
        String foodName =
                geminiService.identifyFood(image);
        Optional<Food> existing =
                repository.findByFoodName(foodName);
        FoodResponse response;
        if (existing.isPresent()) {
            response = FoodResponse.from(existing.get());
        } else {
            Food food =
                    nutritionApiService.fetchFood(foodName);
            repository.save(food);
            response = FoodResponse.from(food);
        }
        return Map.of(
                "type", "FOOD",
                "food", response
        );
    }
}

