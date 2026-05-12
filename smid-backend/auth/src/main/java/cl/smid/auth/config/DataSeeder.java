package cl.smid.auth.config;

import cl.smid.auth.entity.Role;
import cl.smid.auth.entity.User;
import cl.smid.auth.repository.RoleRepository;
import cl.smid.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Inyectar Roles si no existen y guardarlos en variables para asignarlos
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
            log.info("Creando rol ROLE_ADMIN...");
            return roleRepository.save(Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrador de sistemas TI")
                    .build());
        });

        Role abogadoRole = roleRepository.findByName("ROLE_ABOGADO").orElseGet(() -> {
            log.info("Creando rol ROLE_ABOGADO...");
            return roleRepository.save(Role.builder()
                    .name("ROLE_ABOGADO")
                    .description("Abogado de la Defensoría")
                    .build());
        });

        Role analistaRole = roleRepository.findByName("ROLE_ANALISTA").orElseGet(() -> {
            log.info("Creando rol ROLE_ANALISTA...");
            return roleRepository.save(Role.builder()
                    .name("ROLE_ANALISTA")
                    .description("Analista (Lectura/Escritura limitada)")
                    .build());
        });

        // Hash común para la clave "1234"
        String commonPasswordHash = "$2b$12$tgTdJ6AgbfmkNlMdobRos.tWD8GmWKEu7GBEryTCzt6.PigTxAIVi";

        // 2. Inyectar Usuario Administrador
        String adminRut = "12345678-9";
        if (!userRepository.existsByRut(adminRut)) {
            log.info("Inyectando usuario administrador...");
            userRepository.save(User.builder()
                    .rut(adminRut)
                    .email("admin@defensoria.cl")
                    .password(commonPasswordHash)
                    .firstName("Admin")
                    .lastName("Sistema")
                    .enabled(true)
                    .roles(new HashSet<>(List.of(adminRole)))
                    .build());
            log.info("Usuario administrador inyectado. RUT: {} | Pass: 1234", adminRut);
        }

        // 3. Inyectar Usuario Abogado
        String abogadoRut = "98765432-1";
        if (!userRepository.existsByRut(abogadoRut)) {
            log.info("Inyectando usuario abogado...");
            userRepository.save(User.builder()
                    .rut(abogadoRut)
                    .email("abogado@defensoria.cl")
                    .password(commonPasswordHash)
                    .firstName("Juan")
                    .lastName("Pérez")
                    .enabled(true)
                    .roles(new HashSet<>(List.of(abogadoRole)))
                    .build());
            log.info("Usuario abogado inyectado. RUT: {} | Pass: 1234", abogadoRut);
        }

        // 4. Inyectar Usuario Analista
        String analistaRut = "11111111-1";
        if (!userRepository.existsByRut(analistaRut)) {
            log.info("Inyectando usuario analista...");
            userRepository.save(User.builder()
                    .rut(analistaRut)
                    .email("analista@defensoria.cl")
                    .password(commonPasswordHash)
                    .firstName("María")
                    .lastName("Gómez")
                    .enabled(true)
                    .roles(new HashSet<>(List.of(analistaRole)))
                    .build());
            log.info("Usuario analista inyectado. RUT: {} | Pass: 1234", analistaRut);
        }
    }
}