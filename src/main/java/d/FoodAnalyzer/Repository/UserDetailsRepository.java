package d.FoodAnalyzer.Repository;

import d.FoodAnalyzer.Model.UserDetails;
import d.FoodAnalyzer.Model.UserInfo; // Make sure this is imported
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDetailsRepository extends JpaRepository<UserDetails, Long> {
    UserDetails findByUser(UserInfo user);
}
