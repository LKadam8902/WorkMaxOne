package com.example.workmaxone.controller;

import com.example.workmaxone.DTO.*;
import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.TeamLeadRepo;
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
import java.util.Map;

@RestController
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

    @GetMapping("/hello")
    public String greetings(){
        return "Hello World";
    }    @PostMapping("/createProject")
    public ResponseEntity<?> createProject(@AuthenticationPrincipal Jwt jwt,@RequestBody ProjectRequest requestBody){
        try {
            int teamLeadId=Integer.valueOf(jwt.getSubject());
            System.out.println("Creating project for team lead ID: " + teamLeadId + " with name: " + requestBody.name());
            projectService.saveProject(teamLeadId,requestBody.name());
            return new ResponseEntity<>(new ProjectResponse("Successfully created Project"),HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating project: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("message", "Error creating project: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
    }    @PostMapping("/createTask")
    public ResponseEntity<?> createTask(@AuthenticationPrincipal Jwt jwt, @RequestBody TaskRequest requestBody) {
        try {
            int teamLeadId = Integer.valueOf(jwt.getSubject());
            taskService.createTask(requestBody.name(),requestBody.skillSet(),teamLeadId);
            return new ResponseEntity<>(new TaskResponse("Successfully created task"),HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("message", "Error creating task: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/assignTask")
    public ResponseEntity<?> assignTask(@AuthenticationPrincipal Jwt jwt,Integer taskId) {
        try {
            int teamLeadId = Integer.valueOf(jwt.getSubject());
            taskService.assignTask(taskId, teamLeadId);
            return new ResponseEntity<>(new TaskResponse("Task assigned successfully"),HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("message", "Error assigning task: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }@GetMapping("/allTaskAssignees")
    public ResponseEntity<List<BenchedEmployee>> allAssignees(@AuthenticationPrincipal Jwt jwt){
        int managerId=Integer.valueOf(jwt.getSubject());
        List<BenchedEmployee> benchedEmployeeList=benchedEmployeeService.getEmployees(managerId);
        return new ResponseEntity<>(benchedEmployeeList,HttpStatus.OK);
    }

    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(@AuthenticationPrincipal Jwt jwt){
        try {
            int teamLeadId = Integer.valueOf(jwt.getSubject());
            var projects = teamLeadService.getProjectsByTeamLead(teamLeadId);
            return new ResponseEntity<>(projects, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching projects: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/tasks")
    public ResponseEntity<?> getTasks(@AuthenticationPrincipal Jwt jwt){
        try {
            int teamLeadId = Integer.valueOf(jwt.getSubject());
            var tasks = teamLeadService.getTasksByTeamLead(teamLeadId);
            return new ResponseEntity<>(tasks, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching tasks: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
