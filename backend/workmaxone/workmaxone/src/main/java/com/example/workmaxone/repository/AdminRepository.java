package com.example.workmaxone.repository;

import com.example.workmaxone.entity.Admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface AdminRepository extends JpaRepository<Admin,Integer> {

    public Admin findAdminAll();


}
