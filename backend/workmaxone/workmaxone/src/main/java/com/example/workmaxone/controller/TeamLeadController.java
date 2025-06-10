package com.example.workmaxone.controller;

import com.example.workmaxone.DTO.*;
import com.example.workmaxone.repository.TeamLeadRepo;
import com.example.workmaxone.service.ProjectService;
import com.example.workmaxone.service.TaskService;
import com.example.workmaxone.service.TeamLeadService;
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

    @Autowired
    private TeamLeadService teamLeadService;

    @GetMapping("/hello")
    public String greetings(){
        return "Hello World";
    }

    @PostMapping("/createProject")
    public ResponseEntity<ProjectResponse> createProject(@AuthenticationPrincipal Jwt jwt,@RequestBody ProjectRequest requestBody){
        int teamLeadId=Integer.valueOf(jwt.getSubject());
        projectService.saveProject(teamLeadId,requestBody.name());
        return new ResponseEntity<>(new ProjectResponse("Successfully created Project"),HttpStatus.CREATED);
    }

//    @PutMapping("/updateProject")
//    public ResponseEntity<ProjectResponse> updateProject(@AuthenticationPrincipal Jwt jwt,@RequestBody ProjectRequest requestBody){
//        int teamLeadId=Integer.valueOf(jwt.getSubject());
//        projectService.updateTask(teamLeadId,requestBody.name());
//        return new ResponseEntity<>(new ProjectResponse("Succussfully updated Project"),HttpStatus.OK);
//    }

    @PutMapping("/editProfile")
    public ResponseEntity<EmployeeBodyResponse> editProfile(@AuthenticationPrincipal Jwt jwt,@RequestBody EmployeeBody requestBody){
        int teamLeadId=Integer.valueOf(jwt.getSubject());
        teamLeadService.updateProfile(teamLeadId,requestBody.name(),requestBody.email(),requestBody.profileUrl(),requestBody.password());
        return new ResponseEntity<>(new EmployeeBodyResponse("Successfully updated profile"),HttpStatus.OK);
    }

    @PostMapping("/createTask")
    public ResponseEntity<TaskResponse> createTask(@AuthenticationPrincipal Jwt jwt, @RequestBody TaskRequest requestBody){
      int teamLeadId=Integer.valueOf(jwt.getSubject());
  
    @PutMapping("/assignTask")
    public ResponseEntity<TaskResponse> assignTask(@AuthenticationPrincipal Jwt jwt,Integer taskId){
        int teamLeadId=Integer.valueOf(jwt.getSubject());
        var task=taskService.assignTask(taskId,teamLeadId); 

}
