package d.FoodAnalyzer.Controller;

import d.FoodAnalyzer.DTO.ProfileResponse;
import d.FoodAnalyzer.Service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Long userId) {

        ProfileResponse response =
                profileService.getProfile(userId);

        return ResponseEntity.ok(response);
    }
}
