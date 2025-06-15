package com.example.workmaxone.controller;

import com.example.workmaxone.DTO.*;
import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.service.BenchedEmployeeService;
import com.example.workmaxone.service.ProjectService;
import com.example.workmaxone.service.TaskService;
import com.example.workmaxone.service.TeamLeadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/teamLead")
public class TeamLeadController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TeamLeadService teamLeadService;

    @Autowired
    private BenchedEmployeeService benchedEmployeeService;

    @PostMapping("/createProject")
    public ResponseEntity<ProjectResponse> createProject(@AuthenticationPrincipal Jwt jwt,@RequestBody ProjectRequest requestBody){
        int teamLeadId=Integer.valueOf(jwt.getSubject());
        projectService.saveProject(teamLeadId,requestBody.name());
        return new ResponseEntity<>(new ProjectResponse("Successfully created Project"),HttpStatus.CREATED);
    }

//    @PutMapping("/updateProject")//-> move this to Admin in future as Admin can only update the teamLEad like details 

//    public ResponseEntity<ProjectResponse> updateProject(@AuthenticationPrincipal Jwt jwt,@RequestBody ProjectRequest requestBody){
//        int teamLeadId=Integer.valueOf(jwt.getSubject());
//        projectService.updateTask(teamLeadId,requestBody.name());
//        return new ResponseEntity<>(new ProjectResponse("Succussfully updated Project"),HttpStatus.OK);
//    }

    @GetMapping("/details")
    public ResponseEntity<TeamLead> getTeamLeadDetails(@AuthenticationPrincipal Jwt jwt){
        int teamLeadId=Integer.valueOf(jwt.getSubject());
        TeamLead lead=teamLeadService.getDetails(teamLeadId);
        return new ResponseEntity<>(lead,HttpStatus.OK);
    }

    @PutMapping("/editProfile")
    public ResponseEntity<EmployeeBodyResponse> editProfile(@AuthenticationPrincipal Jwt jwt,@RequestBody EmployeeBody requestBody){
        int teamLeadId=Integer.valueOf(jwt.getSubject());
        teamLeadService.updateProfile(teamLeadId,requestBody.name(),requestBody.profileUrl());
        return new ResponseEntity<>(new EmployeeBodyResponse("Successfully updated profile"),HttpStatus.OK);
    }    @PostMapping("/createTask")
    public ResponseEntity<TaskResponse> createTask(@AuthenticationPrincipal Jwt jwt, @RequestBody TaskRequest requestBody) {
        try {
            int teamLeadId = Integer.valueOf(jwt.getSubject());
            
            // Validate request body
            if (requestBody.name() == null || requestBody.name().trim().isEmpty()) {
                return new ResponseEntity<>(new TaskResponse("Task name cannot be empty"), HttpStatus.BAD_REQUEST);
            }
            if (requestBody.skillSet() == null || requestBody.skillSet().isEmpty()) {
                return new ResponseEntity<>(new TaskResponse("SkillSet cannot be empty"), HttpStatus.BAD_REQUEST);
            }
            
            Task task = taskService.createTask(requestBody.name(), requestBody.skillSet(), teamLeadId);
            return new ResponseEntity<>(new TaskResponse("Successfully created task with ID: " + task.getTaskId()), HttpStatus.CREATED);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new TaskResponse("Failed to create task: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/assignTask/{id}")
    public ResponseEntity<TaskAssignResponse> assignTask(@AuthenticationPrincipal Jwt jwt,@PathVariable("id") Integer taskId) {
        try {
            int teamLeadId = Integer.valueOf(jwt.getSubject());
            ResponseEntity<TaskAssignResponse> response = taskService.assignTask(taskId, teamLeadId);
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                new TaskAssignResponse(List.of(), "Failed to assign task: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @GetMapping("/allTaskAssignees")
    public ResponseEntity<List<BenchedEmployee>> allAssignees(@AuthenticationPrincipal Jwt jwt){
        int managerId=Integer.valueOf(jwt.getSubject());
        List<BenchedEmployee> benchedEmployeeList=benchedEmployeeService.getEmployees(managerId);
        return new ResponseEntity<>(benchedEmployeeList,HttpStatus.OK);
    }

    @GetMapping("/allTasks")
    public ResponseEntity<List<Task>> allTask(@AuthenticationPrincipal Jwt jwt){
        int managerId=Integer.valueOf(jwt.getSubject());
        List<Task> getTaskAssigned=taskService.getAllTaskByAssignedBy(managerId);
        return new ResponseEntity<>(getTaskAssigned,HttpStatus.OK);
    }

}
