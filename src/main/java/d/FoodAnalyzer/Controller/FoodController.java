package d.FoodAnalyzer.Controller;

import d.FoodAnalyzer.DTO.BarcodeResponse;
import d.FoodAnalyzer.DTO.FoodResponse;
import d.FoodAnalyzer.Service.BarcodeService;
import d.FoodAnalyzer.Service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @PostMapping("/identify")
    public ResponseEntity<?> identify(
            @RequestParam MultipartFile image) {
        try {
            return ResponseEntity.ok(
                    foodService.identifyFood(image)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "type", "ERROR",
                            "message", "Unable to identify image."
                    )
            );
        }
    }
}
