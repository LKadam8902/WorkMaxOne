package com.example.workmaxone.service;

import com.example.workmaxone.entity.Admin;
import com.example.workmaxone.repository.AdminRepository;
import com.example.workmaxone.service.exception.AdminException;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureAlgorithm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.sql.SQLDataException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

     private static final SignatureAlgorithm alg = Jwts.SIG.RS512;
    private KeyPair pair;
    private static final Integer ACCESS_EXPIRY_SECONDS = 15*60;
    private static final Integer REFERSH_EXPIRY_SECONDS = 7* 24 * 60 * 60;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private AdminRepository adminRepository;

    public void checkAdmin(String username,String password) throws Exception {
        try{
            Admin admin=adminRepository.findAdminAll();
            if(admin!=null){
                return ;
            }else {
                admin.setUserName(username);
                admin.setPassword(encoder.encode(password));
                adminRepository.save(admin);
                return ;
            }
        }catch(Exception e){
            throw new AdminException(e.getMessage());
        }
    }

    public Optional<Admin> getAuthenticatedAdmin(String username, String password) {
        var adminInDb = adminRepository.findAdminAll();
        if (adminInDb==null) {
            System.out.println("Couldn't find this Benched Employee in DB");
            return Optional.empty();
        }
        if (password == adminInDb.getPassword()) {
            return Optional.of(adminInDb);
        } else {
            return Optional.empty();
        }
    }

    public Optional<Admin> getAdmin(int adminId){
        var admin=adminRepository.findById(adminId);
        if(admin==null){
            return admin;
        }
        return admin;
    }

    public String createAccessToken(Admin admin, String role) {
        return Jwts.builder()
                    .signWith(pair.getPrivate(), alg)
                    .subject(String.valueOf(admin.getAdminId()))
                    .claims(Map.of("name", admin.getUserName(),role,true))
                    .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                    .compact();
    }

    public String createRefreshToken(Admin admin, String role) {
         return Jwts.builder()
                    .signWith(pair.getPrivate(), alg)
                    .subject(String.valueOf(admin.getAdminId()))
                    .claims(Map.of("name", admin.getUserName(),role,true))
                    .expiration(Date.from(Instant.now().plusSeconds(ACCESS_EXPIRY_SECONDS)))
                    .compact();
    }

}