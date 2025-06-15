package com.example.workmaxone.entity;

import com.example.workmaxone.entity.enums.Status;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int taskId;

    private String name;

    private String skillSet;

    private Integer  assignedTo;

    private Integer assignedBy;

    private Integer extraMemberReq; // Add the missing field

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    private String status;



    private LocalDateTime assignedDate;

    public Task(){
        assignedTo=null;
        status= Status.TO_DO.toString();
    }


    public Task(String name, String skillSet, int teamLeadId) {
        this.name = name;
        this.skillSet = skillSet;
        this.assignedBy=teamLeadId;
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

    public String getSkillSet() {
        return skillSet;
    }

    public void setSkillSet(String skillSet) {
        this.skillSet = skillSet;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Integer assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Integer getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(Integer assignedBy) {
        this.assignedBy = assignedBy;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public LocalDateTime getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDateTime assignedDate) {
        this.assignedDate = assignedDate;
    }

    public Integer getExtraMemberReq() {
        return extraMemberReq;
    }

    public void setExtraMemberReq(Integer extraMemberReq) {
        this.extraMemberReq = extraMemberReq;
    }

}
