package d.FoodAnalyzer.Controller;

import d.FoodAnalyzer.DTO.DashboardResponse;
import d.FoodAnalyzer.Service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@RequestParam Long userId) {
        return ResponseEntity.ok(
                dashboardService.getDashboard(userId)
        );
    }
}
