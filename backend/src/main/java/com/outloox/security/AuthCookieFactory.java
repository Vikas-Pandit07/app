package com.outloox.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieFactory {

    private final long jwtExpiration;
    private final boolean secure;
    private final String sameSite;
    private final String domain;

    public AuthCookieFactory(
            @Value("${jwt.expiration}") long jwtExpiration,
            @Value("${app.cookie.secure:false}") boolean secure,
            @Value("${app.cookie.same-site:Lax}") String sameSite,
            @Value("${app.cookie.domain:}") String domain
    ) {
        this.jwtExpiration = jwtExpiration;
        this.secure = secure;
        this.sameSite = sameSite;
        this.domain = domain;
    }

    public ResponseCookie buildAuthCookie(String token) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("JWT_TOKEN", token)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(jwtExpiration / 1000)
                .sameSite(sameSite);

        if (domain != null && !domain.isBlank()) {
            builder.domain(domain.trim());
        }

        return builder.build();
    }

    public ResponseCookie buildLogoutCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("JWT_TOKEN", "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite(sameSite);

        if (domain != null && !domain.isBlank()) {
            builder.domain(domain.trim());
        }

        return builder.build();
    }
}
