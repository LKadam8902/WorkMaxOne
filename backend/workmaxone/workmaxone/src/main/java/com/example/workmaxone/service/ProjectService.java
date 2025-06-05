package com.example.workmaxone.service;


import com.example.workmaxone.entity.Project;
import com.example.workmaxone.repository.ProjectRepository;
import com.example.workmaxone.service.exception.ProjectException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.PropertyResolverExtensionsKt;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public Iterable<Project> getAllProject(){
        return projectRepository.findAll();
    }

    public Project getProjectById(int projectId){

        Project project= projectRepository.findById(projectId);
        if(project==null){
            throw new ProjectException("Project with project id :"+projectId+ " doesnt exist");
        }else{
            return project;
        }
    }

    public void saveProject(String projectName){
       try {
           Project project = new Project();
           project.setProjectName(projectName);
           projectRepository.save(project);
       }catch(Exception e){
           throw new ProjectException("Enable to add project due to this error :"+e.getMessage());
       }
    }




}
