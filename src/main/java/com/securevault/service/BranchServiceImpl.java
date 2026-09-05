package com.securevault.service;

import com.securevault.entity.Branch;
import com.securevault.repository.BranchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;

    public BranchServiceImpl(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @Override
    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    @Override
    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    @Override
    public Branch getBranchById(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    @Override
    public Branch updateBranch(Long id, Branch branch) {
        Branch existing = getBranchById(id);

        existing.setBranchCode(branch.getBranchCode());
        existing.setName(branch.getName());
        existing.setCity(branch.getCity());
        existing.setAddress(branch.getAddress());
        existing.setContactNumber(branch.getContactNumber());
        existing.setActive(branch.isActive());

        return branchRepository.save(existing);
    }

    @Override
    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }
}