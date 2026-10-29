package com.axion.ingestion.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import reactor.core.publisher.Flux;

@Configuration
public class AiFallbackConfig {

    private static final Logger log = LoggerFactory.getLogger(AiFallbackConfig.class);

    @Bean
    @ConditionalOnMissingBean(ChatClient.Builder.class)
    public ChatClient.Builder chatClientBuilderFallback() {
        log.warn("Providing ChatClient.Builder fallback: OpenAI features will be offline until a valid API key is configured.");
        ChatModel fallbackModel = new ChatModel() {
            @Override
            public ChatResponse call(Prompt prompt) {
                throw new IllegalStateException("OpenAI API key not configured. ChatClient unavailable.");
            }

            @Override
            public Flux<ChatResponse> stream(Prompt prompt) {
                return Flux.error(new IllegalStateException("OpenAI API key not configured. ChatClient unavailable."));
            }

            @Override
            public ChatOptions getDefaultOptions() {
                return null;
            }
        };

        return ChatClient.builder(fallbackModel);
    }
}

