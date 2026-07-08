package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.DTO.LoginResponse; // Corrected return DTO import
import d.FoodAnalyzer.Model.UserDetails;
import d.FoodAnalyzer.Model.UserInfo;
import d.FoodAnalyzer.Repository.UserDetailsRepository;
import d.FoodAnalyzer.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse generateLoginResponse(UserInfo user) {
        String token = jwtUtil.generateToken(user.getUsername());
        UserDetails details = userDetailsRepository.findByUser(user);
        boolean hasPreferences = (details != null);
        return new LoginResponse(token, user.getId(), hasPreferences);
    }
}
