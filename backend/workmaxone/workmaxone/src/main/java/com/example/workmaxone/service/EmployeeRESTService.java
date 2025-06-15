package com.example.workmaxone.service;


import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import com.example.workmaxone.repository.EmployeeRepo;
import com.example.workmaxone.repository.TeamLeadRepo;
import com.example.workmaxone.service.exception.EmployeeException;

@Service
public class EmployeeRESTService {
    @Autowired
    private BenchedEmployeeRepo benchedEmployeeRepo;

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private TeamLeadRepo teamLeadRepo;

    private PasswordEncoder encoder;

    public EmployeeRESTService(PasswordEncoder encoder) {
        this.encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }    public Optional<Employee> getAuthenticatedBenchedEmployee(String useremail, String password) {
        var employeeInDb = employeeRepo.findByEmail(useremail);
        if (employeeInDb.isEmpty()) {
            System.out.println("Couldn't find employee with email: " + useremail);
            return Optional.empty();
        }
        
        Employee employee = employeeInDb.get();
        
        // Check if it's actually a BenchedEmployee
        if (!(employee instanceof BenchedEmployee)) {
            System.out.println("Employee is not a BenchedEmployee: " + useremail);
            return Optional.empty();
        }
        
        if (encoder.matches(password, employee.getpassword())) {
            System.out.println("BenchedEmployee authentication successful: " + useremail);
            return employeeInDb;
        } else {
            System.out.println("Password mismatch for BenchedEmployee: " + useremail);
            return Optional.empty();
        }
    }

    public Optional<Employee> getAuthenticatedTeamLead(String useremail, String password) {
        var employeeInDb = employeeRepo.findByEmail(useremail);
        if (employeeInDb.isEmpty()) {
            System.out.println("Couldn't find employee with email: " + useremail);
            return Optional.empty();
        }
        
        Employee employee = employeeInDb.get();
        
        // Check if it's actually a TeamLead
        if (!(employee instanceof TeamLead)) {
            System.out.println("Employee is not a TeamLead: " + useremail);
            return Optional.empty();
        }
        
        if (encoder.matches(password, employee.getpassword())) {
            System.out.println("TeamLead authentication successful: " + useremail);
            return employeeInDb;
        } else {
            System.out.println("Password mismatch for TeamLead: " + useremail);
            return Optional.empty();
        }
    }

    public Employee createBenchedEmployee(String employeeName, String email, String password) {
        var benchedEmp = new BenchedEmployee(employeeName, email, encoder.encode(password), null);
        return employeeRepo.save(benchedEmp);
    }

    public Employee createTeamLead(String employeeName, String email, String password) {
        var teamLead = new TeamLead(employeeName, email, encoder.encode(password), null);
        return employeeRepo.save(teamLead);
    }


    public List<Employee> getNotApprovedUser(){
        return employeeRepo.findAllNotApprovedYet();
   }

    public void approveEmployee(String employeeEmail) {
        employeeRepo.findByEmail(employeeEmail)
                .ifPresentOrElse(employee -> {
                    employee.setAprooved(true);
                    employeeRepo.save(employee);
                }, () -> {
                    throw new EmployeeException("Employee not found with id " + employeeEmail);
                });
    }
}

