// SgsEvaluacionResponseDTO.java
package cl.smid.sgs.dto;

import java.util.List;

public record SgsEvaluacionResponseDTO(
    List<SgsEvaluacionItemDTO> evaluadas,
    List<Long> sinMatch
) {}