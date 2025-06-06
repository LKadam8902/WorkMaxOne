package com.example.workmaxone.repository;

import com.example.workmaxone.entity.Admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface AdminRepository extends CrudRepository<Admin,Integer> {

    public List<Admin> findAll();


}
