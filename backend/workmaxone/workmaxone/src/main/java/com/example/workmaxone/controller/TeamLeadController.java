package com.example.workmaxone.controller;

import com.example.workmaxone.payload.ProjectRequest;
import com.example.workmaxone.payload.ProjectResponse;
import com.example.workmaxone.payload.TaskRequest;
import com.example.workmaxone.payload.TaskResponse;
import com.example.workmaxone.service.ProjectService;
import com.example.workmaxone.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

//    @PostMapping("/createProject")
//    public ResponseEntity<ProjectResponse> createProject(, @RequestBody ProjectRequest requestBody){
//        var porject=projectService.saveProject();
//    }

    @PostMapping("/createTask/{id}")
    public ResponseEntity<TaskResponse> createTask(@PathVariable("id") Integer teamLeadId, @RequestBody TaskRequest requestBody){
      var task=taskService.createTask(requestBody.name(),requestBody.skillSet(),teamLeadId, requestBody.projectId());
      return new ResponseEntity<>(new TaskResponse("Successfully created task"), HttpStatus.CREATED);
    }

    @PutMapping("/assignTask")
    public ResponseEntity<TaskResponse> assignTask(Integer taskId){
        var task=taskService.assignTask(taskId);
        return new ResponseEntity<>(new TaskResponse("Successfully assigned task"),HttpStatus.OK);
    }

}
