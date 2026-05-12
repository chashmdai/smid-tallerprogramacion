package cl.smid.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuditLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AuditLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();
        
        // Rescatar la IP real del cliente si pasamos por Nginx
        String ipAddress = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = exchange.getRequest().getRemoteAddress() != null ? 
                        exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() : "Desconocida";
        }

        // Log de entrada
        log.info("▶ [AUDITORÍA INICIO] Request: {} {} | IP Cliente: {}", method, path, ipAddress);

        // Continuar con la cadena de filtros hacia el microservicio de destino
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            // Calcular el tiempo que tardó el microservicio (SIGER, SGS, etc.) en responder
            long duration = System.currentTimeMillis() - startTime;
            
            // Obtener el código de estado HTTP de respuesta
            int statusCode = exchange.getResponse().getStatusCode() != null ? 
                             exchange.getResponse().getStatusCode().value() : 500;
            
            // Log de salida
            log.info("◀ [AUDITORÍA FIN] Request: {} {} | Status: {} | Tiempo: {}ms", 
                     method, path, statusCode, duration);
        }));
    }

    @Override
    public int getOrder() {
        // Orden -1 garantiza que este filtro sea de los primeros en ejecutarse al entrar,
        // y de los últimos en cerrarse al salir.
        return -1;
    }
}