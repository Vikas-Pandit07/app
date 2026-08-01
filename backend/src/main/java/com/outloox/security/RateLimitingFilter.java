package com.outloox.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, Deque<Long>> buckets = new ConcurrentHashMap<>();
    private final boolean enabled;
    private final int windowSeconds;
    private final int authMaxRequests;
    private final int paymentMaxRequests;
    private final boolean trustProxyHeaders;

    public RateLimitingFilter(
            @Value("${security.rate-limit.enabled:true}") boolean enabled,
            @Value("${security.rate-limit.window-seconds:60}") int windowSeconds,
            @Value("${security.rate-limit.auth-max-requests:20}") int authMaxRequests,
            @Value("${security.rate-limit.payment-max-requests:30}") int paymentMaxRequests,
            @Value("${security.rate-limit.trust-proxy-headers:false}") boolean trustProxyHeaders
    ) {
        this.enabled = enabled;
        this.windowSeconds = windowSeconds;
        this.authMaxRequests = authMaxRequests;
        this.paymentMaxRequests = paymentMaxRequests;
        this.trustProxyHeaders = trustProxyHeaders;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!enabled) {
            return true;
        }

        String path = request.getRequestURI();
        return !(path.startsWith("/api/auth/") || path.startsWith("/api/payments/"));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        int maxRequests = path.startsWith("/api/payments/") ? paymentMaxRequests : authMaxRequests;
        String key = resolveClientIp(request) + ':' + path;

        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);
        Deque<Long> timestamps = buckets.computeIfAbsent(key, ignored -> new ArrayDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                writeRateLimitResponse(request, response);
                return;
            }

            timestamps.addLast(now);
        }

        filterChain.doFilter(request, response);
    }

    private void writeRateLimitResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        body.put("error", "Too Many Requests");
        body.put("message", "Rate limit exceeded. Please try again later.");
        body.put("path", request.getRequestURI());

        objectMapper.writeValue(response.getOutputStream(), body);
    }

    private String resolveClientIp(HttpServletRequest request) {
        // X-Forwarded-For is client-supplied and trivially spoofable. Only honor it when
        // security.rate-limit.trust-proxy-headers=true, and only enable that once your
        // reverse proxy (nginx/Railway/etc.) is confirmed to strip any inbound
        // X-Forwarded-For from the client and set its own. Otherwise an attacker can send
        // a different fake IP on every request and bypass rate limiting entirely.
        if (trustProxyHeaders) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}
