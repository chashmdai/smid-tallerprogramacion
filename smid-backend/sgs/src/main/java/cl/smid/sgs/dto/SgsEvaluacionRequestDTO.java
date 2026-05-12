// SgsEvaluacionRequestDTO.java
package cl.smid.sgs.dto;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public record SgsEvaluacionRequestDTO(
    MultipartFile pdfRespuesta,
    List<Long> idsMatriz
) {}