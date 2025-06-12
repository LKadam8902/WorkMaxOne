package com.example.workmaxone.repository;

import java.util.List;
import java.util.Optional;

import com.example.workmaxone.entity.BenchedEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.example.workmaxone.entity.BenchedEmployee;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.TeamLead;

@Repository
public interface BenchedEmployeeRepo extends JpaRepository<BenchedEmployee,Integer> {

   // public  Optional<Employee> findByEmail(String useremail);

   public List<BenchedEmployee> findByIsTaskAssignedFalse();

   // public BenchedEmployee findById(int benchempId);

}
