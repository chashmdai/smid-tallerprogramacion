// SgsMatrizRepository.java
package cl.smid.sgs.repository;

import cl.smid.sgs.entity.SgsMatrizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SgsMatrizRepository extends JpaRepository<SgsMatrizEntity, Long> {

    List<SgsMatrizEntity> findByEstadoOrderByFechaIngresoDesc(String estado);

    List<SgsMatrizEntity> findByResponsableSeguimiento(String responsableSeguimiento);

    List<SgsMatrizEntity> findByInstitucionContainingIgnoreCase(String institucion);

    List<SgsMatrizEntity> findByRegionIgnoreCase(String region);

    List<SgsMatrizEntity> findByDimensionIgnoreCase(String dimension);

    SgsMatrizEntity findByNroOficio(String nroOficio);

    // Scope para evaluación: carga exactamente las filas candidatas enviadas por el frontend
    List<SgsMatrizEntity> findAllByIdIn(List<Long> ids);
}