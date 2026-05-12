// SgsEvaluacionException.java
package cl.smid.sgs.exception;

public class SgsEvaluacionException extends RuntimeException {

    public SgsEvaluacionException(String message) {
        super(message);
    }

    public SgsEvaluacionException(String message, Throwable cause) {
        super(message, cause);
    }
}