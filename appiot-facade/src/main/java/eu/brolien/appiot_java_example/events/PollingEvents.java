package eu.brolien.appiot_java_example.events;

import java.util.Arrays;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.google.gson.Gson;

import eu.brolien.appiot_java_example.Connector;
import se.sigma.sensation.event.sdk.dto.EventMessage;
import se.sigma.sensation.event.sdk.dto.IntegrationTicket;

@Service
public class PollingEvents implements ApplicationContextAware {

    @Autowired
    private Connector connector;
    @Autowired
    private EventService eventService;

    private RestTemplate template;
    private IntegrationTicket integrationTicket;

    private void poll() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            // headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
            //System.out.println(integrationTicket.getInboxAccessTicket().getHttpSas());
            headers.set("Authorization", integrationTicket.getInboxAccessTicket().getHttpSas());
            headers.set("Content-Type", "application/atom+xml;type=entry;charset=utf-8");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            //System.out.println(integrationTicket.getInboxAccessTicket().getHttpServiceUri());
            //System.out.println(integrationTicket.getInboxAccessTicket().getHttpServicePath());
            String inboxServiceUri = integrationTicket.getInboxAccessTicket().getHttpServiceUri();
            String inboxServicePath = integrationTicket.getInboxAccessTicket().getHttpServicePath();
            String url = inboxServiceUri + ":443/" + inboxServicePath + "/messages/head";
            //System.out.println(url);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.DELETE, entity,
                    String.class);
            if (response.hasBody()) {
                processMessage(response.getBody());
            } else {
                System.out.println("nothing here");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private final static class DummySeverityLevelData {
        int SeverityLevel;
    }
    

    private void processMessage(String body) {
        System.out.println(body);
        EventMessage eventMessage = new Gson().fromJson(body, EventMessage.class);
        DummySeverityLevelData dummySeverityLevelData = new Gson().fromJson(body, DummySeverityLevelData.class);
        eventService.onEventMessage(eventMessage, dummySeverityLevelData.SeverityLevel);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        setup(applicationContext.getEnvironment().getProperty("ticket.json"));
        Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::poll, 1, 5, TimeUnit.SECONDS);
    }

    private void setup(String json) {
        System.out.println(json);
        System.out.println("!!! SETUP !!!!");
        integrationTicket = new Gson().fromJson(json, IntegrationTicket.class);
        System.out.println(integrationTicket);

        // TODO Auto-generated method stub

    }

}
