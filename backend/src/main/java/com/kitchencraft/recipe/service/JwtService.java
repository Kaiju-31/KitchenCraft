package com.kitchencraft.recipe.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    
    @Value("${jwt.secret:myDefaultSecretKeyThatIsAtLeast32CharactersLong}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationInMs;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }
    
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        // Pour notre système, nous stockons l'email comme subject du JWT
        String subject = userDetails.getUsername(); // Pour la compatibilité existante
        if (userDetails instanceof com.kitchencraft.recipe.model.User) {
            subject = ((com.kitchencraft.recipe.model.User) userDetails).getEmail();
        }
        
        return Jwts.builder()
            .claims(extraClaims)
            .subject(subject)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
            .signWith(getSigningKey())
            .compact();
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    // Alias pour plus de clarté - extrait l'email du token
    public String extractEmail(String token) {
        return extractUsername(token);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
    
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String tokenSubject = extractUsername(token);
        
        // Le subject du token est l'email, on compare avec l'email de l'utilisateur
        String userIdentifier = userDetails.getUsername(); // Par défaut username
        if (userDetails instanceof com.kitchencraft.recipe.model.User) {
            userIdentifier = ((com.kitchencraft.recipe.model.User) userDetails).getEmail();
        }
        
        return (tokenSubject.equals(userIdentifier) && !isTokenExpired(token));
    }
}