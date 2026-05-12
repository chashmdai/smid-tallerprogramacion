// SgsController.java
package cl.smid.sgs.controller;

import cl.smid.sgs.dto.SgsEvaluacionItemDTO;
import cl.smid.sgs.dto.SgsEvaluacionResponseDTO;
import cl.smid.sgs.dto.SgsExtractionDTO;
import cl.smid.sgs.dto.SgsSaveFormDTO;
import cl.smid.sgs.entity.SgsMatrizEntity;
import cl.smid.sgs.exception.SgsEvaluacionException;
import cl.smid.sgs.repository.SgsMatrizRepository;
import cl.smid.sgs.service.SgsExcelExportService;
import cl.smid.sgs.service.SgsService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("")
public class SgsController {

    private final SgsService sgsService;
    private final SgsMatrizRepository sgsMatrizRepository;
    private final SgsExcelExportService excelExportService;

    public SgsController(SgsService sgsService,
                         SgsMatrizRepository sgsMatrizRepository,
                         SgsExcelExportService excelExportService) {
        this.sgsService = sgsService;
        this.sgsMatrizRepository = sgsMatrizRepository;
        this.excelExportService = excelExportService;
    }

    // ==========================================
    // 1. LISTAR PARA EL DASHBOARD (React)
    // ==========================================
    @GetMapping("/")
    public ResponseEntity<List<SgsMatrizEntity>> listarDashboard() {
        return ResponseEntity.ok(sgsMatrizRepository.findAll());
    }

    // ==========================================
    // 2. INGESTA DE PDF INICIAL (IA)
    // ==========================================
    @PostMapping(value = "/procesar-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SgsExtractionDTO> procesarPdf(@RequestParam("file") MultipartFile file) {
        SgsExtractionDTO extraccion = sgsService.procesarOficioPdf(file);
        return ResponseEntity.ok(extraccion);
    }

    // ==========================================
    // 3. GUARDAR NUEVO REGISTRO
    // ==========================================
    @PostMapping("/guardar")
    public ResponseEntity<?> guardarNuevoOficio(
            @RequestBody SgsSaveFormDTO nuevaMatriz,
            JwtAuthenticationToken auth) {
        try {
            String rutAnalista = auth.getName();
            sgsService.guardarMatriz(nuevaMatriz);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("{\"mensaje\": \"Oficio ingresado correctamente a la matriz.\"}");

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // ==========================================
    // 4. ACTUALIZAR GESTIÓN (La "Vuelta")
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarGestion(
            @PathVariable Long id,
            @RequestBody SgsSaveFormDTO matrizActualizada,
            JwtAuthenticationToken auth) {

        try {
            sgsService.actualizarMatriz(id, matrizActualizada);

            return ResponseEntity.ok()
                    .body("{\"mensaje\": \"Gestión actualizada correctamente.\"}");

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // ==========================================
    // 5. EXPORTACIÓN A EXCEL
    // ==========================================
    @GetMapping("/exportar-excel")
    public ResponseEntity<InputStreamResource> exportarExcel() {

        List<SgsMatrizEntity> oficios = sgsMatrizRepository.findAll();

        ByteArrayInputStream in = excelExportService.exportarMatrizSgs(oficios);

        HttpHeaders headers = new HttpHeaders();

        headers.add("Access-Control-Expose-Headers", "Content-Disposition");

        headers.add(
                "Content-Disposition",
                "attachment; filename=Matriz_SGS_Export.xlsx"
        );

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // ==========================================
    // 6. PROCESAR OFICIO DE RESPUESTA (IA — Sin persistencia)
    // ==========================================
    @PostMapping(value = "/procesar-respuesta", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> procesarRespuesta(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ids") List<Long> ids,
            JwtAuthenticationToken auth) {

        try {

            SgsEvaluacionResponseDTO resultado =
                    sgsService.procesarOficioRespuesta(file, ids);

            return ResponseEntity.ok(resultado);

        } catch (SgsEvaluacionException e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error interno al procesar el oficio de respuesta.\"}");
        }
    }

    // ==========================================
    // 7. APLICAR EVALUACIÓN MASIVA
    // ==========================================
    @PutMapping("/evaluacion-masiva")
    public ResponseEntity<?> aplicarEvaluacionMasiva(
            @RequestBody List<SgsEvaluacionItemDTO> evaluadas,
            JwtAuthenticationToken auth) {

        try {

            sgsService.aplicarEvaluacionMasiva(evaluadas);

            return ResponseEntity.ok()
                    .body("{\"mensaje\": \"Evaluación de cumplimiento aplicada correctamente.\"}");

        } catch (SgsEvaluacionException e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error interno al aplicar la evaluación masiva.\"}");
        }
    }
}