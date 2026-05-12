package cl.smid.sgs.service;

import cl.smid.sgs.dto.SgsExtractionDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class SgsGptAnalysisService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    
    @Value("${openai.api.key}")
    private String apiKey;

    public SgsGptAnalysisService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        // Instanciamos un cliente REST propio para este servicio
        this.restClient = RestClient.builder().baseUrl("https://api.openai.com/v1").build();
    }

    /**
     * Analiza el PDF limpio y extrae las 10 columnas automáticas para la Matriz SGS.
     */
    public SgsExtractionDTO extraerDatos(String textoPdfClean) {
        String prompt = construirPromptSgs(textoPdfClean);
        
        // Configuramos el payload (Hardcodeado a medium/low porque no necesitamos que el usuario lo elija)
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", "gpt-4o-mini"); // o el modelo que estés usando
        payload.put("messages", new Object[]{
            Map.of("role", "system", "content", prompt)
        });
        payload.put("temperature", 0.1); // Temperatura baja para que sea muy preciso y no alucine
        payload.put("response_format", Map.of("type", "json_object"));

        try {
            // Ejecutamos la llamada HTTP a OpenAI
            String rawResponse = restClient.post()
                    .uri("/chat/completions") // Ajusta el endpoint según tu API exacta
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            // Parseamos la respuesta
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            String jsonOutput = rootNode.path("choices").get(0).path("message").path("content").asText();

            // Mapeamos el JSON estricto a nuestro nuevo Record DTO
            return objectMapper.readValue(jsonOutput, SgsExtractionDTO.class);

        } catch (Exception e) {
            throw new RuntimeException("Fallo crítico en Motor GPT-SGS: " + e.getMessage(), e);
        }
    }

    /**
     * El Prompt Maestro con JSON Schema constraint.
     */
    private String construirPromptSgs(String textoPdfClean) {
        return """
            ERES EL MOTOR ANALÍTICO "SGS" DE LA DEFENSORÍA DE LA NIÑEZ DE CHILE.
            Tu objetivo es leer Oficios institucionales y extraer variables críticas para inicializar una Matriz de Seguimiento.
            
            REGLAS DE EXTRACCIÓN (Extrae solo lo explícito o inferible con alta certeza, si no existe usa null):
            1. nroOficio: Número o identificador del oficio (ej. "OFICIO N° 421/2019").
            2. region: Región de Chile a la que pertenece la residencia o el problema.
            3. residenciaCentro: Nombre exacto de la residencia, centro o lugar afectado.
            4. institucion: Institución garante a la que se dirige el oficio (ej. "SENAME", "Ministerio Público").
            5. nivel: Nivel territorial o jerárquico de la institución (ej. "Nacional", "Regional", "Local").
            6. dimension: Categoriza el tema principal (ej. "Salud", "Protección", "Infraestructura", "Educación").
            7. nudoCritico: Resume en un párrafo corto la vulneración o problema detectado.
            8. tipoRecomendacion: Clasifica la solicitud (ej. "Solicitud de Información", "Intervención Urgente").
            9. descripcion: Extrae y resume la exigencia o recomendación exacta que hace la Defensoría a la institución.
            10. tiempo: Extrae el plazo otorgado en días (ej. "7 días", "15 días hábiles").

            INSTRUCCIÓN CRÍTICA DE FORMATO:
            Debes devolver ÚNICA Y EXCLUSIVAMENTE un objeto JSON válido. 
            El JSON debe cumplir estrictamente esta estructura de claves:
            {
              "nroOficio": "string",
              "region": "string",
              "residenciaCentro": "string",
              "institucion": "string",
              "nivel": "string",
              "dimension": "string",
              "nudoCritico": "string",
              "tipoRecomendacion": "string",
              "descripcion": "string",
              "tiempo": "string"
            }
            
            DOCUMENTO A ANALIZAR:
            """ + textoPdfClean;
    }
}