package d.FoodAnalyzer.Controller;

import d.FoodAnalyzer.DTO.LoginRequest;
import d.FoodAnalyzer.DTO.LoginResponse;
import d.FoodAnalyzer.Model.UserInfo;
import d.FoodAnalyzer.Repository.UserRepository;
import d.FoodAnalyzer.Service.AuthService;
import d.FoodAnalyzer.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Map<String,String> body){
        String username = body.get("username");
        String password = body.get("password");

        if(userRepository.findByUsername(username).isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("USERNAME ALREADY EXISTS !");
        }

        password = passwordEncoder.encode(password);
        userService.createUser(UserInfo.builder().username(username).password(password).build());
        return new ResponseEntity<>("SUCCESSFULLY CREATED !", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        var userOptional = userRepository.findByUsername(request.getUsername());
        if(userOptional.isEmpty()){
            return new ResponseEntity<>("PLEASE REGISTER FIRST", HttpStatus.UNAUTHORIZED);
        }

        UserInfo user = userOptional.get();
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            return new ResponseEntity<>("INVALID USER", HttpStatus.UNAUTHORIZED);
        }
        LoginResponse response = authService.generateLoginResponse(user);
        return ResponseEntity.ok(response);
    }
}