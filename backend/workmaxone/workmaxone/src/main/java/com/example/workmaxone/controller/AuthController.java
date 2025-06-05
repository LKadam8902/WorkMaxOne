package com.example.workmaxone.controller;
// package com.example.workmaxone.controller

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.workmaxone.DTO.LoginRequest;
import com.example.workmaxone.DTO.LoginResponse;
// import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Employee;
// import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.service.EmployeeRESTService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private EmployeeRESTService employeeRESTService;

    @PostMapping("benchedEmployee/login")
    public ResponseEntity<LoginResponse> loginBE(@RequestBody LoginRequest loginRequest) {

        Optional<Employee> maybeAuthenticatedCustomer = employeeRESTService
                .getAuthenticatedBenchedEmployee(loginRequest.username(), loginRequest.password());

        if (maybeAuthenticatedCustomer.isEmpty()) {
            return new ResponseEntity<LoginResponse>(new LoginResponse("Invalid username or password"),
                    HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<LoginResponse>(new LoginResponse("Successfull Login"), HttpStatus.CREATED);

    }

    @PostMapping("teamLead/login")
    public ResponseEntity<LoginResponse> loginTL(@RequestBody LoginRequest loginRequest) {

        Optional<Employee> maybeAuthenticatedCustomer = employeeRESTService
                .getAuthenticatedTeamLead(loginRequest.username(), loginRequest.password());

        if (maybeAuthenticatedCustomer.isEmpty()) {
            return new ResponseEntity<LoginResponse>(new LoginResponse("Invalid username or password"),
                    HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<LoginResponse>(new LoginResponse("Successfull Login"), HttpStatus.CREATED);

    }
}
