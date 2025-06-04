package com.example.workmaxone.service;


import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

   private TaskRepository taskRepository;

   public Iterable<Task> getAllTask(){
       return taskRepository.findAll();
   }

   public void createTask(String name, List<String> skillSet,Integer assignedBy){
       Task task=new Task();
       task.setName(name);
       task.setSkillSet(skillSet);
       task.setAssignedBy(assignedBy);
       taskRepository.save(task);
   }

   public void updateTask(int task_id,String status){
       Task task=taskRepository.findById(task_id);
       task.setStatus(status);
       taskRepository.save(task);
   }

   //TO_DO Create delete method to delete task

   public void assignTask(int taskId){
       Task task=taskRepository.findById(taskId);
   }

}
