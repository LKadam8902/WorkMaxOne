package com.example.workmaxone.service;

import com.example.workmaxone.DTO.TaskAssignResponse;
import com.example.workmaxone.DTO.TaskResponse;
import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Project;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.entity.enums.Status;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import com.example.workmaxone.repository.ProjectRepository;
import com.example.workmaxone.repository.TaskRepository;
import com.example.workmaxone.repository.TeamLeadRepo;
import com.example.workmaxone.service.exception.TaskException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.PriorityQueue;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private BenchedEmployeeRepo benchedEmployeeRepo;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamLeadRepo teamLeadRepo;

    public List<Task> getAllTaskByAssignedBy(int assignedBy) {
        return taskRepository.findByAssignedBy(assignedBy);
    }
    public Task createTask(String name, List<String> skillSet, Integer assignedBy) {
        try {
            // Validate input parameters
            if (name == null || name.trim().isEmpty()) {
                throw new TaskException("Task name cannot be null or empty");
            }
            if (skillSet == null || skillSet.isEmpty()) {
                throw new TaskException("SkillSet cannot be null or empty");
            }
            if (assignedBy == null) {
                throw new TaskException("AssignedBy (Team Lead ID) cannot be null");
            }

            // Find team lead
            Optional<TeamLead> teamLeadOpt = teamLeadRepo.findById(assignedBy);
            if (teamLeadOpt.isEmpty()) {
                throw new TaskException("Team lead not found with ID: " + assignedBy);
            }
            
            TeamLead teamLead = teamLeadOpt.get();
            
            // Find project associated with team lead
            Project project = projectRepository.findByManager(teamLead);
            if (project == null) {
                throw new TaskException("No project found for team lead: " + assignedBy + ". Please create a project first.");
            }

            // Create and configure task
            Task task = new Task();
            task.setName(name.trim());
            task.setSkillSet(String.join(",", skillSet));
            task.setAssignedBy(assignedBy);
            task.setProject(project);
            
            // Save task
            Task savedTask = taskRepository.save(task);
            System.out.println("Task created successfully: ID=" + savedTask.getTaskId() + 
                              ", Name=" + savedTask.getName() + 
                              ", SkillSet=" + savedTask.getSkillSet() + 
                              ", AssignedBy=" + savedTask.getAssignedBy());
            return savedTask;
            
        } catch (TaskException e) {
            // Re-throw TaskException as is
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new TaskException("Unable to create task due to unexpected error: " + e.getMessage());
        }
    }

    public void updateTask(int task_id, String status) {
        try {
            Task task = taskRepository.findById(task_id);
            if(status== Status.DONE.name()){
                detachTask(task);
                return;
            }
            task.setStatus(status);
            taskRepository.save(task);
        } catch (Exception e) {
            throw new TaskException("Enable to update task due to this error :" + e.getMessage());
        }
    }

    private void detachTask(Task task) {
        task.setStatus(String.valueOf(Status.DONE));
        Optional<BenchedEmployee> benchedEmployee=benchedEmployeeRepo.findById(task.getAssignedTo());
        benchedEmployee.get().setBenchDate(LocalDateTime.now());
        benchedEmployee.get().setTaskAssigned(false);
        // task.setAssignedTo(null);
        taskRepository.save(task);
        benchedEmployeeRepo.save(benchedEmployee.get());
    }

    // TO_DO Create delete method to delete task

//
public ResponseEntity<TaskAssignResponse> assignTask(int taskId, int teamLeadId) {
    Task optionalTask = taskRepository.findById(taskId);
    if (optionalTask==null) {
        return new ResponseEntity<>(
                new TaskAssignResponse(new ArrayList<>(), "Task with ID " + taskId + " not found."),
                HttpStatus.NOT_FOUND);
    }
    Task task = optionalTask;
    // Convert comma-separated skillSet string to List<String>
    List<String> taskSkillList = new ArrayList<>();
    if (task.getSkillSet() != null && !task.getSkillSet().isEmpty()) {
        taskSkillList = Arrays.asList(task.getSkillSet().split(","));
    }


    List<BenchedEmployee> benchedEmp = benchedEmployeeRepo.findByIsTaskAssignedFalse();
    if (benchedEmp.isEmpty()) {
        return new ResponseEntity<>(
                new TaskAssignResponse(new ArrayList<>(), "There are no Benched Employees available right now."),
                HttpStatus.NOT_FOUND);
    }


    List<Integer> assignedEmployeeIds = findRelevantBenchedEmp(benchedEmp, taskSkillList, taskId, teamLeadId);

    if (assignedEmployeeIds.isEmpty()) {

        return new ResponseEntity<>(
                new TaskAssignResponse(new ArrayList<>(), "No relevant Benched Employee found to assign this task."),
                HttpStatus.NOT_FOUND);
    }

    return new ResponseEntity<>(new TaskAssignResponse(assignedEmployeeIds, "Task assigned successfully."), HttpStatus.OK);
}

    private List<Integer> findRelevantBenchedEmp(List<BenchedEmployee> benchedEmp, List<String> taskSkillList, int taskId, int teamLeadId) {
        List<Integer> bEmp = new ArrayList<>();
        benchedEmp.forEach(be -> be.setBenchDuration((int)calculateBenchedDuration(be)));
        Comparator<BenchedEmployee> comparator = (bEmp1, bEmp2) -> {
            long duration1 = bEmp1.getBenchDuration();
            long duration2 = bEmp2.getBenchDuration();

            int skillMatchCount1 = getSkillMatch(bEmp1.getSkillSet(), taskSkillList);
            int skillMatchCount2 = getSkillMatch(bEmp2.getSkillSet(), taskSkillList);

            int durationComparison = Long.compare(duration2, duration1);
            if (durationComparison != 0) {
                return durationComparison;
            }
            return Integer.compare(skillMatchCount2, skillMatchCount1);
        };

        PriorityQueue<BenchedEmployee> queue = new PriorityQueue<>(comparator);
        queue.addAll(benchedEmp);

        BenchedEmployee bestBenchedEmployee = queue.poll();

        if (bestBenchedEmployee != null) {
            bEmp.add(bestBenchedEmployee.getEmployeeId());

            bestBenchedEmployee.setBenchDuration(0);
            bestBenchedEmployee.setTaskAssigned(true);
            bestBenchedEmployee.setBenchedDate(null);
            benchedEmployeeRepo.save(bestBenchedEmployee);

            Task task = taskRepository.findById(taskId);
            if (task!=null) {
                Task taskToUpdate = task;
                taskToUpdate.setAssignedDate(LocalDateTime.now());
                taskToUpdate.setAssignedTo(bestBenchedEmployee.getEmployeeId());
                taskToUpdate.setStatus("In Progress");
                taskToUpdate.setAssignedBy(teamLeadId);
                taskRepository.save(taskToUpdate);
            } else {
                System.err.println("Error: Task " + taskId + " not found when trying to assign.");
            }
        }
        return bEmp;
    }

    private int getSkillMatch(List<String> skillSet, List<String> taskSkillList) {
        if (skillSet == null || taskSkillList == null || skillSet.isEmpty() || taskSkillList.isEmpty()) {
            return 0;
        }
        List<String> tempSkillSet = new ArrayList<>(skillSet);
        tempSkillSet.retainAll(taskSkillList);
        return tempSkillSet.size();
    }

    public long calculateBenchedDuration(BenchedEmployee benchedEmployee) {

        if (benchedEmployee == null || benchedEmployee.getBenchedDate() == null) {
            return 0;
        }
        LocalDateTime benchDateTime = benchedEmployee.getBenchedDate();
        LocalDateTime now = LocalDateTime.now();

        Duration duration = Duration.between(benchDateTime, now);
        return duration.toDays();
    }

}
