package com.example.workmaxone.entity;

import com.example.workmaxone.entity.enums.Status;
import jakarta.persistence.*;

import java.util.List;
import java.util.Optional;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int taskId;

    private String name;

    private List<String> skillSet;

    private Integer  assignedTo;

    private Integer assignedBy;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Optional<Project> project;

    private String status;

    public Task(){
        assignedTo=null;
        status= Status.TO_DO.toString();
    }


    public Task(String name, List<String> skillSet, int teamLeadId) {
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

    public List<String> getSkillSet() {
        return skillSet;
    }

    public void setSkillSet(List<String> skillSet) {
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

    public Optional<Project> getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = Optional.ofNullable(project);
    }

}
