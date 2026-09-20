package com.tradeazy.repository;

import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.RoleName;
import com.tradeazy.entity.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.username = :identifier")
    Optional<User> findByEmailOrUsername(@Param("identifier") String identifier);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    Page<User> findAllByRole(@Param("roleName") RoleName roleName, Pageable pageable);

    Page<User> findAllByStatus(UserStatus status, Pageable pageable);

    @Query("""
        SELECT u FROM User u
        WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(u.lastName)  LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(u.username)  LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(u.email)     LIKE LOWER(CONCAT('%', :q, '%'))
    """)
    Page<User> search(@Param("q") String query, Pageable pageable);
}