package com.example.workmaxone.service;


import com.example.workmaxone.entity.Project;
import com.example.workmaxone.repository.ProjectRepository;
import org.springframework.core.env.PropertyResolverExtensionsKt;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

    private ProjectRepository projectRepository;

    public Iterable<Project> getAllProject(){
        return projectRepository.findAll();
    }

    public Project getProjectById(int projectId){
        return projectRepository.findById(projectId);
    }
}
