package com.example.workmaxone.entity;

import java.util.List;

import jakarta.persistence.*;

@Entity
@PrimaryKeyJoinColumn(name = "employee_id")
public class BenchedEmployee  extends Employee{


    public BenchedEmployee(String employeeName, String email, String password, String profileUrl) {
        super(employeeName, email, password, profileUrl);
        //TODO Auto-generated constructor stub
    }

    public BenchedEmployee(){
    }

    private int benchDuration;

    private List<String>skillSet;
    
    boolean isTaskAssigned;

    public int getBenchDuration() {
        return benchDuration;
    }

    public void setBenchDuration(int benchDuration) {
        this.benchDuration = benchDuration;
    }

    public List<String> getSkillSet() {
        return skillSet;
    }

    public void setSkillSet(List<String> skillSet) {
        this.skillSet = skillSet;
    }

    public boolean isTaskAssigned() {
        return isTaskAssigned;
    }

    public void setTaskAssigned(boolean isTaskAssigned) {
        this.isTaskAssigned = isTaskAssigned;
    }
    
}
