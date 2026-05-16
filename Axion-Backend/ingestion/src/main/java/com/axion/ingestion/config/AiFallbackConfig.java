package com.axion.ingestion.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;

import org.springframework.ai.chat.client.ChatClient;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

@Configuration
public class AiFallbackConfig {

    private static final Logger log = LoggerFactory.getLogger(AiFallbackConfig.class);

    @Bean
    @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "spring.ai.openai.api-key", havingValue = "disabled")
    public ChatClient.Builder chatClientBuilderFallback() {
        InvocationHandler handler = new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                if ("build".equals(method.getName())) {
                    throw new IllegalStateException("OpenAI API key not configured. ChatClient unavailable.");
                }
                // default no-op for any other builder methods
                return null;
            }
        };

        Object proxy = Proxy.newProxyInstance(
                ChatClient.Builder.class.getClassLoader(),
                new Class[]{ChatClient.Builder.class},
                handler);

        log.warn("Providing ChatClient.Builder fallback proxy: OpenAI features will be disabled until a key is configured.");
        return (ChatClient.Builder) proxy;
    }
}
