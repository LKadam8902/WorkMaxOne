package com.example.workmaxone.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;

@Entity
@PrimaryKeyJoinColumn(name = "employee_id")
public class TeamLead extends Employee {

    public TeamLead(String employeeName, String email, String password, String profileUrl) {
        super(employeeName, email, password, profileUrl);
        //TODO Auto-generated constructor stub
    }
    public TeamLead(){
        
    }

    @OneToOne
    private Project project;


    public Project getProject() {
        return project;
    }


    public void setProject(Project project) {
        this.project = project;
    }

    
}
