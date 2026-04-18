package com.ds3.identity.service;

import com.ds3.identity.model.DelegatedLink;
import com.sendgrid.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    
    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;
    
    @Value("${app.base.url:http://localhost:3000}")
    private String appBaseUrl;
    
    /**
     * Send invitation email via SendGrid
     */
    public void sendInvitationEmail(DelegatedLink link, String inviteeEmail, String message) {
        if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
            log.warn("SendGrid API key not configured, skipping email notification");
            return;
        }
        
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);
            
            String acceptUrl = String.format("%s/invitations/accept/%s", appBaseUrl, link.getInvitationToken());
            String rejectUrl = String.format("%s/invitations/reject/%s", appBaseUrl, link.getInvitationToken());
            
            Email from = new Email("noreply@ds3.world");
            Email to = new Email(inviteeEmail);
            
            String subject = String.format("%s invited you to view their profile on DS3 World", 
                link.getOwnerAccount().getDisplayName());
            
            String content = buildEmailContent(link, message, acceptUrl, rejectUrl);
            
            Content emailContent = new Content("text/html", content);
            Mail mail = new Mail(from, subject, to, emailContent);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("invitation.email.sent", 
                    link_id=link.getId(), 
                    to=inviteeEmail,
                    status_code=response.getStatusCode());
            } else {
                log.error("invitation.email.failed", 
                    link_id=link.getId(),
                    status_code=response.getStatusCode(),
                    body=response.getBody());
            }
            
        } catch (IOException e) {
            log.error("invitation.email.error", link_id=link.getId(), error=str(e));
        }
    }
    
    /**
     * Send invitation accepted email
     */
    public void sendInvitationAcceptedEmail(DelegatedLink link) {
        if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
            log.warn("SendGrid API key not configured, skipping email notification");
            return;
        }
        
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);
            
            Email from = new Email("noreply@ds3.world");
            Email to = new Email(link.getOwnerAccount().getEmail());
            
            String subject = String.format("%s accepted your profile invitation on DS3 World", 
                link.getDelegatorAccount().getDisplayName());
            
            String content = buildAcceptedEmailContent(link);
            
            Content emailContent = new Content("text/html", content);
            Mail mail = new Mail(from, subject, to, emailContent);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            sg.api(request);
            
            log.info("invitation.accepted.email.sent", link_id=link.getId());
            
        } catch (IOException e) {
            log.error("invitation.accepted.email.error", link_id=link.getId(), error=str(e));
        }
    }
    
    /**
     * Send invitation rejected email
     */
    public void sendInvitationRejectedEmail(DelegatedLink link) {
        if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
            return;
        }
        
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);
            
            Email from = new Email("noreply@ds3.world");
            Email to = new Email(link.getOwnerAccount().getEmail());
            
            String subject = String.format("%s declined your profile invitation on DS3 World", 
                link.getDelegatorAccount().getDisplayName());
            
            String content = buildRejectedEmailContent(link);
            
            Content emailContent = new Content("text/html", content);
            Mail mail = new Mail(from, subject, to, emailContent);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            sg.api(request);
            
            log.info("invitation.rejected.email.sent", link_id=link.getId());
            
        } catch (IOException e) {
            log.error("invitation.rejected.email.error", link_id=link.getId(), error=str(e));
        }
    }
    
    private String buildEmailContent(DelegatedLink link, String message, String acceptUrl, String rejectUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("<html><body>");
        sb.append("<h2>You've been invited to view a profile on DS3 World</h2>");
        sb.append("<p>");
        sb.append(String.format("<strong>%s</strong> has invited you to view their <strong>%s</strong> profile.",
            link.getOwnerAccount().getDisplayName(),
            link.getOwnerProfile().getName()));
        sb.append("</p>");
        
        if (message != null && !message.isEmpty()) {
            sb.append("<p><em>\"").append(message).append("\"</em></p>");
        }
        
        sb.append("<p>You'll have the following permissions:</p>");
        sb.append("<ul>");
        if (link.getPermissions().isCanViewSize()) sb.append("<li>View size measurements</li>");
        if (link.getPermissions().isCanViewStyle()) sb.append("<li>View style preferences</li>");
        if (link.getPermissions().isCanOrderFor()) sb.append("<li>Order items for this profile</li>");
        sb.append("</ul>");
        
        sb.append("<p>");
        sb.append(String.format("<a href=\"%s\" style=\"background-color: #764ba2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Accept Invitation</a>", acceptUrl));
        sb.append(" ");
        sb.append(String.format("<a href=\"%s\" style=\"color: #666; padding: 10px 20px; text-decoration: none;\">Decline</a>", rejectUrl));
        sb.append("</p>");
        
        sb.append("<p style=\"color: #999; font-size: 12px;\">");
        sb.append("This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore it.");
        sb.append("</p>");
        sb.append("</body></html>");
        
        return sb.toString();
    }
    
    private String buildAcceptedEmailContent(DelegatedLink link) {
        return String.format(
            "<html><body>" +
            "<h2>Invitation Accepted</h2>" +
            "<p>%s has accepted your invitation to view your %s profile.</p>" +
            "<p>You can now manage their access from your profile settings.</p>" +
            "</body></html>",
            link.getDelegatorAccount().getDisplayName(),
            link.getOwnerProfile().getName()
        );
    }
    
    private String buildRejectedEmailContent(DelegatedLink link) {
        return String.format(
            "<html><body>" +
            "<h2>Invitation Declined</h2>" +
            "<p>%s has declined your invitation to view your %s profile.</p>" +
            "</body></html>",
            link.getDelegatorAccount().getDisplayName(),
            link.getOwnerProfile().getName()
        );
    }
}
