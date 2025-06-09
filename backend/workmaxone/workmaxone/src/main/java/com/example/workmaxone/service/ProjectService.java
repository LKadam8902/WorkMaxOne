package com.example.workmaxone.service;


import com.example.workmaxone.entity.Project;
import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.repository.ProjectRepository;
import com.example.workmaxone.service.exception.ProjectException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.PropertyResolverExtensionsKt;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

    public void saveProject(Integer teamLeadId,String projectName){
       try {
           Project project = new Project();
           project.setProjectName(projectName);
//           Optional<Project> teamLead=projectRepository.findById(teamLeadId);
//           if (teamLead==null){
//               throw new ProjectException("enable to find team lead :"+teamLeadId);
//           }else {
//               project.setManager(teamLead);
//           }
           projectRepository.save(project);
       }catch(Exception e){
           throw new ProjectException("Enable to add project due to this error :"+e.getMessage());
       }
    }




}
