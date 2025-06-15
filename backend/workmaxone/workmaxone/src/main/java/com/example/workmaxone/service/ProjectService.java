package com.example.workmaxone.service;


import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Project;
import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.repository.ProjectRepository;
import com.example.workmaxone.repository.TeamLeadRepo;
import com.example.workmaxone.service.exception.ProjectException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.PropertyResolverExtensionsKt;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamLeadRepo teamLeadRepository;

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
    }    public void saveProject(Integer teamLeadId,String projectName){
       try {
           Optional<TeamLead> teamLeadOpt=teamLeadRepository.findById(teamLeadId);
           if (!teamLeadOpt.isPresent()){
               throw new ProjectException("Unable to find team lead: " + teamLeadId);
           }
           
           TeamLead teamLead = teamLeadOpt.get();
           
           // Check if team lead already has a project
           if (teamLead.getProject() != null) {
               // Update existing project name instead of creating a new one
               Project existingProject = teamLead.getProject();
               existingProject.setProjectName(projectName);
               projectRepository.save(existingProject);
               return;
           }
           
           Project project = new Project();
           project.setProjectName(projectName);
           project.setNoOfMembers(0); // Set default value for no_of_members
           project.setManager(teamLead);
           
           Project savedProject = projectRepository.save(project);
           teamLead.setProject(savedProject);
           teamLeadRepository.save(teamLead);
       }catch(Exception e){
           throw new ProjectException("Unable to add project due to this error: "+e.getMessage());
       }
    }

}
