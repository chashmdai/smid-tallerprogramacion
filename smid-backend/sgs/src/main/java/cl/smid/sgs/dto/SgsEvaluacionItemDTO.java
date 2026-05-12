// SgsEvaluacionItemDTO.java
package cl.smid.sgs.dto;

import java.time.LocalDate;

public record SgsEvaluacionItemDTO(
    Long id,
    Double confianzaMatch,
    String razonamiento,

    // Bloque 3 — los 12 campos del entity
    String evaluacionCumplimiento,
    String correlativo,
    String gv,
    String verbo,
    String materia,
    String categoria,
    String tipoSeguimiento,
    LocalDate fechaSeguimiento,
    String otroSeguimientoInstitucional,
    LocalDate fechaRespuesta,
    String tipoRespuesta,
    String valoracionRubrica
) {}