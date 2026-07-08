package d.FoodAnalyzer.Controller;
import d.FoodAnalyzer.DTO.UserDetailsResponse;
import d.FoodAnalyzer.Model.UserDetails;
import d.FoodAnalyzer.Service.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
public class UserDetailsController {

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/preferences")
    public ResponseEntity<?> saveUserDetails(
            @RequestParam Long userId,
            @RequestBody UserDetails userDetails) {

        UserDetails saved = userDetailsService.StoreUserDetails(userDetails,userId);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/updatePreferences")
    public ResponseEntity<UserDetails> updateUserDetails(
            @RequestParam Long userId, @RequestBody UserDetailsResponse response){
            UserDetails saved = userDetailsService.UpdateDetails(response,userId);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/bmi")
    public ResponseEntity<?> getBmi(@RequestParam Long userId){
        return ResponseEntity.ok(userDetailsService.calcBmi(userId));
    }

}

