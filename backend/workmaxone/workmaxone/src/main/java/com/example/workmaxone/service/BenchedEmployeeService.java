package com.example.workmaxone.service;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import com.example.workmaxone.repository.EmployeeRepo;
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
    private EmployeeRepo employeeRepo;

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
    }    public List<Task> getTasksForEmployee(String email) {
        try {
            // Find the employee by email
            Optional<Employee> employeeOpt = employeeRepo.findByEmail(email);
            if (!employeeOpt.isPresent()) {
                throw new EmployeeException("Employee not found with email: " + email);
            }

            Employee employee = employeeOpt.get();

            // Find tasks assigned to this employee
            List<Task> tasks = taskRepository.findByAssignedTo(employee.getEmployeeId());
            return tasks != null ? tasks : new ArrayList<>();
        } catch (Exception e) {
            throw new EmployeeException("Error fetching tasks for employee: " + e.getMessage());
        }
    }

    public void addSkillsToEmployee(String email, List<String> newSkills) {
        try {
            // Find the employee by email
            Optional<Employee> employeeOpt = employeeRepo.findByEmail(email);
            if (!employeeOpt.isPresent()) {
                throw new EmployeeException("Employee not found with email: " + email);
            }

            Employee employee = employeeOpt.get();

            // Cast to BenchedEmployee
            if (!(employee instanceof BenchedEmployee)) {
                throw new EmployeeException("Employee is not a benched employee");
            }

            BenchedEmployee benchedEmployee = (BenchedEmployee) employee;
            
            // Get existing skills or create new list
            List<String> currentSkills = benchedEmployee.getSkillSet();
            if (currentSkills == null) {
                currentSkills = new ArrayList<>();
            } else {
                currentSkills = new ArrayList<>(currentSkills); // Create a mutable copy
            }

            // Add new skills (avoid duplicates)
            for (String skill : newSkills) {
                if (!currentSkills.contains(skill.trim())) {
                    currentSkills.add(skill.trim());
                }
            }

            // Update the employee's skill set
            benchedEmployee.setSkillSet(currentSkills);
            benchedEmployeeRepo.save(benchedEmployee);

        } catch (Exception e) {
            throw new EmployeeException("Error adding skills to employee: " + e.getMessage());
        }
    }

    public List<Task> getTasksForEmployeeById(Integer employeeId) {
        try {
            // Find tasks assigned to this employee
            List<Task> tasks = taskRepository.findByAssignedTo(employeeId);
            return tasks != null ? tasks : new ArrayList<>();
        } catch (Exception e) {
            throw new EmployeeException("Error fetching tasks for employee: " + e.getMessage());
        }
    }

    public void addSkillsToEmployeeById(Integer employeeId, List<String> newSkills) {
        try {
            // Find the employee by ID
            Optional<BenchedEmployee> benchedEmployeeOpt = benchedEmployeeRepo.findById(employeeId);
            if (!benchedEmployeeOpt.isPresent()) {
                throw new EmployeeException("Benched employee not found with ID: " + employeeId);
            }

            BenchedEmployee benchedEmployee = benchedEmployeeOpt.get();
            
            // Get existing skills or create new list
            List<String> currentSkills = benchedEmployee.getSkillSet();
            if (currentSkills == null) {
                currentSkills = new ArrayList<>();
            } else {
                currentSkills = new ArrayList<>(currentSkills); // Create a mutable copy
            }

            // Add new skills (avoid duplicates)
            for (String skill : newSkills) {
                if (!currentSkills.contains(skill.trim())) {
                    currentSkills.add(skill.trim());
                }
            }

            // Update the employee's skill set
            benchedEmployee.setSkillSet(currentSkills);
            benchedEmployeeRepo.save(benchedEmployee);

        } catch (Exception e) {
            throw new EmployeeException("Error adding skills to employee: " + e.getMessage());
        }
    }
}
