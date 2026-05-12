// SgsService.java
package cl.smid.sgs.service;

import cl.smid.sgs.dto.SgsEvaluacionItemDTO;
import cl.smid.sgs.dto.SgsEvaluacionResponseDTO;
import cl.smid.sgs.dto.SgsExtractionDTO;
import cl.smid.sgs.dto.SgsSaveFormDTO;
import cl.smid.sgs.entity.SgsMatrizEntity;
import cl.smid.sgs.exception.SgsEvaluacionException;
import cl.smid.sgs.repository.SgsMatrizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SgsService {

    private final PdfExtractionService pdfExtractionService;
    private final SgsGptAnalysisService sgsGptAnalysisService;
    private final SgsEvaluacionGptService sgsEvaluacionGptService;
    private final SgsMatrizRepository sgsMatrizRepository;

    private static final int MAX_CANDIDATAS = 50;

    public SgsService(PdfExtractionService pdfExtractionService,
                      SgsGptAnalysisService sgsGptAnalysisService,
                      SgsEvaluacionGptService sgsEvaluacionGptService,
                      SgsMatrizRepository sgsMatrizRepository) {
        this.pdfExtractionService = pdfExtractionService;
        this.sgsGptAnalysisService = sgsGptAnalysisService;
        this.sgsEvaluacionGptService = sgsEvaluacionGptService;
        this.sgsMatrizRepository = sgsMatrizRepository;
    }

    // ==========================================
    // FLUJOS EXISTENTES — SIN CAMBIOS
    // ==========================================

    public SgsExtractionDTO procesarOficioPdf(MultipartFile archivoPdf) {
        String textoLimpio = pdfExtractionService.extractText(archivoPdf);
        return sgsGptAnalysisService.extraerDatos(textoLimpio);
    }

    @Transactional
    public SgsMatrizEntity guardarMatriz(SgsSaveFormDTO dto) {
        SgsMatrizEntity nuevaMatriz = new SgsMatrizEntity();

        nuevaMatriz.setNroOficio(dto.nroOficio());
        nuevaMatriz.setRegion(dto.region());
        nuevaMatriz.setResidenciaCentro(dto.residenciaCentro());
        nuevaMatriz.setInstitucion(dto.institucion());
        nuevaMatriz.setNivel(dto.nivel());
        nuevaMatriz.setDimension(dto.dimension());
        nuevaMatriz.setNudoCritico(dto.nudoCritico());
        nuevaMatriz.setTipoRecomendacion(dto.tipoRecomendacion());
        nuevaMatriz.setDescripcion(dto.descripcion());
        nuevaMatriz.setTiempo(dto.tiempo());
        nuevaMatriz.setEstado("PENDIENTE");

        return sgsMatrizRepository.save(nuevaMatriz);
    }

    @Transactional
    public SgsMatrizEntity actualizarMatriz(Long id, SgsSaveFormDTO dto) {
        SgsMatrizEntity matrizExistente = sgsMatrizRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró el registro SGS con ID: " + id));

        matrizExistente.setNroOficio(dto.nroOficio());
        matrizExistente.setRegion(dto.region());
        matrizExistente.setResidenciaCentro(dto.residenciaCentro());
        matrizExistente.setInstitucion(dto.institucion());
        matrizExistente.setNivel(dto.nivel());
        matrizExistente.setDimension(dto.dimension());
        matrizExistente.setNudoCritico(dto.nudoCritico());
        matrizExistente.setTipoRecomendacion(dto.tipoRecomendacion());
        matrizExistente.setDescripcion(dto.descripcion());
        matrizExistente.setTiempo(dto.tiempo());

        matrizExistente.setProfesionalResponsable(dto.profesionalResponsable());
        matrizExistente.setResponsableSeguimiento(dto.responsableSeguimiento());
        matrizExistente.setAcoge(dto.acoge());
        matrizExistente.setFaseSeguimiento(dto.faseSeguimiento());
        matrizExistente.setEstado(dto.estado());
        matrizExistente.setAccionRecomendada(dto.accionRecomendada());
        matrizExistente.setAccionRecomendada2(dto.accionRecomendada2());
        matrizExistente.setOtrasAccionesDdn(dto.otrasAccionesDdn());

        return sgsMatrizRepository.save(matrizExistente);
    }

    // ==========================================
    // NUEVOS FLUJOS — EVALUACIÓN DE CUMPLIMIENTO
    // ==========================================

    /**
     * FASE 4: PROCESAMIENTO DE OFICIO DE RESPUESTA (Sin persistencia)
     * Extrae texto del PDF de respuesta institucional, carga las candidatas
     * y delega en el motor GPT de evaluación. Retorna el resultado para
     * revisión del analista antes de persistir.
     */
    public SgsEvaluacionResponseDTO procesarOficioRespuesta(MultipartFile pdfRespuesta, List<Long> idsMatriz) {
        if (idsMatriz == null || idsMatriz.isEmpty()) {
            throw new SgsEvaluacionException("Se requiere al menos un ID de matriz para evaluar.");
        }
        if (idsMatriz.size() > MAX_CANDIDATAS) {
            throw new SgsEvaluacionException(
                "El scope supera el límite de " + MAX_CANDIDATAS + " candidatas. Filtra por oficio específico."
            );
        }

        // 1. Extraer texto del PDF de respuesta — reusa PdfExtractionService existente
        String textoRespuesta = pdfExtractionService.extractText(pdfRespuesta);

        // 2. Cargar candidatas desde BD, validando que los IDs existan
        List<SgsMatrizEntity> candidatas = sgsMatrizRepository.findAllByIdIn(idsMatriz);
        if (candidatas.isEmpty()) {
            throw new SgsEvaluacionException("Ningún ID de matriz encontrado en base de datos.");
        }

        // 3. Delegar al motor GPT de evaluación
        return sgsEvaluacionGptService.evaluar(textoRespuesta, candidatas);
    }

    /**
     * FASE 5: PERSISTENCIA DE EVALUACIÓN MASIVA
     * Recibe la lista revisada/aprobada por el analista y aplica
     * los campos del Bloque 3 sobre cada fila correspondiente.
     */
    @Transactional
    public void aplicarEvaluacionMasiva(List<SgsEvaluacionItemDTO> evaluadas) {
        if (evaluadas == null || evaluadas.isEmpty()) {
            throw new SgsEvaluacionException("La lista de evaluaciones no puede estar vacía.");
        }

        for (SgsEvaluacionItemDTO item : evaluadas) {
            SgsMatrizEntity matriz = sgsMatrizRepository.findById(item.id())
                .orElseThrow(() -> new SgsEvaluacionException(
                    "No se encontró registro con ID: " + item.id() + " al aplicar evaluación masiva."
                ));

            // Bloque 3 — campos de evaluación de cumplimiento
            matriz.setEvaluacionCumplimiento(item.evaluacionCumplimiento());
            matriz.setCorrelativo(item.correlativo());
            matriz.setGv(item.gv());
            matriz.setVerbo(item.verbo());
            matriz.setMateria(item.materia());
            matriz.setCategoria(item.categoria());
            matriz.setTipoSeguimiento(item.tipoSeguimiento());
            matriz.setFechaSeguimiento(item.fechaSeguimiento());
            matriz.setOtroSeguimientoInstitucional(item.otroSeguimientoInstitucional());
            matriz.setFechaRespuesta(item.fechaRespuesta());
            matriz.setTipoRespuesta(item.tipoRespuesta());
            matriz.setValoracionRubrica(item.valoracionRubrica());

            sgsMatrizRepository.save(matriz);
        }
    }
}