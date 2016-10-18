package eu.brolien.appiot_java_example.events;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;

import eu.brolien.appiot_java_example.Connector;
import eu.brolien.appiot_java_example.ticketing.jira.JIRAPublisher;
import se.sigma.sensation.event.sdk.EventManager;
import se.sigma.sensation.event.sdk.EventMessageListener;
import se.sigma.sensation.event.sdk.OutboxException;
import se.sigma.sensation.event.sdk.dto.EventMessage;
import se.sigma.sensation.event.sdk.dto.EventResetMessage;
import se.sigma.sensation.event.sdk.dto.EventStatus;
import se.sigma.sensation.event.sdk.dto.IntegrationTicket;

@Service
public class EventService implements ApplicationContextAware, EventMessageListener {
    private static final Logger log = LoggerFactory.getLogger(Connector.class);

    private EventManager eventManager;

    @Autowired
    private JIRAPublisher jiraPublisher;
    
    
    private Executor exec = Executors.newSingleThreadExecutor();
    
    private void setup(String json) {
        System.out.println(json);
        System.out.println("!!! SETUP !!!!");
        IntegrationTicket integrationTicket = new Gson().fromJson(json, IntegrationTicket.class);
        System.out.println(integrationTicket);
        eventManager = new EventManager(integrationTicket);
        eventManager.setEventMessageListener(this);
        eventManager.startInbox();

        System.out.println("!!! LISTENING !!!!!");
    }

    public void onEventMessage(EventMessage eventMessage) {
        exec.execute(new Runnable() {
            @Override
            public void run() {
                processMessage(eventMessage);
            }            
        });
    }
    
    private void processMessage(EventMessage eventMessage) {
        
        try {

            System.out.println(eventMessage.id);

            log.info("got event: " + new Gson().toJson(eventMessage));

            String category = eventMessage.eventCategoryName;
            String location = eventMessage.locationName;
            String trigger = eventMessage.triggerName;
            EventStatus status = eventMessage.eventStatus;
            String sensor = eventMessage.sensorName;
            String event = eventMessage.id;
            String rule = eventMessage.ruleName;

            String value = "";
            if (eventMessage.measurement != null && eventMessage.measurement.getValues().length > 0) {
                value = Double.toString(eventMessage.measurement.getValues()[0]);
            }

            jiraPublisher.publish(category, location, trigger, status, sensor, event, rule, value);
        } catch (Throwable e) {
            e.printStackTrace();
        }
        
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        setup(applicationContext.getEnvironment().getProperty("ticket.json"));
    }

}
