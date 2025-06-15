package com.example.workmaxone.service;

import java.util.Date;
import java.time.Instant;
import java.util.Map;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;

import com.example.workmaxone.entity.Admin;
import com.example.workmaxone.entity.Employee;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureException;

@Service
public class JWTservice {

    private static final String SECRET_KEY = "WorkMaxOneSecretKeyForJWTSigningThatIsLongEnoughForHS512Algorithm";
    private static final SecretKeySpec signingKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
    private static final Integer ACCESS_EXPIRY_SECONDS = 15*60;
    private static final Integer REFERSH_EXPIRY_SECONDS = 7* 24 * 60 * 60;

    public JWTservice(){
        // No need to generate a new key pair - using static secret key
    }public SecretKeySpec getSigningKey(){
        return signingKey;
    }    public String createAccessToken(Employee employee, String role) {

         return Jwts.builder()
                    .signWith(signingKey)
                    .subject(String.valueOf(employee.getEmployeeId()))
                    .claims(Map.of("name", employee.getEmployeeName(),"role",role))
                    .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                    .compact();
    }

    public String createRefreshToken(Employee employee,String role) {
        return Jwts.builder()
                    .signWith(signingKey)
                    .subject(String.valueOf(employee.getEmployeeId()))
                    .claims(Map.of("name", employee.getEmployeeName(),"role",role))
                    .expiration(Date.from(Instant.now().plusSeconds(REFERSH_EXPIRY_SECONDS)))
                    .compact();
    }

    public String createNewAccessToken(String refreshToken) throws SignatureException {
        var parsedRefreshToken = Jwts.parser()
                                        .verifyWith(signingKey)
                                        .build()
                                        .parseSignedClaims(refreshToken);
        return Jwts.builder()
                    .signWith(signingKey)
                    .subject(parsedRefreshToken.getPayload().getSubject())
                    .claims(parsedRefreshToken.getPayload())
                    .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                    .compact();
    }

    public String createAccessToken(Admin admin, String role) {
        return Jwts.builder()
                .signWith(signingKey)
                .subject(String.valueOf(admin.getAdminId()))
                .claims(Map.of("name", admin.getAdminEmail(),"role",role))
                .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                .compact();
    }

    public String createRefreshToken(Admin admin, String role) {
        return Jwts.builder()
                .signWith(signingKey)
                .subject(String.valueOf(admin.getAdminId()))
                .claims(Map.of("name", admin.getAdminEmail(),"role",role))
                .expiration(Date.from(Instant.now().plusSeconds(REFERSH_EXPIRY_SECONDS)))
                .compact();
    }

    
}
