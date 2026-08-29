package com.securevault.service;

import com.securevault.entity.User;
import com.securevault.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final UserRepository userRepository;

    public EmployeeServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createEmployee(User employee) {
        return userRepository.save(employee);
    }

    @Override
    public List<User> getAllEmployees() {
        return userRepository.findAll();
    }

    @Override
    public User getEmployeeById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    @Override
    public User updateEmployee(Long id, User employee) {
        User existing = getEmployeeById(id);

        existing.setEmployeeCode(employee.getEmployeeCode());
        existing.setUsername(employee.getUsername());
        existing.setFullName(employee.getFullName());
        existing.setEmail(employee.getEmail());
        existing.setRole(employee.getRole());
        existing.setBranchId(employee.getBranchId());
        existing.setEnabled(employee.isEnabled());

        return userRepository.save(existing);
    }

    @Override
    public void deleteEmployee(Long id) {
        userRepository.deleteById(id);
    }
}