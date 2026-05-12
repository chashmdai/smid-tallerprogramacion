package cl.smid.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El RUT es obligatorio para iniciar sesión")
    private String rut;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}