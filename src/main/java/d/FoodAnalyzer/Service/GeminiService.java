package d.FoodAnalyzer.Service;

import lombok.RequiredArgsConstructor;
import lombok.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {
    @Value("${gemini.api.key}")
    private String apiKey;
    @Value("${gemini.api.url}")
    private String url;

    private final RestTemplate restTemplate;
    public String identifyFood(MultipartFile image) throws IOException {
        String base64 = Base64.getEncoder()
                .encodeToString(image.getBytes());
        Map<String,Object> body = Map.of(
                "contents",
                List.of(
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                "Identify the food in this image. Return only the food name."
                                        ),
                                        Map.of(
                                                "inline_data",
                                                Map.of(
                                                        "mime_type",
                                                        image.getContentType(),
                                                        "data",
                                                        base64
                                                )
                                        )
                                )
                        )
                )
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String,Object>> entity =
                new HttpEntity<>(body, headers);
        String response =
                restTemplate.postForObject(
                        url + "?key=" + apiKey,
                        entity,
                        String.class
                );
        ObjectMapper mapper = new ObjectMapper();
        JsonNode json = mapper.readTree(response);
        return json.get("candidates")
                .get(0)
                .get("content")
                .get("parts")
                .get(0)
                .get("text")
                .asText()
                .trim();
    }
}
