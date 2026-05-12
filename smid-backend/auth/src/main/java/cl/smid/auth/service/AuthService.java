package cl.smid.auth.service;

import cl.smid.auth.dto.JwtResponse;
import cl.smid.auth.dto.LoginRequest;
import cl.smid.auth.entity.User;
import cl.smid.auth.repository.UserRepository;
import cl.smid.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    /**
     * Procesa la solicitud de login, valida credenciales y retorna el JWT con datos extra.
     */
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        
        // 1. Delega a Spring Security la validación (va a la BD, hashea y compara)
        // Si la clave es incorrecta, esto lanzará automáticamente una BadCredentialsException
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getRut(),
                        loginRequest.getPassword()
                )
        );

        // 2. Registra la autenticación en el contexto actual del hilo virtual
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Fabrica el string criptográfico del JWT
        String jwt = tokenProvider.generateToken(authentication);

        // 4. Vamos a buscar al usuario para armar una respuesta enriquecida
        // (Esto evita que el frontend tenga que decodificar el JWT a mano)
        User user = userRepository.findByRut(loginRequest.getRut())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado en la base de datos"));

        // 5. Extraemos los nombres de los roles (ej: "ROLE_ADMIN", "ROLE_ABOGADO")
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toList());

        String fullName = user.getFirstName() + " " + user.getLastName();

        // 6. Construimos el DTO de respuesta y se lo entregamos al controlador
        return JwtResponse.builder()
                .token(jwt)
                .rut(user.getRut())
                .fullName(fullName)
                .roles(roles)
                .build();
    }
}