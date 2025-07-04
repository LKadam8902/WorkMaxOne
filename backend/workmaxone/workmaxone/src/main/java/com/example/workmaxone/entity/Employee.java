package com.example.workmaxone.entity;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int employee_id;

    private String employeeName;

    @Column(unique=true)
    private String email;

    private String password;

    private String profileUrl;


    @Column(name = "is_aprooved")

    private boolean isAprooved;

    public boolean isAprooved() {
        return isAprooved;
    }

    public void setAprooved(boolean isAprooved) {
        this.isAprooved = isAprooved;
    }

    public int getEmployeeId() {
        return employee_id;
    }

    public Employee(String employeeName, String email, String password, String profileUrl) {
        this.employeeName = employeeName;
        this.email = email;
        this.password = password;
        this.profileUrl = profileUrl;
    }

    public Employee() {
        //TODO Auto-generated constructor stub
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getpassword() {
        return password;
    }

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
    }

}
