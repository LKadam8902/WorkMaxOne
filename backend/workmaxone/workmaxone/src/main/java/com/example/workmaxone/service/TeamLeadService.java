package com.example.workmaxone.service;

import com.example.workmaxone.entity.TeamLead;
import com.example.workmaxone.repository.TeamLeadRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TeamLeadService {

    @Autowired
    private TeamLeadRepo teamLeadRepo;

    public void updateProfile(int teamLeadId,String name,String profileUrl){
        TeamLead teamLead=teamLeadRepo.findById(teamLeadId);
        teamLead.setEmployeeName(name);
        teamLead.setProfileUrl(profileUrl);
        teamLeadRepo.save(teamLead);
    }

    public TeamLead getDetails(int teamLead){
        return teamLeadRepo.findById(teamLead);
    }


}
