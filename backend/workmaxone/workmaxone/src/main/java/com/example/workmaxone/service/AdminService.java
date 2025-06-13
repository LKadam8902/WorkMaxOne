package com.example.workmaxone.service;

import com.example.workmaxone.entity.Admin;
import com.example.workmaxone.repository.AdminRepository;
import com.example.workmaxone.service.exception.AdminException;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureAlgorithm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.KeyPair;
import java.sql.SQLDataException;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

     private static final SignatureAlgorithm alg = Jwts.SIG.RS512;
    private KeyPair pair;
    private static final Integer ACCESS_EXPIRY_SECONDS = 30*60;
    private static final Integer REFERSH_EXPIRY_SECONDS = 7* 24 * 60 * 60;


    private PasswordEncoder encoder;

    @Autowired
    private JWTservice jwtService;

    public AdminService() {
       encoder= new BCryptPasswordEncoder();
    }

    @Autowired
    private AdminRepository adminRepository;



    @Transactional
    public void checkAdmin(String useremail,String password) throws Exception {
        try{
            List<Admin>adminInDb=adminRepository.findAll();

            if(!adminInDb.isEmpty()){
                return ;
            }else {
                Admin admin=new Admin();
                admin.setAdminEmail(useremail);
                admin.setPassword(encoder.encode(password));
                adminRepository.save(admin);
                return ;
            }
        }catch(Exception e){
            throw new AdminException("Error adding admin"+e.getMessage());
        }
    }

    public Optional<Admin> getAuthenticatedAdmin(String username, String password) {
        Admin admin = adminRepository.findByAdminEmail(username);
        System.out.println("\n--- DEBUG LOGIN ---");
        System.out.println("Incoming username: " + username);
        System.out.println("Incoming raw password: " + password);

        if (admin==null) {
            System.out.println("Couldn't find this Benched Employee in DB");
            return Optional.empty();
        }
        System.out.println("Admin found. Stored username: " + admin.getAdminEmail());
        System.out.println("Stored HASHED password from DB: " + admin.getPassword());

        if (encoder.matches(password, admin.getPassword())) {
            System.out.println("Password match result (encoder.matches): " + encoder.matches(password, admin.getPassword()));
            System.out.println("--- END DEBUG LOGIN ---\n");
            return Optional.of(admin);
        } else {
            return Optional.empty();
        }
    }

    public Optional<Admin> getAdmin(){
        var admin=adminRepository.findAll();
        if(admin.isEmpty()){
            return null;
        }
        return Optional.ofNullable(admin.getFirst());
    }

    public String createAccessToken(Admin admin, String role) {

        return jwtService.createAccessToken(admin, role);

    }

    public String createRefreshToken(Admin admin, String role) {
        return jwtService.createRefreshToken(admin, role);
    }

}