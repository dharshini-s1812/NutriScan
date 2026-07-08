package d.FoodAnalyzer.Service;


import d.FoodAnalyzer.Model.Food;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class NutritionApiService {

    @Value("${usda.api.key}")
    private String apiKey;

    @Value("${usda.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Food fetchFood(String foodName){

        try{

            String url = apiUrl + "?query=" + foodName + "&api_key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            entity,
                            String.class
                    );

            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode foods = root.get("foods");

            if(foods == null || foods.isEmpty()){
                throw new RuntimeException("Food not found");
            }

            JsonNode firstFood = foods.get(0);

            Food food = new Food();

            food.setFoodName(firstFood.get("description").asText());

            JsonNode nutrients = firstFood.get("foodNutrients");

            for(JsonNode nutrient : nutrients){

                int id = nutrient.get("nutrientId").asInt();

                double value = nutrient.has("value")
                        ? nutrient.get("value").asDouble()
                        : 0;

                switch(id){

                    case 1008: // Calories
                        food.setCalories(value);
                        break;

                    case 1003: // Protein
                        food.setProtein(value);
                        break;

                    case 1005: // Carbs
                        food.setCarbs(value);
                        break;

                    case 1004: // Fat
                        food.setFat(value);
                        break;
                }

            }

            return food;

        }catch(Exception e){

            throw new RuntimeException("Unable to fetch nutrition data",e);

        }

    }

}
