package com.example.workmaxone.controller;

import com.example.workmaxone.DTO.TaskResponse;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.TaskRepository;
import com.example.workmaxone.service.BenchedEmployeeService;
import com.example.workmaxone.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/benchEmployee")
@CrossOrigin(origins = "http://localhost:4200")
public class BenchedEmployeeController {    @Autowired
    private TaskService taskService;

    @Autowired
    private BenchedEmployeeService benchedEmployeeService;

    @Autowired
    private TaskRepository taskRepository;@GetMapping("/tasks")
    public ResponseEntity<List<Task>> getTasks() {
        try {
            // Get current authenticated user's ID from JWT token subject
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String employeeId = auth.getName(); // This is the subject from JWT (employee ID)
            
            List<Task> tasks = benchedEmployeeService.getTasksForEmployeeById(Integer.parseInt(employeeId));
            return new ResponseEntity<>(tasks, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/addSkills")
    public ResponseEntity<TaskResponse> addSkills(@RequestBody Map<String, List<String>> request) {
        try {
            // Get current authenticated user's ID from JWT token subject
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String employeeId = auth.getName(); // This is the subject from JWT (employee ID)
            
            List<String> skillSet = request.get("skillSet");
            benchedEmployeeService.addSkillsToEmployeeById(Integer.parseInt(employeeId), skillSet);
            
            return new ResponseEntity<>(new TaskResponse("Skills added successfully"), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new TaskResponse("Failed to add skills: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/updateTask/{id}")
    public ResponseEntity<TaskResponse> updateTaskStatus(@PathVariable("id") Integer taskId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            taskService.updateTask(taskId, status);
            return new ResponseEntity<>(new TaskResponse("Task status updated successfully"), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new TaskResponse("Failed to update task status: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    // TEMPORARY TEST ENDPOINT - Remove after testing
    @PostMapping("/createSampleTasks")
    public ResponseEntity<TaskResponse> createSampleTasks() {
        try {
            // Create some sample tasks assigned to employee ID 10 (the benched employee)
            Task task1 = new Task();
            task1.setName("Frontend Development Task");
            task1.setSkillSet(List.of("JavaScript", "React", "CSS"));
            task1.setAssignedTo(10);
            task1.setAssignedBy(1);
            task1.setStatus("TO_DO");
            taskRepository.save(task1);

            Task task2 = new Task();
            task2.setName("Backend API Development");
            task2.setSkillSet(List.of("Java", "Spring Boot", "Database"));
            task2.setAssignedTo(10);
            task2.setAssignedBy(1);
            task2.setStatus("IN_PROGRESS");
            taskRepository.save(task2);

            return new ResponseEntity<>(new TaskResponse("Sample tasks created successfully"), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new TaskResponse("Failed to create sample tasks: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
