package com.tradeazy.repository;

import com.tradeazy.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Messages in a conversation, oldest first (chat order).
     */
    Page<Message> findByConversationIdOrderByCreatedAtAsc(
            Long conversationId, Pageable pageable);

    /**
     * The most recent message in a conversation — used to display a preview.
     */
    Optional<Message> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    /**
     * Count unread messages in a conversation for a given user
     * (i.e. messages sent by the OTHER party and not yet read).
     */
    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :userId
          AND m.read = false
    """)
    long countUnreadInConversation(@Param("conversationId") Long conversationId,
                                    @Param("userId") Long userId);

    /**
     * Mark all messages in a conversation as read EXCEPT the ones sent by `userId`.
     */
    @Modifying
    @Query("""
        UPDATE Message m
        SET m.read = true
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :userId
          AND m.read = false
    """)
    int markConversationRead(@Param("conversationId") Long conversationId,
                              @Param("userId") Long userId);
}