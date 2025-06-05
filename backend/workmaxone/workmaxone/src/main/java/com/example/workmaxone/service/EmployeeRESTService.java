package com.example.workmaxone.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import com.example.workmaxone.repository.EmployeeRepo;
import com.example.workmaxone.repository.TeamLeadRepo;

@Service
public class EmployeeRESTService {
    @Autowired
    private BenchedEmployeeRepo benchedEmployeeRepo;

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private TeamLeadRepo teamLeadRepo;

    public Optional<Employee> getAuthenticatedBenchedEmployee(String username, String password) {
        var benchedEmpInDb = benchedEmployeeRepo.findByEmployeeName(username);
        if (benchedEmpInDb.isEmpty()) {
            System.out.println("Couldn't find this Benched Employee in DB");
            return Optional.empty();
        }
        if (password == benchedEmpInDb.get().getpassword()) {
            return benchedEmpInDb;
        } else {
            return Optional.empty();
        }
    }

    public Optional<Employee> getAuthenticatedTeamLead(String username, String password) {
        var teamLeadInDb = teamLeadRepo.findByEmployeeName(username);
        if (teamLeadInDb.isEmpty()) {
            System.out.println("Couldn't find this Benched Employee in DB");
            return Optional.empty();
        }
        if (password == teamLeadInDb.get().getpassword()) {
            return teamLeadInDb;
        } else {
            return Optional.empty();
        }
    }

    public Employee createBenchedEmployee(String employeeName, String email, String password ) {
        var benchedEmp = new BenchedEmployee(employeeName,email,password,null);
        return employeeRepo.save(benchedEmp);
    }

    public Employee createTeamLead(String employeeName, String email, String password ) {
        var teamLead = new TeamLead(employeeName,email,password,null);
        return employeeRepo.save(teamLead);
    }

}
