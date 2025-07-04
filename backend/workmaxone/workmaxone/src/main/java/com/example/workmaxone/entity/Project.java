package com.example.workmaxone.entity;

import jakarta.persistence.*;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;


@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int projectId;

    private String projectName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private  TeamLead manager;

    @OneToMany
    @JsonManagedReference
    @Column(name = "taskId")
    private List<Task> taskId;

    //private List<String> techStack;

    //private List<Team> teamMembers;

    public Project(){
    }

    public Project(String projectName, int noOfMembers, List<Task> taskList, List<String> techStack) {
        this.projectName = projectName;
        this.taskId = taskList;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public List<Task> getTaskList() {
        return taskId;
    }

    public void setTaskList(List<Task> taskList) {
        this.taskId = taskList;
    }

    public TeamLead getManager() {
        return manager;
    }

    public void setManager(TeamLead manager) {
        this.manager = manager;
    }

    public List<Task> getTaskId() {
        return taskId;
    }

    public void setTaskId(List<Task> taskId) {
        this.taskId = taskId;
    }


}
