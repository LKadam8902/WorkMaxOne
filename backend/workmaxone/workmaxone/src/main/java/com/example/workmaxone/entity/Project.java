package com.example.workmaxone.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;


@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int projectId;    private String projectName;

    @Column(name = "no_of_members")
    private Integer noOfMembers;    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonBackReference
    private  TeamLead manager;    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @JsonManagedReference
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
    }    public void setManager(TeamLead manager) {
        this.manager = manager;
    }

    public List<Task> getTaskId() {
        return taskId;
    }

    public void setTaskId(List<Task> taskId) {
        this.taskId = taskId;
    }

    public Integer getNoOfMembers() {
        return noOfMembers;
    }

    public void setNoOfMembers(Integer noOfMembers) {
        this.noOfMembers = noOfMembers;
    }


}
