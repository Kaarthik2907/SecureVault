package com.securevault.repository;

import com.securevault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their unique username.
     *
     * @param username The username to search for.
     * @return An Optional containing the User if found, empty otherwise.
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds a user by their email address.
     *
     * @param email The email address to search for.
     * @return An Optional containing the User if found, empty otherwise.
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists with the given username.
     *
     * @param username The username to verify.
     * @return true if a user with the username exists, false otherwise.
     */
    boolean existsByUsername(String username);
}
