// SgsEvaluacionPromptInputDTO.java
package cl.smid.sgs.dto;

import java.util.List;

public record SgsEvaluacionPromptInputDTO(
    List<CandidataDTO> candidatas,
    String textoPdfRespuesta
) {
    public record CandidataDTO(
        Long id,
        String nudoCritico,
        String descripcion,
        String tipoRecomendacion,
        String tiempo
    ) {}
}