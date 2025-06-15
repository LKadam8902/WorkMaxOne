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
    }

    public void saveProject(Integer teamLeadId,String projectName){
       try {
           Optional<TeamLead> teamLeadOpt = teamLeadRepository.findById(teamLeadId);
           if (teamLeadOpt.isEmpty() || teamLeadOpt.get() == null) {
               throw new ProjectException("Unable to find team lead :" + teamLeadId);
           }
           TeamLead teamLead = teamLeadOpt.get();
           if (teamLead.getProject() != null) {
               throw new ProjectException("Team lead already has a project. Only one project per team lead is allowed.");
           }
           Project project = new Project();
           project.setProjectName(projectName);
           project.setNoOfMembers(1); // Set default value as requested
           project.setManager(teamLead);
           projectRepository.save(project);
           teamLead.setProject(project);
           teamLeadRepository.save(teamLead);
       }catch(Exception e){
           throw new ProjectException("Enable to add project due to this error :"+e.getMessage());
       }
    }

}
