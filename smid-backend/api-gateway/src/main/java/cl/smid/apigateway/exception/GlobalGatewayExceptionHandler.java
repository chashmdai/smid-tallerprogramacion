package cl.smid.apigateway.exception;

import cl.smid.apigateway.dto.GatewayErrorResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Component
@Order(-1) // El -1 le dice a Spring que use esta clase antes que su manejador de errores por defecto HTML
public class GlobalGatewayExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    public GlobalGatewayExceptionHandler() {
        this.objectMapper = new ObjectMapper();
        // Registramos el módulo de Java Time para que Jackson sepa serializar el LocalDateTime
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    @NonNull
    public Mono<Void> handle(@NonNull ServerWebExchange exchange, @NonNull Throwable ex) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String message = "Error interno del API Gateway";

        // Determinar el código HTTP exacto basado en la excepción
        if (ex instanceof ResponseStatusException responseStatusException) {
            status = HttpStatus.valueOf(responseStatusException.getStatusCode().value());
            message = responseStatusException.getReason() != null ? 
                      responseStatusException.getReason() : status.getReasonPhrase();
        } else if (ex instanceof java.net.ConnectException || ex.getMessage().contains("Connection refused")) {
            // Este es el caso clave: El microservicio (ej. SIGER) está apagado o reiniciándose
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "El microservicio de destino no está disponible temporalmente. Por favor, reintente.";
        }

        // Construir nuestro DTO estandarizado
        GatewayErrorResponse errorResponse = GatewayErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(exchange.getRequest().getPath().value())
                .build();

        // Configurar los headers de la respuesta HTTP
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Escribir el DTO en el buffer reactivo como un JSON
        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            return Mono.error(e); // Fallback extremo si Jackson falla
        }
    }
}