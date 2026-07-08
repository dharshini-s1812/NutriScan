package d.FoodAnalyzer.Service;


import d.FoodAnalyzer.DTO.BmiResponse;
import d.FoodAnalyzer.DTO.UserDetailsResponse;
import d.FoodAnalyzer.Model.UserDetails;
import d.FoodAnalyzer.Model.UserInfo;
import d.FoodAnalyzer.Repository.UserDetailsRepository;
import d.FoodAnalyzer.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsService {
    @Autowired
    private UserDetailsRepository userDetailsRepository;
    @Autowired
    private UserRepository userRepository;

    public UserDetails StoreUserDetails(UserDetails userDetails,Long userId){
        UserInfo user = userRepository.findById(userId).orElseThrow(()-> new RuntimeException("USER NOT FOUND"));
        userDetails.setUser(user);
        return userDetailsRepository.save(userDetails);
    }

    public UserDetails UpdateDetails(UserDetailsResponse response,Long userId){
        UserInfo user = userRepository.findById(userId).orElseThrow(()-> new RuntimeException("USER NOT FOUND"));
        UserDetails userDetails = userDetailsRepository.findByUser(user);
        if(userDetails == null){
            userDetails = new UserDetails();
            userDetails.setUser(user);
        }
        userDetails.setName(response.getName());
        userDetails.setHeight(response.getHeight());
        userDetails.setWeight(response.getWeight());
        userDetails.setAge(response.getAge());
        userDetails.setGender(response.getGender());
        userDetails.setGoal(response.getGoal());
        userDetails.setAllergies(response.getAllergies());
        return userDetailsRepository.save(userDetails);
    }


    public BmiResponse calcBmi(Long userId) {
        UserInfo user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));
        UserDetails userDetails = userDetailsRepository.findByUser(user);
        double heightInMeters = userDetails.getHeight() / 100.0;
        double bmi = userDetails.getWeight() / (heightInMeters * heightInMeters);
        bmi = Math.round(bmi * 100.0) / 100.0;
        String category;
        if (bmi < 18.5)
            category = "Underweight";
        else if (bmi < 25)
            category = "Normal Weight";
        else if (bmi < 30)
            category = "Overweight";
        else
            category = "Obese";
        return new BmiResponse(bmi, category);
    }
}



