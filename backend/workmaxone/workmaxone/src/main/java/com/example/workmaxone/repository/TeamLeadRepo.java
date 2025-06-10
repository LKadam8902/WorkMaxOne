package com.example.workmaxone.repository;

import java.util.Optional;

import com.example.workmaxone.entity.TeamLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.workmaxone.entity.Employee;

@Repository
public interface TeamLeadRepo extends JpaRepository<TeamLead,Integer> {

   public TeamLead findById(int teamLeadId);

   public  Optional<Employee> findByEmail(String useremail);

}