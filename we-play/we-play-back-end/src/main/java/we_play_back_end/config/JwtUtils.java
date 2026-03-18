package we_play_back_end.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private int jwtExpirationMs;
    
    // Cache the signing key - initialized once at startup
    private SecretKey cachedSigningKey;
    
    @PostConstruct
    public void init() {
        // Initialize and cache the signing key once at startup
        this.cachedSigningKey = createSigningKey();
        logger.info("JWT signing key initialized successfully");
    }
    
    private SecretKey createSigningKey() {
        byte[] keyBytes;
        try {
            // Support Base64-encoded secrets (preferred) or raw string secrets
            if (jwtSecret.trim().matches("^[A-Za-z0-9+/]+=*$")) {
                keyBytes = Decoders.BASE64.decode(jwtSecret);
            } else {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            }
        } catch (Exception ex) {
            logger.error("Failed to decode JWT secret: {}", ex.getMessage());
            throw new IllegalStateException("Invalid JWT secret configuration", ex);
        }

        // HS512 requires a key size of at least 512 bits (64 bytes)
        if (keyBytes.length < 64) {
            logger.warn("Configured JWT secret is shorter than 64 bytes; generating a secure random HS512 key for this runtime.");
            SecretKey generated = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            String b64 = Encoders.BASE64.encode(generated.getEncoded());
            logger.warn("Generated runtime JWT secret (persist this in application.properties for persistence): {}", b64);
            return generated;
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    private SecretKey getSigningKey() {
        return cachedSigningKey;
    }
    
    public String generateJwtToken(Authentication authentication) {
        // Get username from authentication
        String username = authentication.getName();
        
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        }
        return false;
    }
}