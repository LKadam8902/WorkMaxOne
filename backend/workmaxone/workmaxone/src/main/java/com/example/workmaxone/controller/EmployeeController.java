package com.example.workmaxone.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.workmaxone.DTO.RegisterRequest;
import com.example.workmaxone.DTO.RegisterResponse;
import com.example.workmaxone.service.EmployeeRESTService;
import com.example.workmaxone.entity.Employee;
import java.util.List;

@RestController
@RequestMapping("/employee")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeeController {

    @Autowired
    private EmployeeRESTService employeeRESTService;

    @PutMapping("/create")
    public ResponseEntity<RegisterResponse> create(@RequestBody RegisterRequest req) {

        if (req.isTeamLead()) {
            var createdEmp = employeeRESTService.createTeamLead(req.employeeName(), req.email(), req.password());
            return new ResponseEntity<RegisterResponse>(
                    new RegisterResponse(createdEmp.getEmployeeId(), "Account Created Successfully"),
                    HttpStatus.CREATED);
        } else {
            var createdEmp = employeeRESTService.createBenchedEmployee(req.employeeName(), req.email(), req.password());
            return new ResponseEntity<RegisterResponse>(
                    new RegisterResponse(createdEmp.getEmployeeId(), "Account Created Successfully"),
                    HttpStatus.CREATED);
        }
    }

}