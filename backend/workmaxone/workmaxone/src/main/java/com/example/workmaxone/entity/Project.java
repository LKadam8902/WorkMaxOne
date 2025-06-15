package com.example.workmaxone.entity;

import jakarta.persistence.*;

import java.util.List;


@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int projectId;

    private String projectName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private  TeamLead manager;    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> taskList;

    //private List<String> techStack;

    //private List<Team> teamMembers;

    private int noOfMembers;

    public Project(){
    }    public Project(String projectName, int noOfMembers, List<Task> taskList, List<String> techStack) {
        this.projectName = projectName;
        this.taskList = taskList;
        this.noOfMembers = noOfMembers;
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
    }    public List<Task> getTaskList() {
        return taskList;
    }

    public void setTaskList(List<Task> taskList) {
        this.taskList = taskList;
    }

    public TeamLead getManager() {
        return manager;
    }

    public void setManager(TeamLead manager) {
        this.manager = manager;
    }    public int getNoOfMembers() {
        return noOfMembers;
    }

    public void setNoOfMembers(int noOfMembers) {
        this.noOfMembers = noOfMembers;
    }


}
