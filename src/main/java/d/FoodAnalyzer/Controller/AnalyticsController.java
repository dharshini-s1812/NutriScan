package d.FoodAnalyzer.Controller;

import d.FoodAnalyzer.DTO.AnalyticsResponse;
import d.FoodAnalyzer.Service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> analytics(
            @RequestParam Long userId) {
        return ResponseEntity.ok(
                analyticsService.getAnalytics(userId)
        );
    }
}
