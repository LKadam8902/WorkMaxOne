package com.example.workmaxone.controller;

import com.example.workmaxone.DTO.*;
import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.service.BenchedEmployeeService;
import com.example.workmaxone.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/benchEmployee")
public class BenchedEmployeeController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private BenchedEmployeeService benchedEmployeeService;


    @GetMapping("/details")
    public ResponseEntity<BenchedEmployee> getBenchedEmployeeDetails(@AuthenticationPrincipal Jwt jwt){
        int bempId=Integer.valueOf(jwt.getSubject());
        Optional<BenchedEmployee> bemp=benchedEmployeeService.getDetails(bempId);
        return new ResponseEntity<>(bemp.get(),HttpStatus.OK);
    }


    @PutMapping("/addSkills")
    public ResponseEntity<EmployeeBodyResponse> updateSkills(@AuthenticationPrincipal Jwt jwt,@RequestBody SkillsRequest req){
          int benchEmployeeId=Integer.valueOf(jwt.getSubject());
          benchedEmployeeService.updateSkillSet(benchEmployeeId,req.SkillSet());
          return new ResponseEntity<>(new EmployeeBodyResponse("Skilss added"),HttpStatus.OK);
    }

    @PutMapping("/updateTask/{id}")
    public ResponseEntity<TaskResponse>updateTask(@PathVariable("id") Integer taskId, @RequestBody TaskRequestBody requestBody){
        taskService.updateTask(taskId,requestBody.stat().name());
        return new ResponseEntity<>(new TaskResponse("Task successfulyy updated"), HttpStatus.OK);
    }

    @GetMapping("/getTaskAssigned")
    public ResponseEntity<List<Task>> getTaskToDo(@AuthenticationPrincipal Jwt jwt){
        int benchEmployeeId=Integer.valueOf(jwt.getSubject());
        List<Task> bempTasks=benchedEmployeeService.getAllTasks(benchEmployeeId);
        return new ResponseEntity<>(bempTasks,HttpStatus.OK);
    }




}
