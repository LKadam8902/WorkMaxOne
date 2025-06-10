package com.example.workmaxone.service;

import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.repository.TeamLeadRepo;
import org.springframework.beans.factory.annotation.Autowired;

public class TeamLeadService {

    @Autowired
    private TeamLeadRepo teamLeadRepo;

    public void updateProfile(int teamLeadId,String name,String email,String profileUrl,String password){
        TeamLead teamLead=teamLeadRepo.findById(teamLeadId);
        teamLead.setEmployeeName(name);
        teamLead.setEmail(email);
        teamLead.setProfileUrl(profileUrl);
        teamLead.setPassword(password);
        teamLeadRepo.save(teamLead);
    }
}
