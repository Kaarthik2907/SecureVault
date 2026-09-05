package com.securevault.service;

import com.securevault.entity.User;
import com.securevault.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User createEmployee(User employee) {
        if (employee.getPassword() != null && !employee.getPassword().isBlank()) {
            if (!employee.getPassword().startsWith("$2a$") && !employee.getPassword().startsWith("$2b$")) {
                employee.setPassword(passwordEncoder.encode(employee.getPassword()));
            }
        }
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