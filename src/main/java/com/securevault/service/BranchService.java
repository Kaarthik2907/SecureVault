package com.securevault.service;

import com.securevault.entity.Branch;

import java.util.List;

public interface BranchService {

    Branch createBranch(Branch branch);

    List<Branch> getAllBranches();

    Branch getBranchById(Long id);

    Branch updateBranch(Long id, Branch branch);

    void deleteBranch(Long id);
}