package cl.smid.auth.repository;

import cl.smid.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    // Busca un rol exacto por su nombre (ej. "ROLE_ADMIN")
    Optional<Role> findByName(String name);
}