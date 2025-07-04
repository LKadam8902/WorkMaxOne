package com.example.workmaxone.service;


import java.util.Optional;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.TeamLead;

import com.example.workmaxone.repository.EmployeeRepo;

import com.example.workmaxone.service.exception.EmployeeException;

@Service
public class EmployeeRESTService {
   

    @Autowired
    private EmployeeRepo employeeRepo;

    private PasswordEncoder encoder;

    public EmployeeRESTService(PasswordEncoder encoder) {
        this.encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    public Optional<Employee> getAuthenticatedBenchedEmployee(String useremail, String password) {
        var benchedEmpInDb = employeeRepo.findByEmail(useremail);
        if (benchedEmpInDb.isEmpty()) {
            System.out.println("Couldn't find this Benched Employee in DB");
            return Optional.empty();
        }
        if (encoder.matches(password, benchedEmpInDb.get().getpassword())) {
            return benchedEmpInDb;
        } else {
            return Optional.empty();
        }
    }

    public Optional<Employee> getAuthenticatedTeamLead(String useremail, String password) {
        var teamLeadInDb = employeeRepo.findByEmail(useremail);
        if (teamLeadInDb.isEmpty()) {
            System.out.println("Couldn't find this Team Lead in DB");
            return Optional.empty();
        }
        if (encoder.matches(password, teamLeadInDb.get().getpassword())) {
            return teamLeadInDb;
        } else {
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

