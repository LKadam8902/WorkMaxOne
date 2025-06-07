package com.example.workmaxone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.workmaxone.entity.Employee;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee,Integer> {
    
    
}
