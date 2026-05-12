package cl.smid.sgs.dto;

import org.springframework.web.multipart.MultipartFile;

/**
 * Captura el documento PDF subido por el analista en la vista inicial de SGS.
 */
public record SgsRequestDTO(
    MultipartFile documentoPdf
) {}