package cl.smid.sgs.dto;

/**
 * Captura todos los datos del formulario de la vista SGS 
 * cuando el usuario presiona "Guardar en Base de Datos".
 */
public record SgsSaveFormDTO(
    // Datos extraídos por IA (pueden venir modificados por el usuario si la IA se equivocó)
    String nroOficio,
    String region,
    String residenciaCentro,
    String institucion,
    String nivel,
    String dimension,
    String nudoCritico,
    String tipoRecomendacion,
    String descripcion,
    String tiempo,
    
    // Datos de gestión manual (La "Vuelta")
    String profesionalResponsable,
    String responsableSeguimiento,
    String acoge,
    String faseSeguimiento,
    String estado,
    String accionRecomendada,
    String accionRecomendada2,
    String otrasAccionesDdn
) {}