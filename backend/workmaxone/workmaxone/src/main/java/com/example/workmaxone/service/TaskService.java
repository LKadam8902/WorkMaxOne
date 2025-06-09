package com.example.workmaxone.service;


import com.example.workmaxone.entity.Project;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.ProjectRepository;
import com.example.workmaxone.repository.TaskRepository;
import com.example.workmaxone.service.exception.TaskException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

   @Autowired
   private TaskRepository taskRepository;

   @Autowired
   private ProjectRepository projectRepository;


   public Iterable<Task> getAllTask(){
       return taskRepository.findAll();
   }

   public Task createTask(String name, List<String> skillSet,Integer assignedBy,Integer projectId){
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
      }catch(Exception e){
          throw new TaskException("Unable to create new task due to : "+ e.getMessage());
      }
   }

   public void updateTask(int task_id,String status){
      try {
          Task task = taskRepository.findById(task_id);
          task.setStatus(status);
          taskRepository.save(task);
      }catch(Exception e){
          throw new TaskException("Enable to update task due to this error :"+ e.getMessage());
      }
   }

   //TO_DO Create delete method to delete task

   public Task assignTask(int taskId){
//       try{
//           Task task=taskRepository.findById(taskId);
//
//       }catch(){
//
//       }
       Task task=new Task();
       return task;
   }

}
