package com.example.workmaxone.service;

import com.example.workmaxone.DTO.TaskAssignResponse;
import com.example.workmaxone.DTO.TaskResponse;
import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Project;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.BenchedEmployeeRepo;
import com.example.workmaxone.repository.ProjectRepository;
import com.example.workmaxone.repository.TaskRepository;
import com.example.workmaxone.service.exception.TaskException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    public Iterable<Task> getAllTask() {
        return taskRepository.findAll();
    }

    public Task createTask(String name, List<String> skillSet, Integer assignedBy, Integer projectId) {
        try {
            Task task = new Task();
            task.setName(name);
            task.setSkillSet(skillSet);
            task.setAssignedBy(assignedBy);
            Optional<Project> project = projectRepository.findById(projectId);
            if (project.isPresent()) {
                task.setProject(project.get());
            } else {
                throw new TaskException("Project with ID " + projectId + " not found.");
            }
            return taskRepository.save(task);
        } catch (Exception e) {
            throw new TaskException("Unable to create new task due to : " + e.getMessage());
        }
    }

    public void updateTask(int task_id, String status) {
        try {
            Task task = taskRepository.findById(task_id);
            task.setStatus(status);
            taskRepository.save(task);
        } catch (Exception e) {
            throw new TaskException("Enable to update task due to this error :" + e.getMessage());
        }
    }

    // TO_DO Create delete method to delete task

    public ResponseEntity<TaskAssignResponse> assignTask(int taskId ,int teamLeadId ) {
        List<Integer> beId = new ArrayList<>();
        Task task = taskRepository.findById(taskId);
        List<String> taskSkillList = task.getSkillSet();
        List<BenchedEmployee> benchedEmp = benchedEmployeeRepo.findByIsTaskAssignedFalse();
        if (benchedEmp.isEmpty()) {
            return new ResponseEntity<>(
                    new TaskAssignResponse(beId, "There is no Benched Employee to assign this task right now"),
                    HttpStatus.NOT_FOUND);
        }
        beId = findRelevantBenchedEmp(benchedEmp, taskSkillList,taskId,teamLeadId);

        return new ResponseEntity<>(new TaskAssignResponse(beId, "Task Assign Successfully "), HttpStatus.OK);
    }

    private List<Integer> findRelevantBenchedEmp(List<BenchedEmployee> benchedEmp, List<String> taskSkillList,int taskId,int teamLeadId) {
        List<Integer> bEmp = new ArrayList<>();

        Comparator<BenchedEmployee> comparator = (bEmp1, bEmp2) -> {
            int skillMatchCount1 = getSkillMatch(bEmp1.getSkillSet(), taskSkillList);
            int skillMatchCount2 = getSkillMatch(bEmp2.getSkillSet(), taskSkillList);

            long duration1 = bEmp1.getBenchDuration();
            long duration2 = bEmp2.getBenchDuration();

            if (duration1 != duration2) {
                return Long.compare(duration1, duration2);
            } else {
                return Integer.compare(skillMatchCount1, skillMatchCount2);
            }
        };
        PriorityQueue<BenchedEmployee> queue = new PriorityQueue<>(comparator.reversed());

        BenchedEmployee benchedEmployee = queue.peek();
        if (benchedEmployee != null) {
            bEmp.add(benchedEmployee.getEmployeeId());

            benchedEmployee.setBenchDuration(0);
            benchedEmployee.setTaskAssigned(true);
            Task task = taskRepository.findById(taskId);

            task.setAssignedTo(benchedEmployee.getEmployeeId());
            task.setStatus("In Progress");
            task.setAssignedBy(teamLeadId);
        }

        return bEmp;
    }

    private int getSkillMatch(List<String> skillSet, List<String> taskSkillList) {

        int count = 0;
        int limit = Math.min(skillSet.size(), taskSkillList.size());

        for (int skill = 0; skill < limit; skill++) {
            if (skillSet.get(skill) == taskSkillList.get(skill)) {
                count++;
            }
        }
        return count;
    }

}
