package com.securevault.service;

import com.securevault.entity.User;

import java.util.List;

public interface EmployeeService {

    User createEmployee(User employee);

    List<User> getAllEmployees();

    User getEmployeeById(Long id);

    User updateEmployee(Long id, User employee);

    void deleteEmployee(Long id);
}
