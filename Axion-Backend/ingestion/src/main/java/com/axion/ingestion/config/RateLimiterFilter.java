package com.axion.ingestion.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter protecting expensive endpoints.
 *
 * Applies a sliding-window counter per client IP to:
 * - /api/v1/ai/chat/stream  (each call triggers an LLM API call — $$)
 * - /api/v1/auth/login       (brute-force protection)
 * - /api/v1/auth/register    (account-spam protection)
 *
 * For production, replace with Bucket4j + Redis or Spring Cloud Gateway rate limiting.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimiterFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterFilter.class);

    @Value("${axion.ratelimit.ai-chat.max-per-minute:10}")
    private int aiChatMaxPerMinute;

    @Value("${axion.ratelimit.auth.max-per-minute:20}")
    private int authMaxPerMinute;

    // key = "path:ip", value = window state
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        if (!(req instanceof HttpServletRequest httpReq) || !(res instanceof HttpServletResponse httpRes)) {
            chain.doFilter(req, res);
            return;
        }

        String path = httpReq.getRequestURI();
        String ip = getClientIp(httpReq);

        int limit = resolveLimit(path);
        if (limit > 0) {
            String key = path + ":" + ip;
            WindowCounter counter = counters.computeIfAbsent(key, k -> new WindowCounter());

            if (!counter.tryAcquire(limit)) {
                log.warn("Rate limit exceeded for {} from {}", path, ip);
                httpRes.setStatus(429);
                httpRes.setContentType("application/json");
                httpRes.getWriter().write(
                        "{\"error_code\":\"RATE_LIMITED\",\"message\":\"Too many requests. Try again in a minute.\"}");
                return;
            }
        }

        chain.doFilter(req, res);
    }

    private int resolveLimit(String path) {
        if (path.startsWith("/api/v1/ai/chat")) return aiChatMaxPerMinute;
        if (path.startsWith("/api/v1/auth/login")) return authMaxPerMinute;
        if (path.startsWith("/api/v1/auth/register")) return authMaxPerMinute;
        return 0; // no limit
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    /**
     * Simple sliding-window counter: resets every 60 seconds.
     */
    private static class WindowCounter {
        private volatile long windowStart = Instant.now().getEpochSecond();
        private final AtomicInteger count = new AtomicInteger(0);

        synchronized boolean tryAcquire(int maxPerMinute) {
            long now = Instant.now().getEpochSecond();
            if (now - windowStart >= 60) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= maxPerMinute;
        }
    }
}
