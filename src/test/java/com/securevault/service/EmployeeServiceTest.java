package com.securevault.service;

import com.securevault.entity.User;
import com.securevault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        employeeService = new EmployeeServiceImpl(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Should create employee")
    void testCreateEmployee() {
        User user = new User(101L, "EMP-0101", "johndoe", "pwd", "John Doe", "john@vault.com", "OFFICER", 1L, true);

        when(userRepository.save(any(User.class))).thenReturn(user);

        User created = employeeService.createEmployee(user);
        assertNotNull(created);
        assertEquals("johndoe", created.getUsername());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Should return all employees")
    void testGetAllEmployees() {
        User u1 = new User(101L, "EMP-0101", "johndoe", "pwd", "John Doe", "john@vault.com", "OFFICER", 1L, true);
        User u2 = new User(102L, "EMP-0102", "sarahsmith", "pwd", "Sarah Smith", "sarah@vault.com", "BRANCH_MANAGER", 1L, true);

        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<User> list = employeeService.getAllEmployees();
        assertEquals(2, list.size());
    }

    @Test
    @DisplayName("Should get employee by id when found")
    void testGetEmployeeByIdFound() {
        User user = new User(101L, "EMP-0101", "johndoe", "pwd", "John Doe", "john@vault.com", "OFFICER", 1L, true);

        when(userRepository.findById(101L)).thenReturn(Optional.of(user));

        User found = employeeService.getEmployeeById(101L);
        assertNotNull(found);
        assertEquals(101L, found.getId());
    }

    @Test
    @DisplayName("Should throw exception when employee not found")
    void testGetEmployeeByIdNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> employeeService.getEmployeeById(999L));
    }

    @Test
    @DisplayName("Should update employee details")
    void testUpdateEmployee() {
        User existing = new User(101L, "EMP-0101", "johndoe", "pwd", "John Old", "john@vault.com", "OFFICER", 1L, true);
        User updateData = new User(null, "EMP-0101-NEW", "johndoe2", "newpwd", "John New", "newjohn@vault.com", "BRANCH_MANAGER", 2L, false);

        when(userRepository.findById(101L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = employeeService.updateEmployee(101L, updateData);
        assertEquals("John New", updated.getFullName());
        assertEquals("johndoe2", updated.getUsername());
        assertEquals("EMP-0101-NEW", updated.getEmployeeCode());
        assertEquals("newjohn@vault.com", updated.getEmail());
        assertEquals("BRANCH_MANAGER", updated.getRole());
        assertEquals(2L, updated.getBranchId());
        assertFalse(updated.isEnabled());
    }

    @Test
    @DisplayName("Should delete employee by id")
    void testDeleteEmployee() {
        doNothing().when(userRepository).deleteById(101L);

        employeeService.deleteEmployee(101L);
        verify(userRepository, times(1)).deleteById(101L);
    }
}
