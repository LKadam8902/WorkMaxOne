package com.example.workmaxone.controller;

import com.example.workmaxone.DTO.ProjectRequest;
import com.example.workmaxone.DTO.ProjectResponse;
import com.example.workmaxone.DTO.TaskRequest;
import com.example.workmaxone.DTO.TaskResponse;
import com.example.workmaxone.service.ProjectService;
import com.example.workmaxone.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teamLead")
public class TeamLeadController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private ProjectService projectService;
    @GetMapping("/hello")
    public String greetings(){
        return "Hello World";
    }

    @PostMapping("/createProject")
    public ResponseEntity<ProjectResponse> createProject(@AuthenticationPrincipal Jwt jwt,@RequestBody ProjectRequest requestBody){
//        int teamLeadId=Integer.valueOf(jwt.getSubject());
//        projectService.saveProject(requestBody.name());
        return new ResponseEntity<>(new ProjectResponse("Seccessfully created Project"),HttpStatus.CREATED);
    }

    @PostMapping("/createTask")
    public ResponseEntity<TaskResponse> createTask(@AuthenticationPrincipal Jwt jwt, @RequestBody TaskRequest requestBody){
      int teamLeadId=Integer.valueOf(jwt.getSubject());
      var task=taskService.createTask(requestBody.name(),requestBody.skillSet(),teamLeadId, requestBody.projectId());
      return new ResponseEntity<>(new TaskResponse("Successfully created task"), HttpStatus.CREATED);
    }

    @PutMapping("/assignTask")
    public ResponseEntity<TaskResponse> assignTask(Integer taskId){
        var task=taskService.assignTask(taskId);
        return new ResponseEntity<>(new TaskResponse("Successfully assigned task"),HttpStatus.OK);
    }

}
