package com.example.workmaxone.service;

import com.example.workmaxone.entity.Project;
import com.example.workmaxone.entity.Task;
import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.repository.ProjectRepository;
import com.example.workmaxone.repository.TaskRepository;
import com.example.workmaxone.repository.TeamLeadRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TeamLeadService {

    @Autowired
    private TeamLeadRepo teamLeadRepo;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    public void updateProfile(int teamLeadId,String name,String email,String profileUrl,String password){
        TeamLead teamLead=teamLeadRepo.findById(teamLeadId);
        teamLead.setEmployeeName(name);
        teamLead.setEmail(email);
        teamLead.setProfileUrl(profileUrl);
        teamLead.setPassword(password);
        teamLeadRepo.save(teamLead);
    }    public List<Project> getProjectsByTeamLead(int teamLeadId){
        TeamLead teamLead = teamLeadRepo.findById(teamLeadId);
        List<Project> projects = new ArrayList<>();
        if (teamLead != null) {
            Project project = projectRepository.findByManager(teamLead);
            if (project != null) {
                projects.add(project);
            }
        }
        return projects;
    }

    public List<Task> getTasksByTeamLead(int teamLeadId){
        return taskRepository.findByAssignedBy(teamLeadId);
    }
}
