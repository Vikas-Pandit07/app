package com.outloox.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * STATUS: configured but not currently in use.
 *
 * This CacheManager bean exists and is valid, but no service method in the codebase
 * has an @Cacheable/@CacheEvict annotation yet, so nothing ever calls into Redis right
 * now. It also isn't provisioned in docker-compose.yml or any deployment env var yet.
 *
 * Verified safe to leave as-is: the app starts fine with or without Redis present,
 * because Spring's Redis connection factory is lazy and nothing invokes the cache.
 *
 * To actually turn this on (recommended once you have real product-catalog traffic):
 *   1. Add a `redis` service to docker-compose.yml and provision Redis on your host.
 *   2. Add @Cacheable("products") / @Cacheable("product") to the read methods in
 *      ProductService, and @CacheEvict on the write methods in AdminProductService
 *      (create/update/delete) so admin edits don't serve stale data.
 *   3. Add a CacheErrorHandler so a Redis outage degrades to "hit the DB directly"
 *      instead of breaking the product page — do this and test it against a real
 *      Redis instance before relying on it in production.
 * Deliberately not wiring this in blind, since I can't compile/run the backend or a
 * real Redis instance from this environment to verify the change is safe — this is
 * exactly the kind of change that should be tested against a running stack.
 */
@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .disableCachingNullValues()
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));

        return RedisCacheManager.builder(redisConnectionFactory)
            .cacheDefaults(defaultConfig)
            .withCacheConfiguration("products", defaultConfig.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("product", defaultConfig.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("categories", defaultConfig.entryTtl(Duration.ofHours(2)))
            .withCacheConfiguration("brands", defaultConfig.entryTtl(Duration.ofHours(2)))
            .withCacheConfiguration("collections", defaultConfig.entryTtl(Duration.ofHours(2)))
            .withCacheConfiguration("user", defaultConfig.entryTtl(Duration.ofMinutes(30)))
            .withCacheConfiguration("settings", defaultConfig.entryTtl(Duration.ofHours(6)))
            .build();
    }
}
