package com.example.workmaxone.repository;

import com.example.workmaxone.entity.Project;
import com.example.workmaxone.entity.TeamLead;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ProjectRepository extends CrudRepository<Project,Integer> {

    public Iterable<Project> findAll();

    public Project findById(int projectId);

    public Project findByManager(Optional<TeamLead> manager);

}
