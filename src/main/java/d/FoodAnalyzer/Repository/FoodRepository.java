package d.FoodAnalyzer.Repository;

import d.FoodAnalyzer.Model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FoodRepository extends JpaRepository<Food,Long> {
    @Query("""
           SELECT f
           FROM Food f
           WHERE UPPER(TRIM(f.foodName)) = UPPER(TRIM(:foodName))
           """)
    Optional<Food> findByFoodName(@Param("foodName") String foodName);

    @Query("""
       SELECT f
       FROM Food f
       WHERE LOWER(TRIM(f.foodName)) LIKE LOWER(CONCAT(TRIM(:query), '%'))
       ORDER BY f.foodName
       """)
    List<Food> searchFoodNames(@Param("query") String query);
}
