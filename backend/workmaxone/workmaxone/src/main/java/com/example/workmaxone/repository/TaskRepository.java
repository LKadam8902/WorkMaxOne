package com.example.workmaxone.repository;

import com.example.workmaxone.entity.Task;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


public interface TaskRepository extends CrudRepository<Task,Integer> {

    public Iterable<Task> findAll();

    public Task findById(int taskId);

    public List<Task> findByAssignedBy(int managerId);
    
    public List<Task> findByAssignedTo(Integer assignedTo);

}
