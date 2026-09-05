package com.securevault.service;

import com.securevault.entity.Branch;
import com.securevault.repository.BranchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BranchServiceTest {

    @Mock
    private BranchRepository branchRepository;

    private BranchService branchService;

    @BeforeEach
    void setUp() {
        branchService = new BranchServiceImpl(branchRepository);
    }

    @Test
    @DisplayName("Should create and save a new branch")
    void testCreateBranch() {
        Branch branch = new Branch();
        branch.setBranchCode("BR-MUM-001");
        branch.setName("Mumbai Financial Hub Branch");
        branch.setCity("Mumbai");
        branch.setAddress("BKC Plot C-12");
        branch.setContactNumber("+91-22-67890123");
        branch.setActive(true);

        when(branchRepository.save(any(Branch.class))).thenReturn(branch);

        Branch created = branchService.createBranch(branch);
        assertNotNull(created);
        assertEquals("BR-MUM-001", created.getBranchCode());
        verify(branchRepository, times(1)).save(branch);
    }

    @Test
    @DisplayName("Should return all branches")
    void testGetAllBranches() {
        Branch b1 = new Branch();
        b1.setId(1L);
        b1.setName("Branch 1");

        Branch b2 = new Branch();
        b2.setId(2L);
        b2.setName("Branch 2");

        when(branchRepository.findAll()).thenReturn(List.of(b1, b2));

        List<Branch> result = branchService.getAllBranches();
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should get branch by id when present")
    void testGetBranchByIdFound() {
        Branch branch = new Branch();
        branch.setId(1L);
        branch.setName("Branch 1");

        when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));

        Branch found = branchService.getBranchById(1L);
        assertNotNull(found);
        assertEquals(1L, found.getId());
    }

    @Test
    @DisplayName("Should throw exception when branch not found")
    void testGetBranchByIdNotFound() {
        when(branchRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> branchService.getBranchById(99L));
    }

    @Test
    @DisplayName("Should update existing branch")
    void testUpdateBranch() {
        Branch existing = new Branch();
        existing.setId(1L);
        existing.setName("Old Name");

        Branch updated = new Branch();
        updated.setBranchCode("BR-UPDATED");
        updated.setName("New Name");
        updated.setCity("New City");
        updated.setAddress("New Address");
        updated.setContactNumber("9999999999");
        updated.setActive(false);

        when(branchRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(branchRepository.save(any(Branch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Branch result = branchService.updateBranch(1L, updated);
        assertEquals("New Name", result.getName());
        assertEquals("BR-UPDATED", result.getBranchCode());
        assertFalse(result.isActive());
    }

    @Test
    @DisplayName("Should delete branch by id")
    void testDeleteBranch() {
        doNothing().when(branchRepository).deleteById(1L);

        branchService.deleteBranch(1L);
        verify(branchRepository, times(1)).deleteById(1L);
    }
}
