package com.example.workmaxone.entity;

import jakarta.persistence.*;

import java.util.List;


@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int projectId;

    private String projectName;

    private int noOfMembers;

    //private  TeamLead Manager;

    @OneToMany
    private List<Task> taskList;

    private List<String> techStack;

    //private List<Team> teamMembers;

    public Project(String projectName, int noOfMembers, List<Task> taskList, List<String> techStack) {
        this.projectName = projectName;
        this.noOfMembers = noOfMembers;
        this.taskList = taskList;
        this.techStack = techStack;
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

    public int getNoOfMembers() {
        return noOfMembers;
    }

    public void setNoOfMembers(int noOfMembers) {
        this.noOfMembers = noOfMembers;
    }

    public List<Task> getTaskList() {
        return taskList;
    }

    public void setTaskList(List<Task> taskList) {
        this.taskList = taskList;
    }

    public List<String> getTechStack() {
        return techStack;
    }

    public void setTechStack(List<String> techStack) {
        this.techStack = techStack;
    }
}
