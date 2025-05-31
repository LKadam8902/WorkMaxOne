package com.example.workmaxone.service;


import com.example.workmaxone.entity.Task;
import com.example.workmaxone.repository.TaskRepository;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

   private TaskRepository taskRepository;

   public Iterable<Task> getAllTask(){
       return taskRepository.findAll();
   }

   public void assignTask(int taskId){
       Task task=taskRepository.findById(taskId);
   }

}
