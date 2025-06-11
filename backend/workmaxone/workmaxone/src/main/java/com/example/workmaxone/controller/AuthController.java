package com.example.workmaxone.controller;
// package com.example.workmaxone.controller

import java.util.Optional;

import com.example.workmaxone.DTO.LogoutResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.workmaxone.DTO.LoginRequest;
import com.example.workmaxone.DTO.LoginResponse;
// import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.RoleEnum;
// import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.service.EmployeeRESTService;
import com.example.workmaxone.service.JWTservice;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.security.SignatureException;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/auth")
public class AuthController {

        @Autowired
        private EmployeeRESTService employeeRESTService;

        @Autowired
        private JWTservice jwtService;

        @PostMapping("/benchedEmployee/login")
        public ResponseEntity<LoginResponse> loginBE(@RequestBody LoginRequest loginRequest,
                        HttpServletResponse response) {

                Optional<Employee> maybeAuthenticatedBE = employeeRESTService
                                .getAuthenticatedBenchedEmployee(loginRequest.useremail(), loginRequest.password());

                if (maybeAuthenticatedBE.isEmpty()) {
                        return new ResponseEntity<LoginResponse>(new LoginResponse("", "Invalid username or password"),
                                        HttpStatus.FORBIDDEN);
                }

                if(!maybeAuthenticatedBE.get().isAprooved()){
                        return new ResponseEntity<>(new LoginResponse("","Employee not been approved yet"),HttpStatus.FORBIDDEN);
                }
                var role = RoleEnum.BENCHED_EMPLOYEE;
                var accessToken = jwtService.createAccessToken(maybeAuthenticatedBE.get(), role.name());
                var refreshToken = jwtService.createRefreshToken(maybeAuthenticatedBE.get(), role.name());
                Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
                refreshTokenCookie.setHttpOnly(true);
                response.addCookie(refreshTokenCookie);
                return new ResponseEntity<LoginResponse>(
                                new LoginResponse(accessToken, "Successful login, use token for further comms"),
                                HttpStatus.CREATED);
        }

        @PostMapping("/teamLead/login")
        public ResponseEntity<LoginResponse> loginTL(@RequestBody LoginRequest loginRequest,
                        HttpServletResponse response) {

                Optional<Employee> maybeAuthenticatedTL = employeeRESTService
                                .getAuthenticatedTeamLead(loginRequest.useremail(), loginRequest.password());

                if (maybeAuthenticatedTL.isEmpty()) {
                        return new ResponseEntity<LoginResponse>(new LoginResponse("", "Invalid username or password"),
                                        HttpStatus.FORBIDDEN);
                }

                if(!maybeAuthenticatedTL.get().isAprooved()){
                        return new ResponseEntity<>(new LoginResponse("","Employee not been approved yet"),HttpStatus.FORBIDDEN);
                }
                var role = RoleEnum.TEAM_LEAD;
                var accessToken = jwtService.createAccessToken(maybeAuthenticatedTL.get(), role.name());
                var refreshToken = jwtService.createRefreshToken(maybeAuthenticatedTL.get(), role.name());

                Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
                refreshTokenCookie.setHttpOnly(true);
                response.addCookie(refreshTokenCookie);
                return new ResponseEntity<LoginResponse>(
                                new LoginResponse(accessToken, "Successful login, use token for further comms"),
                                HttpStatus.CREATED);

        }

        @PostMapping("/refresh")
        public ResponseEntity<LoginResponse> refresh(@CookieValue("refreshToken") String refreshToken,
                        HttpServletResponse response) {
                try {
                        var newAccessToken = jwtService.createNewAccessToken(refreshToken);
                        return new ResponseEntity<LoginResponse>(
                                        new LoginResponse(newAccessToken,
                                                        "Successful token refresh, use this token for further comms"),
                                        HttpStatus.CREATED);
                } catch (SignatureException e) {
                        e.printStackTrace();
                        Cookie invalidatedRefreshToken = new Cookie("refreshToken", null);
                        invalidatedRefreshToken.setHttpOnly(true);
                        invalidatedRefreshToken.setMaxAge(0);
                        response.addCookie(invalidatedRefreshToken);

                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).header("Token-Status", "Invalid")
                                        .body(new LoginResponse("", "invalid Refresh Token, unauthorized"));
                }
        }


        @PostMapping("/logout")
        public ResponseEntity<LogoutResponse> logout(HttpServletResponse response) {
                Cookie invalidatedRefreshToken = new Cookie("refreshToken", null);
                invalidatedRefreshToken.setHttpOnly(true);
                invalidatedRefreshToken.setMaxAge(0);
                response.addCookie(invalidatedRefreshToken);
                return new ResponseEntity<LogoutResponse>(
                        new LogoutResponse("successfully logged out and cleared the refresh token cookie"), HttpStatus.OK);
        }
}
