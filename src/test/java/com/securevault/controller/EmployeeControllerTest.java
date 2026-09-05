package com.securevault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevault.entity.User;
import com.securevault.security.JwtUtil;
import com.securevault.service.EmployeeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = EmployeeController.class)
@AutoConfigureMockMvc(addFilters = false)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmployeeService employeeService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("POST /api/v1/employees should create employee and return 201")
    void testCreateEmployee() throws Exception {
        User user = new User(101L, "EMP-0101", "johndoe", "pwd", "John Doe", "john@vault.com", "OFFICER", 1L, true);

        when(employeeService.createEmployee(any(User.class))).thenReturn(user);

        mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.username").value("johndoe"))
                .andExpect(jsonPath("$.role").value("OFFICER"));
    }

    @Test
    @DisplayName("GET /api/v1/employees should return list of employees")
    void testGetAllEmployees() throws Exception {
        User user = new User(101L, "EMP-0101", "johndoe", "pwd", "John Doe", "john@vault.com", "OFFICER", 1L, true);

        when(employeeService.getAllEmployees()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/v1/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101))
                .andExpect(jsonPath("$[0].username").value("johndoe"));
    }

    @Test
    @DisplayName("GET /api/v1/employees/{id} should return single employee")
    void testGetEmployeeById() throws Exception {
        User user = new User(101L, "EMP-0101", "johndoe", "pwd", "John Doe", "john@vault.com", "OFFICER", 1L, true);

        when(employeeService.getEmployeeById(101L)).thenReturn(user);

        mockMvc.perform(get("/api/v1/employees/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }

    @Test
    @DisplayName("PUT /api/v1/employees/{id} should update employee")
    void testUpdateEmployee() throws Exception {
        User updated = new User(101L, "EMP-0101", "johndoe", "pwd", "John Updated", "john@vault.com", "OFFICER", 1L, true);

        when(employeeService.updateEmployee(eq(101L), any(User.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/employees/101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Updated"));
    }

    @Test
    @DisplayName("DELETE /api/v1/employees/{id} should return 204 No Content")
    void testDeleteEmployee() throws Exception {
        doNothing().when(employeeService).deleteEmployee(101L);

        mockMvc.perform(delete("/api/v1/employees/101"))
                .andExpect(status().isNoContent());
    }
}
