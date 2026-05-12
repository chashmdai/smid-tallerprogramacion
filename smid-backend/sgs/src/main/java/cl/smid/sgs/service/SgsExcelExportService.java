package cl.smid.sgs.service;

import cl.smid.sgs.entity.SgsMatrizEntity;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class SgsExcelExportService {

    public ByteArrayInputStream exportarMatrizSgs(List<SgsMatrizEntity> oficios) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Matriz Seguimiento SGS");

            // Estilo para la cabecera (Negrita y fondo gris)
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Definimos las columnas (La sábana completa unificada)
            String[] HEADERS = {
                "N° Oficio", "Región", "Residencia/Centro", "Institución", "Nivel", 
                "Dimensión", "Nudo Crítico", "Tipo Recomendación", "Descripción", "Tiempo Plazo", 
                "Fase Seguimiento", "Profesional Responsable", "Responsable Seguimiento", 
                "Acción Recomendada", "Otras Acciones DDN", "Evaluación Cumplimiento",
                "Correlativo", "GV", "Verbo", "Materia", "Categoría", "Tipo Seguimiento", 
                "Fecha Seguimiento", "Otro Seguim. Inst.", "Fecha Respuesta", "Tipo Respuesta", "Valoración Rúbrica", "Estado Final"
            };

            // Crear Fila de Cabeceras
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < HEADERS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(HEADERS[col]);
                cell.setCellStyle(headerStyle);
            }

            // Poblar los datos
            int rowIdx = 1;
            for (SgsMatrizEntity oficio : oficios) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(oficio.getNroOficio() != null ? oficio.getNroOficio() : "");
                row.createCell(1).setCellValue(oficio.getRegion() != null ? oficio.getRegion() : "");
                row.createCell(2).setCellValue(oficio.getResidenciaCentro() != null ? oficio.getResidenciaCentro() : "");
                row.createCell(3).setCellValue(oficio.getInstitucion() != null ? oficio.getInstitucion() : "");
                row.createCell(4).setCellValue(oficio.getNivel() != null ? oficio.getNivel() : "");
                row.createCell(5).setCellValue(oficio.getDimension() != null ? oficio.getDimension() : "");
                row.createCell(6).setCellValue(oficio.getNudoCritico() != null ? oficio.getNudoCritico() : "");
                row.createCell(7).setCellValue(oficio.getTipoRecomendacion() != null ? oficio.getTipoRecomendacion() : "");
                row.createCell(8).setCellValue(oficio.getDescripcion() != null ? oficio.getDescripcion() : "");
                row.createCell(9).setCellValue(oficio.getTiempo() != null ? oficio.getTiempo() : "");
                row.createCell(10).setCellValue(oficio.getFaseSeguimiento() != null ? oficio.getFaseSeguimiento() : "");
                row.createCell(11).setCellValue(oficio.getProfesionalResponsable() != null ? oficio.getProfesionalResponsable() : "");
                row.createCell(12).setCellValue(oficio.getResponsableSeguimiento() != null ? oficio.getResponsableSeguimiento() : "");
                row.createCell(13).setCellValue(oficio.getAccionRecomendada() != null ? oficio.getAccionRecomendada() : "");
                row.createCell(14).setCellValue(oficio.getOtrasAccionesDdn() != null ? oficio.getOtrasAccionesDdn() : "");
                row.createCell(15).setCellValue(oficio.getEvaluacionCumplimiento() != null ? oficio.getEvaluacionCumplimiento() : "");
                row.createCell(16).setCellValue(oficio.getCorrelativo() != null ? oficio.getCorrelativo() : "");
                row.createCell(17).setCellValue(oficio.getGv() != null ? oficio.getGv() : "");
                row.createCell(18).setCellValue(oficio.getVerbo() != null ? oficio.getVerbo() : "");
                row.createCell(19).setCellValue(oficio.getMateria() != null ? oficio.getMateria() : "");
                row.createCell(20).setCellValue(oficio.getCategoria() != null ? oficio.getCategoria() : "");
                row.createCell(21).setCellValue(oficio.getTipoSeguimiento() != null ? oficio.getTipoSeguimiento() : "");
                row.createCell(22).setCellValue(oficio.getFechaSeguimiento() != null ? oficio.getFechaSeguimiento().toString() : "");
                row.createCell(23).setCellValue(oficio.getOtroSeguimientoInstitucional() != null ? oficio.getOtroSeguimientoInstitucional() : "");
                row.createCell(24).setCellValue(oficio.getFechaRespuesta() != null ? oficio.getFechaRespuesta().toString() : "");
                row.createCell(25).setCellValue(oficio.getTipoRespuesta() != null ? oficio.getTipoRespuesta() : "");
                row.createCell(26).setCellValue(oficio.getValoracionRubrica() != null ? oficio.getValoracionRubrica() : "");
                row.createCell(27).setCellValue(oficio.getEstado() != null ? oficio.getEstado() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
            
        } catch (IOException e) {
            throw new RuntimeException("Error al generar el archivo Excel de SGS: " + e.getMessage());
        }
    }
}