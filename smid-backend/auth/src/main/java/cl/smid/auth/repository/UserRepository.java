package cl.smid.auth.repository;

import cl.smid.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Método principal para el Login (Spring Security lo usará para cargar el usuario)
    Optional<User> findByRut(String rut);

    // Método secundario por si en el futuro habilitas recuperación de clave por correo
    Optional<User> findByEmail(String email);

    // Validaciones rápidas para evitar duplicados al registrar (devuelven true/false)
    boolean existsByRut(String rut);
    
    boolean existsByEmail(String email);
}