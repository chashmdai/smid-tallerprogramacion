package cl.smid.sgs.dto;

/**
 * Record inmutable que captura la extracción automatizada de la IA 
 * desde un Oficio PDF para inicializar la Matriz SGS.
 */
public record SgsExtractionDTO(
    String nroOficio,
    String region,
    String residenciaCentro,
    String institucion,
    String nivel,
    String dimension,
    String nudoCritico,
    String tipoRecomendacion,
    String descripcion,
    String tiempo
) {}