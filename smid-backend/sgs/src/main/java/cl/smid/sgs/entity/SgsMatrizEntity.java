package cl.smid.sgs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "sgs_matriz_seguimiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SgsMatrizEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // GRUPO 1: DATOS EXTRAÍDOS POR IA (AUTOMÁTICO)
    // ==========================================
    @Column(name = "n_oficio", length = 100)
    private String nroOficio;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "residencia_centro", length = 255)
    private String residenciaCentro;

    @Column(name = "institucion", length = 255)
    private String institucion;

    @Column(name = "nivel", length = 100)
    private String nivel;

    @Column(name = "dimension", length = 150)
    private String dimension;

    @Column(name = "nudo_critico", columnDefinition = "TEXT")
    private String nudoCritico;

    @Column(name = "tipo_recomendacion", length = 200)
    private String tipoRecomendacion;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tiempo", length = 50)
    private String tiempo; 

    // ==========================================
    // GRUPO 2: DATOS DE GESTIÓN DE VISITAS (HUMANO)
    // ==========================================
    @Column(name = "profesional_responsable", length = 150)
    private String profesionalResponsable; 

    @Column(name = "acoge", length = 50)
    private String acoge; 

    @Column(name = "fase_seguimiento", length = 100)
    private String faseSeguimiento; 

    @Column(name = "responsable_seguimiento", length = 150)
    private String responsableSeguimiento; 

    @Column(name = "estado", length = 50)
    @Builder.Default
    private String estado = "PENDIENTE"; 

    @Column(name = "accion_recomendada", columnDefinition = "TEXT")
    private String accionRecomendada;

    @Column(name = "accion_recomendada_2", columnDefinition = "TEXT")
    private String accionRecomendada2;

    @Column(name = "otras_acciones_ddn", columnDefinition = "TEXT")
    private String otrasAccionesDdn;

    // ==========================================
    // GRUPO 3: EVALUACIÓN DE CUMPLIMIENTO (NUEVOS CAMPOS)
    // ==========================================
    @Column(name = "evaluacion_cumplimiento", length = 255)
    private String evaluacionCumplimiento;
    
    @Column(name = "correlativo", length = 50)
    private String correlativo;

    @Column(name = "gv", length = 50)
    private String gv;

    @Column(name = "verbo", length = 500)
    private String verbo;

    @Column(name = "materia", length = 500)
    private String materia;

    @Column(name = "categoria", length = 500)
    private String categoria;

    @Column(name = "tipo_seguimiento", length = 500)
    private String tipoSeguimiento;

    @Column(name = "fecha_seguimiento")
    private LocalDate fechaSeguimiento; // Usamos LocalDate para mantener orden cronológico real

    @Column(name = "otro_seguimiento_inst", length = 500)
    private String otroSeguimientoInstitucional;

    @Column(name = "fecha_respuesta")
    private LocalDate fechaRespuesta;

    @Column(name = "tipo_respuesta", length = 500)
    private String tipoRespuesta;

    @Column(name = "valoracion_rubrica", length = 500)
    private String valoracionRubrica;

    // ==========================================
    // METADATOS DEL SISTEMA
    // ==========================================
    @Column(name = "fecha_ingreso", updatable = false)
    @Builder.Default
    private LocalDate fechaIngreso = LocalDate.now();
    
    @PrePersist
    protected void onCreate() {
        if (this.fechaIngreso == null) {
            this.fechaIngreso = LocalDate.now();
        }
        if (this.estado == null) {
            this.estado = "PENDIENTE";
        }
    }
}