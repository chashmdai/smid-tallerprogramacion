// SgsEvaluacionGptService.java
package cl.smid.sgs.service;

import cl.smid.sgs.dto.SgsEvaluacionItemDTO;
import cl.smid.sgs.dto.SgsEvaluacionPromptInputDTO;
import cl.smid.sgs.dto.SgsEvaluacionResponseDTO;
import cl.smid.sgs.entity.SgsMatrizEntity;
import cl.smid.sgs.exception.SgsEvaluacionException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SgsEvaluacionGptService {

    private static final Logger log = LoggerFactory.getLogger(SgsEvaluacionGptService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String apiKey;

    // Rúbrica de valoración hardcodeada — si DDN cambia criterios, redeploy
    private static final String RUBRICA = """
        RÚBRICA DE VALORACIÓN (usa EXACTAMENTE uno de estos valores en 'valoracionRubrica'):
        - "Cumplimiento Total": El destinatario cumple totalmente con lo recomendado o solicitado.
        - "Cumplimiento Parcial Sustancial": Cumple con parte sustancial. Existen acciones avanzadas en miras al cumplimiento.
        - "Cumplimiento Parcial": Cumple con parte mínima. Existen acciones iniciales en miras al cumplimiento.
        - "Incumplimiento": No cumple. No se ha iniciado ningún tipo de acción o indica que no adoptará la recomendación.
        - "No hay información": No se cuenta con información suficiente para evaluar el cumplimiento.
        - "No aplica": La recomendación no aplica, por ende no se evalúa.
        
        TABLA DE PLAZOS DE REFERENCIA:
        - Urgente: dentro de 1 semana
        - Corto Plazo: dentro de 1 mes
        - Mediano plazo: dentro de 6 meses
        - Largo Plazo: dentro de 1 año
        """;

    public SgsEvaluacionGptService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().baseUrl("https://api.openai.com/v1").build();
    }

    /**
     * Punto de entrada principal.
     * Recibe el texto limpio del PDF de respuesta y las filas candidatas de la matriz.
     */
    public SgsEvaluacionResponseDTO evaluar(String textoPdfRespuesta, List<SgsMatrizEntity> candidatas) {
        log.info("Iniciando evaluación GPT para {} candidatas", candidatas.size());

        try {
            // 1. Construir el DTO de input para el prompt
            List<SgsEvaluacionPromptInputDTO.CandidataDTO> candidatasDto = candidatas.stream()
                .map(e -> new SgsEvaluacionPromptInputDTO.CandidataDTO(
                    e.getId(),
                    e.getNudoCritico(),
                    e.getDescripcion(),
                    e.getTipoRecomendacion(),
                    e.getTiempo()
                ))
                .collect(Collectors.toList());

            SgsEvaluacionPromptInputDTO promptInput = new SgsEvaluacionPromptInputDTO(
                candidatasDto,
                textoPdfRespuesta
            );

            // 2. Serializar y construir prompt final
            String datosSerializados = objectMapper.writeValueAsString(promptInput);
            String promptFinal = construirPrompt(datosSerializados);

            // 3. Llamar a GPT-5 vía /responses
            String rawJson = callOpenAi(promptFinal);

            // 4. Mapear respuesta a DTO de salida
            return mapearRespuesta(rawJson, candidatas);

        } catch (SgsEvaluacionException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error en motor de evaluación GPT: {}", e.getMessage(), e);
            throw new SgsEvaluacionException("Fallo en el motor de evaluación IA.", e);
        }
    }

    /**
     * Construcción del prompt maestro de evaluación.
     */
    private String construirPrompt(String datosSerializados) {
        StringBuilder sb = new StringBuilder();

        sb.append("ERES EL MOTOR ANALÍTICO DE EVALUACIÓN DE CUMPLIMIENTO DE LA DEFENSORÍA DE LA NIÑEZ DE CHILE.\n");
        sb.append("Tu tarea es cruzar las recomendaciones emitidas en un oficio con las respuestas entregadas por la institución fiscalizada.\n\n");

        sb.append(RUBRICA).append("\n");

        sb.append("PASOS DEL ANÁLISIS:\n");
        sb.append("1. LECTURA: Lee el campo 'textoPdfRespuesta' que contiene el oficio de respuesta institucional.\n");
        sb.append("2. MATCHING SEMÁNTICO: Para cada objeto en 'candidatas', identifica qué sección del PDF de respuesta aborda esa recomendación. El match es semántico, NO por número.\n");
        sb.append("3. EXTRACCIÓN: De la sección matcheada, extrae: verbo principal de la acción comprometida, materia, categoría temática, tipo de seguimiento (Formal/Informal), fechas relevantes, tipo de respuesta (ej: Plan de Acción, Informe, Sin respuesta), y si existe otro seguimiento institucional (gv).\n");
        sb.append("4. VALORACIÓN: Aplica la rúbrica para asignar 'valoracionRubrica' y 'evaluacionCumplimiento' considerando el plazo original ('tiempo') de la recomendación.\n");
        sb.append("5. CONFIANZA: Asigna 'confianzaMatch' (0.0 a 1.0) según qué tan clara es la correspondencia semántica. Si la correspondencia es ambigua, baja la confianza.\n");
        sb.append("6. SIN MATCH: Si una candidata no tiene correspondencia clara en el PDF, agrégala en 'sinMatch'.\n\n");

        sb.append("INSTRUCCIÓN CRÍTICA DE FORMATO:\n");
        sb.append("Devuelve ÚNICA Y EXCLUSIVAMENTE un JSON válido con esta estructura:\n");
        sb.append("""
            {
              "evaluadas": [
                {
                  "id": 0,
                  "confianzaMatch": 0.0,
                  "razonamiento": "string corto explicando el match y la valoración",
                  "evaluacionCumplimiento": "string",
                  "correlativo": "string",
                  "gv": "string",
                  "verbo": "string",
                  "materia": "string",
                  "categoria": "string",
                  "tipoSeguimiento": "string",
                  "fechaSeguimiento": "YYYY-MM-DD o null",
                  "otroSeguimientoInstitucional": "string",
                  "fechaRespuesta": "YYYY-MM-DD o null",
                  "tipoRespuesta": "string",
                  "valoracionRubrica": "string (usa exactamente uno de los valores de la rúbrica)"
                }
              ],
              "sinMatch": [0]
            }
            """);

        sb.append("DATOS A EVALUAR:\n");
        sb.append(datosSerializados);

        return sb.toString();
    }

    /**
     * Llamada HTTP a OpenAI Responses API con gpt-5.
     */
    @SuppressWarnings("null")
    private String callOpenAi(String input) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", "gpt-5");
            payload.put("input", input);
            payload.put("reasoning", Map.of("effort", "high"));
            payload.put("text", Map.of(
                "verbosity", "low",
                "format", Map.of("type", "json_object")
            ));

            String rawResponse = restClient.post()
                .uri("/responses")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);

            JsonNode rootNode = objectMapper.readTree(rawResponse);
            String jsonOutput = "";

            for (JsonNode node : rootNode.path("output")) {
                if ("message".equals(node.path("type").asText())) {
                    jsonOutput = node.path("content").get(0).path("text").asText();
                    break;
                }
            }

            if (jsonOutput.isBlank()) {
                throw new SgsEvaluacionException("GPT no retornó contenido en el bloque 'message'.");
            }

            return jsonOutput;

        } catch (SgsEvaluacionException e) {
            throw e;
        } catch (Exception e) {
            throw new SgsEvaluacionException("Fallo en la llamada al motor GPT-5: " + e.getMessage(), e);
        }
    }

    /**
     * Mapea el JSON crudo de GPT a SgsEvaluacionResponseDTO.
     * Valida que los IDs devueltos por GPT existan en el set de candidatas reales.
     */
    private SgsEvaluacionResponseDTO mapearRespuesta(String rawJson, List<SgsMatrizEntity> candidatas) {
        try {
            Set<Long> idsValidos = candidatas.stream()
                .map(SgsMatrizEntity::getId)
                .collect(Collectors.toSet());

            JsonNode root = objectMapper.readTree(rawJson);
            List<SgsEvaluacionItemDTO> evaluadas = new ArrayList<>();
            List<Long> sinMatch = new ArrayList<>();

            // Mapear evaluadas
            for (JsonNode node : root.path("evaluadas")) {
                Long id = node.path("id").asLong();

                // Defensa contra hallucination de IDs
                if (!idsValidos.contains(id)) {
                    log.warn("GPT retornó ID {} que no existe en candidatas. Descartado.", id);
                    continue;
                }

                LocalDate fechaSeguimiento = parseFecha(node.path("fechaSeguimiento").asText(null));
                LocalDate fechaRespuesta = parseFecha(node.path("fechaRespuesta").asText(null));

                evaluadas.add(new SgsEvaluacionItemDTO(
                    id,
                    node.path("confianzaMatch").asDouble(),
                    node.path("razonamiento").asText(),
                    node.path("evaluacionCumplimiento").asText(null),
                    node.path("correlativo").asText(null),
                    node.path("gv").asText(null),
                    node.path("verbo").asText(null),
                    node.path("materia").asText(null),
                    node.path("categoria").asText(null),
                    node.path("tipoSeguimiento").asText(null),
                    fechaSeguimiento,
                    node.path("otroSeguimientoInstitucional").asText(null),
                    fechaRespuesta,
                    node.path("tipoRespuesta").asText(null),
                    node.path("valoracionRubrica").asText(null)
                ));
            }

            // Mapear sinMatch
            for (JsonNode node : root.path("sinMatch")) {
                Long id = node.asLong();
                if (idsValidos.contains(id)) {
                    sinMatch.add(id);
                }
            }

            return new SgsEvaluacionResponseDTO(evaluadas, sinMatch);

        } catch (SgsEvaluacionException e) {
            throw e;
        } catch (Exception e) {
            throw new SgsEvaluacionException("Error al parsear respuesta de GPT: " + e.getMessage(), e);
        }
    }

    /**
     * Parseo seguro de fecha. GPT puede devolver null, "null", o formato YYYY-MM-DD.
     */
    private LocalDate parseFecha(String valor) {
        if (valor == null || valor.isBlank() || "null".equalsIgnoreCase(valor)) return null;
        try {
            return LocalDate.parse(valor);
        } catch (Exception e) {
            log.warn("No se pudo parsear fecha '{}', se asigna null.", valor);
            return null;
        }
    }
}