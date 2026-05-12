package cl.smid.apigateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            // 1. Deshabilitar CSRF para APIs stateless con JWT
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            
            // 2. Aplicar configuración CORS explícita
            .cors(Customizer.withDefaults())
            
            // 3. Reglas de Autorización de Rutas
            .authorizeExchange(exchanges -> exchanges
                // Permitir pre-flight OPTIONS siempre y sin restricciones
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Tráfico público (Login y Actuator)
                .pathMatchers("/api/auth/**", "/api/actuator/**").permitAll()
                
                // Tráfico protegido: Cualquier otra ruta requiere JWT válido
                .anyExchange().authenticated()
            )

            // 4. Manejo de excepciones personalizado para el 401
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint((exchange, e) -> {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                    String body = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Token inválido o ausente en API Gateway\"}";
                    DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
                    return exchange.getResponse().writeWith(Mono.just(buffer));
                })
            )
            
            // 5. Servidor de recursos configurado para validar JWT
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            )
            .build();
    }

    /**
     * Bean para decodificación simétrica de tokens.
     * Obliga explícitamente a usar el algoritmo HmacSHA256 (HS256).
     */
    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        SecretKeySpec secretKey = new SecretKeySpec(
                jwtSecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256" 
        );
        
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey).build();
    }

    /**
     * Configuración CORS para permitir la comunicación segura con React.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); 
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}