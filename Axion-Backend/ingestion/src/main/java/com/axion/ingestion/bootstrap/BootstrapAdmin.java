package com.axion.ingestion.bootstrap;

import com.axion.ingestion.model.primary.User;
import com.axion.ingestion.repository.primary.UserRepository;
import com.axion.ingestion.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.time.Instant;
import java.util.UUID;

@Component
@ConditionalOnProperty(prefix = "axion.bootstrap", name = "enabled", havingValue = "true", matchIfMissing = false)
public class BootstrapAdmin implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${axion.bootstrap.admin.username:demo_admin}")
    private String adminUser;

    @Value("${axion.bootstrap.admin.password:demo}")
    private String adminPassword;

    @Value("${axion.bootstrap.enabled:false}")
    private boolean bootstrapEnabled;

    public BootstrapAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!bootstrapEnabled) {
            return;
        }

        if (userRepository.count() == 0) {
            User user = User.builder()
                    .id(UUID.randomUUID().toString())
                    .username(adminUser)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role("ADMIN")
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(user);
            System.out.println("[BOOTSTRAP] Created default admin user: " + adminUser);
        }
    }
}
