package com.axion.ingestion.config;

import com.axion.ingestion.model.DigitalTwinState;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, DigitalTwinState> redisTemplate(RedisConnectionFactory Connectionfactory) {
        RedisTemplate<String, DigitalTwinState> template = new RedisTemplate<>();
        template.setConnectionFactory(Connectionfactory);

        template.setKeySerializer(new StringRedisSerializer());

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.findAndRegisterModules();

        Jackson2JsonRedisSerializer<DigitalTwinState> valueSerializer = new Jackson2JsonRedisSerializer<>(
                DigitalTwinState.class);

        valueSerializer.setObjectMapper(objectMapper);

        template.setValueSerializer(valueSerializer);

        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(valueSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
