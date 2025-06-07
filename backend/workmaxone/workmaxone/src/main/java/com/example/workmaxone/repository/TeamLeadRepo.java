package com.example.workmaxone.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.workmaxone.entity.Employee;

@Repository
public interface TeamLeadRepo extends JpaRepository<Employee,Integer> {

   public  Optional<Employee> findByEmail(String useremail);

}