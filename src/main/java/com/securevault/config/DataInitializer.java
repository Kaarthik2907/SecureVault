package com.securevault.config;

import com.securevault.entity.AuditLog;
import com.securevault.entity.Branch;
import com.securevault.entity.User;
import com.securevault.entity.Vault;
import com.securevault.repository.AuditLogRepository;
import com.securevault.repository.BranchRepository;
import com.securevault.repository.UserRepository;
import com.securevault.repository.VaultRepository;
import com.securevault.util.HashChainUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final VaultRepository vaultRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.securevault.service.AuditLogService auditLogService;

    public DataInitializer(BranchRepository branchRepository,
                           UserRepository userRepository,
                           VaultRepository vaultRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder,
                           com.securevault.service.AuditLogService auditLogService) {
        this.branchRepository = branchRepository;
        this.userRepository = userRepository;
        this.vaultRepository = vaultRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Override
    public void run(String... args) {
        if (branchRepository.count() == 0) {
            log.info("Seeding expanded SecureVault baseline data into database...");

            // 1. Exactly 3 Branches: Mumbai, Delhi, Bangalore
            Branch b1 = new Branch();
            b1.setBranchCode("BR-MUM-001");
            b1.setName("Mumbai Financial Hub Branch");
            b1.setCity("Mumbai");
            b1.setAddress("Bandra Kurla Complex, Plot C-12, Mumbai, MH 400051");
            b1.setContactNumber("+91-22-67890123");
            b1.setActive(true);
            b1 = branchRepository.save(b1);

            Branch b2 = new Branch();
            b2.setBranchCode("BR-DEL-001");
            b2.setName("Delhi Central Treasury Branch");
            b2.setCity("New Delhi");
            b2.setAddress("Connaught Place, Block F, New Delhi, DL 110001");
            b2.setContactNumber("+91-11-23456789");
            b2.setActive(true);
            b2 = branchRepository.save(b2);

            Branch b3 = new Branch();
            b3.setBranchCode("BR-BLR-001");
            b3.setName("Bengaluru Tech & Custody Branch");
            b3.setCity("Bengaluru");
            b3.setAddress("MG Road, Trinity Circle, Bengaluru, KA 560001");
            b3.setContactNumber("+91-80-41234567");
            b3.setActive(true);
            b3 = branchRepository.save(b3);

            // 2. Exactly 5 Employees: Mix of OFFICER, BRANCH_MANAGER, and ADMIN across branches
            User u1 = new User();
            u1.setEmployeeCode("EMP-0101");
            u1.setUsername("johndoe");
            u1.setPassword(passwordEncoder.encode("password123"));
            u1.setFullName("John Doe");
            u1.setEmail("johndoe@securevault.internal");
            u1.setRole("OFFICER");
            u1.setBranchId(b1.getId());
            u1.setEnabled(true);
            u1 = userRepository.save(u1);

            User u2 = new User();
            u2.setEmployeeCode("EMP-0102");
            u2.setUsername("sarahsmith");
            u2.setPassword(passwordEncoder.encode("password123"));
            u2.setFullName("Sarah Smith");
            u2.setEmail("sarahsmith@securevault.internal");
            u2.setRole("BRANCH_MANAGER");
            u2.setBranchId(b1.getId());
            u2.setEnabled(true);
            u2 = userRepository.save(u2);

            User u3 = new User();
            u3.setEmployeeCode("EMP-0103");
            u3.setUsername("davidkumar");
            u3.setPassword(passwordEncoder.encode("password123"));
            u3.setFullName("David Kumar");
            u3.setEmail("davidkumar@securevault.internal");
            u3.setRole("ADMIN");
            u3.setBranchId(b1.getId());
            u3.setEnabled(true);
            u3 = userRepository.save(u3);

            User u4 = new User();
            u4.setEmployeeCode("EMP-0201");
            u4.setUsername("priyasharma");
            u4.setPassword(passwordEncoder.encode("password123"));
            u4.setFullName("Priya Sharma");
            u4.setEmail("priyasharma@securevault.internal");
            u4.setRole("BRANCH_MANAGER");
            u4.setBranchId(b2.getId());
            u4.setEnabled(true);
            u4 = userRepository.save(u4);

            User u5 = new User();
            u5.setEmployeeCode("EMP-0301");
            u5.setUsername("alexchen");
            u5.setPassword(passwordEncoder.encode("password123"));
            u5.setFullName("Alex Chen");
            u5.setEmail("alexchen@securevault.internal");
            u5.setRole("OFFICER");
            u5.setBranchId(b3.getId());
            u5.setEnabled(true);
            u5 = userRepository.save(u5);

            // 3. Exactly 4 Vaults: 2 in Mumbai, 1 in Delhi, 1 in Bangalore
            Vault v1 = new Vault();
            v1.setVaultCode("VLT-MUM-A1");
            v1.setName("High Value Bullion Vault A1");
            v1.setBranch(b1);
            v1.setSecurityLevel("CRITICAL");
            v1.setMaxConcurrentAccess(2);
            v1.setLocked(true);
            vaultRepository.save(v1);

            Vault v2 = new Vault();
            v2.setVaultCode("VLT-MUM-B2");
            v2.setName("Securities & Deposit Locker B2");
            v2.setBranch(b1);
            v2.setSecurityLevel("HIGH");
            v2.setMaxConcurrentAccess(4);
            v2.setLocked(true);
            vaultRepository.save(v2);

            Vault v3 = new Vault();
            v3.setVaultCode("VLT-DEL-01");
            v3.setName("Reserve Currency Vault 01");
            v3.setBranch(b2);
            v3.setSecurityLevel("CRITICAL");
            v3.setMaxConcurrentAccess(2);
            v3.setLocked(true);
            vaultRepository.save(v3);

            Vault v4 = new Vault();
            v4.setVaultCode("VLT-BLR-01");
            v4.setName("Digital Asset & Escrow Storage 01");
            v4.setBranch(b3);
            v4.setSecurityLevel("HIGH");
            v4.setMaxConcurrentAccess(3);
            v4.setLocked(true);
            vaultRepository.save(v4);

            // 4. Genesis Audit Log Entry
            if (auditLogRepository.count() == 0) {
                AuditLog genesis = new AuditLog();
                genesis.setLogId("LOG-20260826-0001");
                genesis.setEventType("SYSTEM_INITIALIZATION");
                Long approverId = (u2 != null && u2.getId() != null) ? u2.getId() : 102L;
                genesis.setEmployeeId(approverId);
                genesis.setActionDetails("SecureVault core schema and cryptographic audit chain initialized.");
                genesis.setTimestamp(LocalDateTime.now());
                genesis.setPreviousHash("0000000000000000000000000000000000000000000000000000000000000000");
                genesis.setCurrentHash(HashChainUtil.calculateHash(
                        genesis.getPreviousHash(),
                        genesis.getLogId(),
                        genesis.getEventType(),
                        genesis.getEmployeeId(),
                        null,
                        genesis.getActionDetails(),
                        genesis.getTimestamp().toString()
                ));
                auditLogRepository.save(genesis);
            }
            auditLogService.resetChain();

            log.info("Expanded baseline data seeding completed successfully: 3 Branches, 4 Vaults, 5 Employees.");
        }
    }
}
