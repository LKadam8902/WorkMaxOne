package com.example.workmaxone.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int taskId;

    private String name;

    private List<String> skillSet;


    @ManyToOne
    private Task task;

    private Boolean isAssigned;

    private int extraMemberReq;


    public Task(String name, List<String> skillSet, Boolean isAssigned, int extraMemberReq) {
        this.name = name;
        this.skillSet = skillSet;
        this.isAssigned = isAssigned;
        this.extraMemberReq = extraMemberReq;
    }

    public int getTaskId() {
        return taskId;
    }

    public void setTaskId(int taskId) {
        this.taskId = taskId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getSkillSet() {
        return skillSet;
    }

    public void setSkillSet(List<String> skillSet) {
        this.skillSet = skillSet;
    }

    public Boolean getAssigned() {
        return isAssigned;
    }

    public void setAssigned(Boolean assigned) {
        isAssigned = assigned;
    }

    public int getExtraMemberReq() {
        return extraMemberReq;
    }

    public void setExtraMemberReq(int extraMemberReq) {
        this.extraMemberReq = extraMemberReq;
    }
}
