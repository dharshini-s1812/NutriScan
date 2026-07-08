package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.Model.UserInfo;
import d.FoodAnalyzer.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public UserInfo createUser(UserInfo user){
        return userRepository.save(user);
    }

    public UserInfo getUserById(Long id){
        return userRepository.findById(id).orElseThrow(RuntimeException::new);
    }

}
