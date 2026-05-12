package cl.smid.auth.security;

import cl.smid.auth.entity.User;
import cl.smid.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    // Inyectamos nuestro repositorio gracias a @RequiredArgsConstructor de Lombok
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String rut) throws UsernameNotFoundException {
        
        // 1. Buscamos en NUESTRA base de datos usando el RUT
        User user = userRepository.findByRut(rut)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con RUT: " + rut));

        // 2. Traducimos NUESTROS roles a las autoridades de Spring Security
        var authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());

        // 3. Devolvemos el objeto User propio de Spring Security (usamos el full path para no confundirlo con nuestra entidad User)
        return new org.springframework.security.core.userdetails.User(
                user.getRut(),           // Spring lo tratará como el 'username'
                user.getPassword(),      // El hash BCrypt
                user.isEnabled(),        // Si está en false, Spring bloqueará el login automáticamente
                true,                    // accountNonExpired
                true,                    // credentialsNonExpired
                true,                    // accountNonLocked
                authorities              // Sus roles (ej. ROLE_ADMIN)
        );
    }
}