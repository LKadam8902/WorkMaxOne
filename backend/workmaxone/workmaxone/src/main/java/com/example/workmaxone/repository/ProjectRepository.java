package com.example.workmaxone.repository;

import com.example.workmaxone.entity.Project;
import org.springframework.data.repository.CrudRepository;

public interface ProjectRepository extends CrudRepository<Project,Integer> {

    public Iterable<Project> findAll();

    public Project findById(int projectId);

}
