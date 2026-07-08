package d.FoodAnalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class FoodAnalyzerApplication {

	public static void main(String[] args) {
		SpringApplication.run(FoodAnalyzerApplication.class, args);
	}

}
