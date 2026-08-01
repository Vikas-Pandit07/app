# Logging & Observability Setup

## Frontend Logging

### Built-in Error Handling

1. **Error Boundary** (new)
   - Catches React component errors
   - Located: `frontend/src/components/ErrorBoundary.tsx`
   - Shows user-friendly error UI
   - Dev mode shows stack trace
   - Prod mode silent except in console

2. **API Error Handling**
   - `frontend/src/api/apiClient.ts` - Centralized error handling
   - All API errors wrapped in `ApiClientError`
   - Includes HTTP status and field validation errors
   - Context providers catch and display via toast

3. **Context-Level Error Handling**
   - `ProductsContext` - Falls back to mock data on API failure
   - `CartContext` - Syncs guest cart to remote on login
   - `AuthContext` - Handles JWT refresh and expiration
   - Shows toast notifications for errors

### Adding Production Logging (Sentry)

```bash
# 1. Install Sentry
npm install @sentry/react @sentry/tracing

# 2. Add to frontend/.env
VITE_SENTRY_DSN=your_sentry_dsn_url
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACE_SAMPLE_RATE=0.1

# 3. Initialize in frontend/src/main.tsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: import.meta.env.VITE_SENTRY_TRACE_SAMPLE_RATE || 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### Console Logging Best Practices

```typescript
// Development
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}

// Production - only errors
if (import.meta.env.PROD) {
  console.error("Critical error:", error);
}
```

---

## Backend Logging

### Current Setup

**Log Levels** in `backend/src/main/resources/application.properties`:

```properties
logging.level.org.springframework.security=INFO
logging.level.com.outloox=INFO
```

### Structured Logging

Add to `application.properties`:

```properties
# JSON logging for production
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
logging.pattern.file=%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n

# Log to file
logging.file.name=logs/outloox.log
logging.file.max-size=10MB
logging.file.max-history=30
```

### Important Logs to Monitor

1. **Authentication**
   - `SecurityFilterChainConfig` - JWT parsing
   - `AuthController` - Login/register attempts

2. **Payments**
   - `PaymentService` - Razorpay verification
   - `PaymentController` - Payment webhook processing

3. **Database**
   - Migration execution (`Flyway`)
   - Query errors (slow queries if enabled)

4. **API Errors**
   - `GlobalExceptionHandler` - All exceptions
   - Rate limiting violations

### Production Logging Stack

For production, use **ELK Stack** (Elasticsearch, Logstash, Kibana):

1. **Setup Logback with JSON**

   ```xml
   <!-- Add to pom.xml -->
   <dependency>
       <groupId>net.logstash.logback</groupId>
       <artifactId>logstash-logback-encoder</artifactId>
       <version>7.3</version>
   </dependency>
   ```

2. **Configure logback-spring.xml**

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
       <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
           <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
       </appender>
       <root level="INFO">
           <appender-ref ref="STDOUT" />
       </root>
   </configuration>
   ```

3. **Docker Compose for ELK**

   ```yaml
   elasticsearch:
     image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
     environment:
       - discovery.type=single-node
       - xpack.security.enabled=false
     ports:
       - "9200:9200"

   logstash:
     image: docker.elastic.co/logstash/logstash:8.10.0
     volumes:
       - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
     ports:
       - "5000:5000"

   kibana:
     image: docker.elastic.co/kibana/kibana:8.10.0
     ports:
       - "5601:5601"
   ```

---

## Error Tracking

### Sentry Setup (Recommended for Production)

**Backend:**

```properties
# Add to application-prod.properties
sentry.dsn=${SENTRY_DSN}
sentry.environment=production
sentry.traces-sample-rate=0.1
```

**Dependencies:**

```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-spring-boot-starter</artifactId>
    <version>7.x.x</version>
</dependency>
```

### Key Metrics to Track

1. **API Performance**
   - Response times by endpoint
   - Database query times
   - External service calls (Razorpay, Cloudinary)

2. **Error Rates**
   - 4xx vs 5xx ratio
   - Failed payments
   - Stock/inventory conflicts

3. **Business Metrics**
   - Order creation rate
   - Checkout abandonment
   - Cart conversion

4. **System Health**
   - Database connection pool
   - Memory usage
   - CPU usage

---

## Monitoring Alerts

### Backend Health Checks

Add actuator endpoint:

```properties
management.endpoints.web.exposure.include=health,info,prometheus
management.endpoint.health.show-details=when-authorized
```

Test health:

```bash
curl http://localhost:9090/actuator/health
```

### Prometheus Integration

1. Add dependency:

   ```xml
   <dependency>
       <groupId>io.micrometer</groupId>
       <artifactId>micrometer-registry-prometheus</artifactId>
   </dependency>
   ```

2. Access metrics:

   ```
   http://localhost:9090/actuator/prometheus
   ```

3. Configure Prometheus scrape:
   ```yaml
   scrape_configs:
     - job_name: "outloox-backend"
       static_configs:
         - targets: ["localhost:9090"]
       metrics_path: "/actuator/prometheus"
   ```

---

## Local Development Monitoring

### View Backend Logs

```bash
docker-compose logs backend -f
```

### View Frontend Errors

```
Browser DevTools → Console tab
```

### Database Queries

Enable in dev:

```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
```

---

## Pre-Launch Checklist

- [ ] Error Boundary added to frontend ✅ (Done)
- [ ] Backend error handling tested
- [ ] Logging configured for dev
- [ ] Sentry account created & DSN configured
- [ ] Rate limiting rules validated
- [ ] Database backups automated
- [ ] Alerting thresholds set
- [ ] Log retention configured
- [ ] Performance baselines established
- [ ] Incident response plan documented

---

## Troubleshooting

### Too Many Errors in Logs

- Check rate limiting: auth/payment endpoints
- Check for N+1 query problems
- Monitor memory usage

### Missing Logs

- Verify log level settings
- Check file permissions
- Ensure appender is configured

### Performance Issues

- Enable query logging temporarily
- Check slow query logs
- Profile with Java Flight Recorder

---

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [Spring Boot Logging](https://spring.io/guides/gs/logging-log4j2/)
- [Elasticsearch & Kibana](https://www.elastic.co/)
- [Prometheus Metrics](https://micrometer.io/)
