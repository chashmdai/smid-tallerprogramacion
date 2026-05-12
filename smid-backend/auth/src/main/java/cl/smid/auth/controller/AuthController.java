package cl.smid.auth.controller;

import cl.smid.auth.dto.JwtResponse;
import cl.smid.auth.dto.LoginRequest;
import cl.smid.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint público para iniciar sesión en la Intranet de la Defensoría.
     * POST /auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        
        // Llamamos a nuestro servicio que se encarga de todo el flujo
        JwtResponse response = authService.authenticateUser(loginRequest);
        
        // Devolvemos HTTP 200 OK junto con el DTO (Token + Datos del usuario)
        return ResponseEntity.ok(response);
    }
}