package com.securevault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevault.entity.Branch;
import com.securevault.security.JwtUtil;
import com.securevault.service.BranchService;
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

@WebMvcTest(controllers = BranchController.class)
@AutoConfigureMockMvc(addFilters = false)
class BranchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BranchService branchService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("POST /api/v1/branches should create branch and return 201")
    void testCreateBranch() throws Exception {
        Branch branch = new Branch();
        branch.setId(1L);
        branch.setBranchCode("BR-MUM-001");
        branch.setName("Mumbai Financial Hub Branch");
        branch.setCity("Mumbai");
        branch.setAddress("BKC Plot C-12");
        branch.setContactNumber("+91-22-67890123");
        branch.setActive(true);

        when(branchService.createBranch(any(Branch.class))).thenReturn(branch);

        mockMvc.perform(post("/api/v1/branches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(branch)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.branchCode").value("BR-MUM-001"))
                .andExpect(jsonPath("$.name").value("Mumbai Financial Hub Branch"));
    }

    @Test
    @DisplayName("GET /api/v1/branches should return list of branches")
    void testGetAllBranches() throws Exception {
        Branch b1 = new Branch();
        b1.setId(1L);
        b1.setName("Branch 1");

        when(branchService.getAllBranches()).thenReturn(List.of(b1));

        mockMvc.perform(get("/api/v1/branches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Branch 1"));
    }

    @Test
    @DisplayName("GET /api/v1/branches/{id} should return single branch")
    void testGetBranchById() throws Exception {
        Branch b1 = new Branch();
        b1.setId(1L);
        b1.setName("Branch 1");

        when(branchService.getBranchById(1L)).thenReturn(b1);

        mockMvc.perform(get("/api/v1/branches/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Branch 1"));
    }

    @Test
    @DisplayName("PUT /api/v1/branches/{id} should update branch")
    void testUpdateBranch() throws Exception {
        Branch updated = new Branch();
        updated.setId(1L);
        updated.setName("Updated Branch");

        when(branchService.updateBranch(eq(1L), any(Branch.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/branches/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Branch"));
    }

    @Test
    @DisplayName("DELETE /api/v1/branches/{id} should return 204 No Content")
    void testDeleteBranch() throws Exception {
        doNothing().when(branchService).deleteBranch(1L);

        mockMvc.perform(delete("/api/v1/branches/1"))
                .andExpect(status().isNoContent());
    }
}
