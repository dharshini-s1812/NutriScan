package d.FoodAnalyzer.Service;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import d.FoodAnalyzer.DTO.BarcodeResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

@Service
public class BarcodeService {

    private final OpenFoodFactsService foodFactsService;

    public BarcodeService(OpenFoodFactsService foodFactsService) {
        this.foodFactsService = foodFactsService;
    }

    public BarcodeResponse identify(MultipartFile file) throws Exception {

        BufferedImage image =
                ImageIO.read(file.getInputStream());

        LuminanceSource source =
                new BufferedImageLuminanceSource(image);

        BinaryBitmap bitmap =
                new BinaryBitmap(
                        new HybridBinarizer(source));

        Result result =
                new MultiFormatReader().decode(bitmap);

        String barcode = result.getText();

        return foodFactsService.getFood(barcode);
    }
}
