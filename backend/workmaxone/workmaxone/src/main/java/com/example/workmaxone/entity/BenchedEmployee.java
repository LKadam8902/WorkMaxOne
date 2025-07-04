package com.example.workmaxone.entity;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import jakarta.persistence.*;

@Entity
@PrimaryKeyJoinColumn(name = "employee_id")
public class BenchedEmployee  extends Employee{


    public BenchedEmployee(String employeeName, String email, String password, String profileUrl) {
        super(employeeName, email, password, profileUrl);
    }

    public BenchedEmployee(){
        benchedDate= LocalDateTime.now();
    }

    private LocalDateTime benchedDate;


    private int benchDuration;

    private List<String>skillSet;
    
    boolean isTaskAssigned;

    public LocalDateTime getBenchDate() {
        return benchedDate;
    }

    public void setBenchDate(LocalDateTime benchDate) {
        this.benchedDate = benchedDate;
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

    public LocalDateTime getBenchedDate() {
        return benchedDate;
    }

    public void setBenchedDate(LocalDateTime benchedDate) {
        this.benchedDate = benchedDate;
    }

    public int getBenchDuration() {
        return benchDuration;
    }

    public void setBenchDuration(int benchDuration) {
        this.benchDuration = benchDuration;
    }
    
}
