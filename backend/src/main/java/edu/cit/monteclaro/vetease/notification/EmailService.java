package edu.cit.monteclaro.vetease.notification;

import edu.cit.monteclaro.vetease.appointment.model.Appointment;
import edu.cit.monteclaro.vetease.auth.model.User;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String from;
    private final String smtpHost;

    public EmailService(
        ObjectProvider<JavaMailSender> mailSenderProvider,
        @Value("${vetease.mail.from:no-reply@vetease.local}") String from,
        @Value("${spring.mail.host:}") String smtpHost
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.from = from;
        this.smtpHost = smtpHost;
    }

    public void sendWelcomeEmail(User user) {
        send(
            user.getEmail(),
            "Welcome to VetEase",
            "Hello %s,\n\nYour VetEase account is ready. You can now manage pet profiles and appointment requests.\n\n- VetEase"
                .formatted(displayName(user))
        );
    }

    public void sendAppointmentConfirmation(Appointment appointment) {
        User client = appointment.getClient();
        send(
            client.getEmail(),
            "VetEase appointment confirmed",
            "Hello %s,\n\nYour %s appointment for %s on %s at %s has been confirmed.\n\n- VetEase"
                .formatted(
                    displayName(client),
                    appointment.getService().getName(),
                    appointment.getPet().getName(),
                    appointment.getDate(),
                    appointment.getTime()
                )
        );
    }

    private void send(String to, String subject, String text) {
        if (smtpHost == null || smtpHost.isBlank()) {
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    private String displayName(User user) {
        String name = "%s %s".formatted(
            user.getFirstName() == null ? "" : user.getFirstName(),
            user.getLastName() == null ? "" : user.getLastName()
        ).trim();
        return name.isBlank() ? user.getUsername() : name;
    }
}
