package com.example.workmaxone.service;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class BenchedEmployeeService {

    @Autowired
    private BenchedEmployeeRepo benchedEmployeeRepo;

    public void updateDurationAll(){
        List<BenchedEmployee>benchedEmployees=benchedEmployeeRepo.findAll();
        for(var benched:benchedEmployees){
            if(!benched.isTaskAssigned()){

            }
        }
    }
}
