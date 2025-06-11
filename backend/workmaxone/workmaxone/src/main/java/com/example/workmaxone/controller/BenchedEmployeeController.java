package com.example.workmaxone.controller;

import com.example.workmaxone.DTO.RegisterResponse;
import com.example.workmaxone.DTO.TaskRequestBody;
import com.example.workmaxone.DTO.TaskResponse;
import com.example.workmaxone.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/benchEmployee")
public class BenchedEmployeeController {

    @Autowired
    private TaskService taskService;

    @PutMapping("/updateTask/{id}")
    public ResponseEntity<TaskResponse>updateTask(@PathVariable("id") Integer taskId, @RequestBody TaskRequestBody requestBody){
        taskService.updateTask(taskId,requestBody.stat().name());
        return new ResponseEntity<>(new TaskResponse("Task successfulyy updated"), HttpStatus.OK);
    }




}
