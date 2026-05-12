package cl.smid.sgs.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class PdfExtractionService {

    /**
     * Extrae y normaliza el contenido de un PDF para ser procesado por la IA.
     */
    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No se detectó el archivo del Oficio.");
        }

        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            
            // Extraemos el texto crudo
            String rawText = stripper.getText(document);
            
            return sanitizeText(rawText);

        } catch (IOException e) {
            throw new RuntimeException("Error crítico en la lectura del PDF institucional: " + e.getMessage(), e);
        }
    }

    /**
     * Sanea el texto para que la Responses API de GPT-5 no procese ruido.
     */
    private String sanitizeText(String text) {
        if (text == null || text.isBlank()) return "";

        return text.trim()
            // Reemplaza múltiples saltos de línea por uno solo para mantener estructura
            .replaceAll("(\\r?\\n){2,}", "\n")
            // Reemplaza múltiples espacios por uno solo (ahorro de tokens) 
            .replaceAll(" +", " ")
            // Elimina caracteres de control o no imprimibles que rompen JSONs
            .replaceAll("[\\p{Cntrl}&&[^\\n\\t\\r]]", "");
    }
}