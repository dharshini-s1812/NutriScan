package d.FoodAnalyzer.Service;

import d.FoodAnalyzer.DTO.BarcodeResponse;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class OpenFoodFactsService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    public BarcodeResponse getFood(String barcode) {
        String url =
                "https://world.openfoodfacts.org/api/v0/product/"
                        + barcode + ".json";
        try {
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(json);
            if (root.get("status").asInt() != 1) {
                throw new RuntimeException("Product not found");
            }
            JsonNode product = root.get("product");
            JsonNode nutriments = product.get("nutriments");
            BarcodeResponse response = new BarcodeResponse();
            response.setBarcode(barcode);
            response.setProductName(
                    product.path("product_name").asText("Unknown Product"));
            response.setBrand(
                    product.path("brands").asText("Unknown Brand"));
            response.setCalories(
                    nutriments.path("energy-kcal_100g").asDouble(0));
            response.setProtein(
                    nutriments.path("proteins_100g").asDouble(0));
            response.setCarbs(
                    nutriments.path("carbohydrates_100g").asDouble(0));
            response.setFat(
                    nutriments.path("fat_100g").asDouble(0));
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch product details", e);
        }
    }
}
