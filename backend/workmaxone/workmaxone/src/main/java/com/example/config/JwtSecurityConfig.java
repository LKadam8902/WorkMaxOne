package com.example.config;

import com.example.workmaxone.service.AdminService;
import org.springframework.security.config.Customizer;

import java.security.interfaces.RSAPublicKey;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.workmaxone.service.JWTservice;
import org.slf4j.Logger; // Import the SLF4J Logger
import org.slf4j.LoggerFactory; // Import the SLF4J LoggerFactory


@Configuration
@EnableWebSecurity
public class JwtSecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class); // Define the logger

    @Autowired
    private JWTservice jwtService;
    
    @Bean
    @Order(0)
    public SecurityFilterChain filterChainIgnoreAuth(HttpSecurity http) throws Exception{
        log.info("filter chain reached (at bean definition)");
        System.out.println("Security config reached (at bean definition)");

        http.securityMatcher("/auth/**", "/error", "/employee/**", "/admin/login")
                .authorizeHttpRequests((authorize)->authorize
                        .requestMatchers("/auth/**", "/error", "/employee/**", "/admin/login").permitAll()
                        .anyRequest().authenticated())
                .cors(Customizer.withDefaults())
                .csrf(csrf->csrf.disable());

        return http.build();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("filter chain reached (at bean definition)");

        http.authorizeHttpRequests((authorize) -> authorize
                .requestMatchers("/admin/getAdminDetails").hasRole("ADMIN")
                .requestMatchers("/**").authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(myJwtDecoder())
                    .jwtAuthenticationConverter(myJwtAuthenticationConverter())))
                .cors(Customizer.withDefaults())
                .csrf(csrf->csrf.disable());
        return http.build();
    }

     private JwtDecoder myJwtDecoder() {
        if (!(jwtService.getPublicKey() instanceof RSAPublicKey)) {
            return null;
        } else {
            var asRSAKey = (RSAPublicKey) jwtService.getPublicKey();
            System.out.println(asRSAKey);
            return NimbusJwtDecoder.withPublicKey(asRSAKey).signatureAlgorithm(SignatureAlgorithm.RS512).build();
        }
    }

    private JwtAuthenticationConverter myJwtAuthenticationConverter() {
        var jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
            var role = jwt.getClaimAsString("role");
            

            if (role != null) { 
                if (role.equals("ADMIN")) {
                    grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                } else if (role.equals("TEAM_LEAD")) {
                    grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_TEAM_LEAD"));
                    
                } else if (role.equals("BENCHED_EMPLOYEE")) {
                    grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_BENCHED_EMPLOYEE")); 
                }
            }
            return grantedAuthorities;
        });
        return jwtAuthenticationConverter;
    }


     @Bean
    public UrlBasedCorsConfigurationSource myCorsConfig() {
        var config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedOrigin("http://127.0.0.1:4200");
        config.setAllowedMethods(List.of("GET", "PUT", "POST", "OPTIONS", "DELETE"));
        config.addExposedHeader("Token-Status");
        var src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", config);
        return src;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
         return new BCryptPasswordEncoder();
    }



}
