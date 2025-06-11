package com.example.workmaxone.service;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import com.example.workmaxone.repository.TaskRepository;
import com.example.workmaxone.service.exception.EmployeeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BenchedEmployeeService {

    @Autowired
    private BenchedEmployeeRepo benchedEmployeeRepo;

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    public Optional<BenchedEmployee> getDetails(int bempid){
        return benchedEmployeeRepo.findById(bempid);
    }

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

    public void updateSkillSet(int bechEmployeeId,List<String>skillSet){
        Optional<BenchedEmployee> emp=benchedEmployeeRepo.findById(bechEmployeeId);
        if(emp==null){
            throw  new EmployeeException("employee not found");
        }
        emp.get().setSkillSet(skillSet);
        benchedEmployeeRepo.save(emp.get());
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


    public List<Task> getAllTasks(int benchEmployeeId) {
        return taskRepository.findByAssignedTo(benchEmployeeId);
    }
}
