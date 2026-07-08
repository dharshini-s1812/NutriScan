package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.DTO.ProfileResponse;
import d.FoodAnalyzer.Model.UserDetails;
import d.FoodAnalyzer.Model.UserInfo;
import d.FoodAnalyzer.Repository.UserDetailsRepository;
import d.FoodAnalyzer.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class ProfileService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserDetailsRepository userDetailsRepository;
    @Autowired
    private AnalyticsService analyticsService;


    public ProfileResponse getProfile(Long userId) {

        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails details = userDetailsRepository.findByUser(user);
        ProfileResponse response = new ProfileResponse();

        response.setUsername(user.getUsername());
        response.setName(details.getName());
        response.setAge(details.getAge());
        response.setGender(details.getGender().toString());
        response.setHeight(details.getHeight());
        response.setWeight(details.getWeight());
        response.setGoal(details.getGoal().toString());
        response.setAllergies(details.getAllergies());
        int streak = analyticsService.calculateStreak(user.getId());
        response.setStreak(streak);
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("MMMM d,yyyy");
        response.setMemberSince(
                user.getCreatedAt().format(formatter)
        );
        return response;
    }
}
