package com.example.workmaxone.service;

import java.security.KeyPair;
import java.security.PublicKey;
import java.util.Date;
import java.time.Instant;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.workmaxone.entity.Admin;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.RoleEnum;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureAlgorithm;
import io.jsonwebtoken.security.SignatureException;

@Service
public class JWTservice {

    private static final SignatureAlgorithm alg = Jwts.SIG.RS512;
    private KeyPair pair;
    private static final Integer ACCESS_EXPIRY_SECONDS = 15*60;
    private static final Integer REFERSH_EXPIRY_SECONDS = 7* 24 * 60 * 60;

    public JWTservice(){
        pair = alg.keyPair().build();
    }

    public PublicKey getPublicKey(){
        return pair.getPublic();
    }

    public String createAccessToken(Employee employee, String role) {

         return Jwts.builder()
                    .signWith(pair.getPrivate(), alg)
                    .subject(String.valueOf(employee.getEmployeeId()))
                    .claims(Map.of("name", employee.getEmployeeName(),"role",role))
                    .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                    .compact();
    }

    public String createRefreshToken(Employee employee,String role) {
        return Jwts.builder()
                    .signWith(pair.getPrivate(), alg)
                    .subject(String.valueOf(employee.getEmployeeId()))
                    .claims(Map.of("name", employee.getEmployeeName(),"role",role))
                    .expiration(Date.from(Instant.now().plusSeconds(REFERSH_EXPIRY_SECONDS)))
                    .compact();
    }

    public String createNewAccessToken(String refreshToken) throws SignatureException {
        var parsedRefreshToken = Jwts.parser()
                                        .verifyWith(getPublicKey())
                                        .build()
                                        .parseSignedClaims(refreshToken);
        return Jwts.builder()
                    .signWith(pair.getPrivate(), alg)
                    .subject(parsedRefreshToken.getPayload().getSubject())
                    .claims(parsedRefreshToken.getPayload())
                    .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                    .compact();
    }

    public String createAccessToken(Admin admin, String role) {
        return Jwts.builder()
                .signWith(pair.getPrivate(), alg)
                .subject(String.valueOf(admin.getAdminId()))
                .claims(Map.of("name", admin.getUserName(),"role",role))
                .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                .compact();
    }

    public String createRefreshToken(Admin admin, String role) {
        return Jwts.builder()
                .signWith(pair.getPrivate(), alg)
                .subject(String.valueOf(admin.getAdminId()))
                .claims(Map.of("name", admin.getUserName(),"role",role))
                .expiration(Date.from(Instant.now().plusSeconds(REFERSH_EXPIRY_SECONDS)))
                .compact();
    }

    
}
