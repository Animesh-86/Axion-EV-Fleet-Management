package com.axion.ingestion.controller;

import com.axion.ingestion.model.dto.AuthRequest;
import com.axion.ingestion.model.dto.AuthResponse;
import com.axion.ingestion.model.dto.RegisterRequest;
import com.axion.ingestion.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        AuthResponse resp = authService.register(request);
        // Set HttpOnly cookie with Secure and SameSite options for production.
        String token = resp.getToken();
        org.springframework.http.ResponseCookie rc = org.springframework.http.ResponseCookie.from("AXION_JWT", token)
            .httpOnly(true)
            .secure(Boolean.parseBoolean(System.getenv().getOrDefault("AXION_COOKIE_SECURE", "false")))
            .sameSite("Strict")
            .path("/")
            .maxAge(60 * 60 * 24)
            .build();

        jakarta.servlet.http.HttpServletResponse servletResponse = ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getResponse();
        if (servletResponse != null) {
            servletResponse.setHeader("Set-Cookie", rc.toString());
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(
            @RequestBody AuthRequest request
    ) {
        AuthResponse resp = authService.authenticate(request);
        String token2 = resp.getToken();
        org.springframework.http.ResponseCookie rc2 = org.springframework.http.ResponseCookie.from("AXION_JWT", token2)
            .httpOnly(true)
            .secure(Boolean.parseBoolean(System.getenv().getOrDefault("AXION_COOKIE_SECURE", "false")))
            .sameSite("Strict")
            .path("/")
            .maxAge(60 * 60 * 24)
            .build();

        jakarta.servlet.http.HttpServletResponse servletResponse2 = ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getResponse();
        if (servletResponse2 != null) {
            servletResponse2.setHeader("Set-Cookie", rc2.toString());
        }
        return ResponseEntity.ok(resp);
    }
}
