package com.example.workmaxone.service;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import com.example.workmaxone.repository.TaskRepository;
import com.example.workmaxone.service.exception.EmployeeException;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class BenchedEmployeeService {

    @Autowired
    private BenchedEmployeeRepo benchedEmployeeRepo;

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    public void updateDurationAll(){
        List<BenchedEmployee>benchedEmployees=benchedEmployeeRepo.findAll();
        if(benchedEmployees.isEmpty()){
            throw new EmployeeException("no benched employees as been found");
        }
        for(var benched:benchedEmployees){
            if(!benched.isTaskAssigned()){
               benched.setBenchDuration((int)taskService.calculateBenchedDuration(benched));
               benchedEmployeeRepo.save(benched);
            }
        }
    }

    public List<BenchedEmployee> getEmployees(int managerId){
        List<Task> tasksList=taskRepository.findByAssignedBy(managerId);
        List<BenchedEmployee> benchedEmployeesList=new ArrayList<>();
        for(var task:tasksList){
            Optional<BenchedEmployee> emp=benchedEmployeeRepo.findById(task.getAssignedTo());
            benchedEmployeesList.add(emp.get());
        }
        return benchedEmployeesList;
    }
}
