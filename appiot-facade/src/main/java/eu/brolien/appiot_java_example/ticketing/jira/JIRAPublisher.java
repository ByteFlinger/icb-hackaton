package eu.brolien.appiot_java_example.ticketing.jira;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;

import com.atlassian.jira.rest.client.api.JiraRestClient;
import com.atlassian.jira.rest.client.api.domain.BasicIssue;
import com.atlassian.jira.rest.client.api.domain.BasicPriority;
import com.atlassian.jira.rest.client.api.domain.Comment;
import com.atlassian.jira.rest.client.api.domain.Issue;
import com.atlassian.jira.rest.client.api.domain.IssueType;
import com.atlassian.jira.rest.client.api.domain.Priority;
import com.atlassian.jira.rest.client.api.domain.SearchResult;
import com.atlassian.jira.rest.client.api.domain.Status;
import com.atlassian.jira.rest.client.api.domain.Transition;
import com.atlassian.jira.rest.client.api.domain.input.FieldInput;
import com.atlassian.jira.rest.client.api.domain.input.IssueInput;
import com.atlassian.jira.rest.client.api.domain.input.IssueInputBuilder;
import com.atlassian.jira.rest.client.api.domain.input.TransitionInput;
import com.atlassian.jira.rest.client.internal.async.AsynchronousJiraRestClientFactory;
import com.atlassian.util.concurrent.Promise;

import se.sigma.sensation.event.sdk.dto.EventStatus;

@Service
public class JIRAPublisher implements ApplicationContextAware {

    private JiraRestClient restClient;

    private Map<Integer, Priority> map = new HashMap<>();
    
    
    int getTransitionId(Issue issue, String transitionName)  {
        final Promise<Iterable<Transition>> transitions = restClient.getIssueClient().getTransitions(issue);
        final Iterable<Transition> iterable = transitions.claim();
        for (Transition transition : iterable) {
            System.out.println(transition.getName());
            if (transition.getName().equals(transitionName)) {
                return transition.getId();
            }
        }
        throw new RuntimeException("Transition with name '"+ transitionName + "' is not found for this issue");
    }
    
    public void publish(String category, String location, String trigger, EventStatus status, String sensor,
            String event, String rule, String value, int severityLevel) {
        
        category = category.replace(' ', '_');
        sensor = sensor.replace(' ', '_');
        location = location.replace(' ', '_');
        
        String uniqueId = location + "." + sensor; 

        Promise<SearchResult> result = restClient.getSearchClient().searchJql(
                "issueType = Task AND status in (Open, \"In Progress\") AND labels = '" + uniqueId + "'");
        result.claim();

        switch (status) {
        case ManualReset:
        case AutomaticReset:
            try {
                SearchResult sr = result.get();
                for (Issue issue : sr.getIssues()) {
                    System.out.println(issue);
                    int id = getTransitionId(issue, "Close Issue");
                    TransitionInput input = new TransitionInput(id, Comment.valueOf("Auto closing issue due to status: " + status.name()));
                    restClient.getIssueClient().transition(issue, input).claim();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            System.out.println("returning");
            return;
        }
        
        String description = "Location: " + location + "\nCategory: " + category + "\nSensor: " + sensor + "\nRule: "
                + rule + "\nValue: " + value + "\nStatus: " + status;
        String summary = rule + " " + location;

        try {
            SearchResult sr = result.get();
            if (sr.getTotal() > 0) {
                System.out.println("issue exists, updating");
                
                Issue issue = sr.getIssues().iterator().next();
                
                restClient.getIssueClient().updateIssue(issue.getKey(), new IssueInputBuilder().setDescription(description).setSummary(summary).setPriority(map.get(severityLevel)).build());
                
                return;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("publish new issue");
   
        IssueInput issue = new IssueInputBuilder()
                .setDescription(description)
                .setIssueTypeId(10001L).setProjectKey("WOR").setSummary(summary).setPriority(map.get(severityLevel)).setFieldValue("labels", Arrays.asList(uniqueId, location, category)).build();
        Promise<BasicIssue> p = restClient.getIssueClient().createIssue(issue);
        p.claim();
        try {
            System.out.println("published: " + p.get().toString());
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        final AsynchronousJiraRestClientFactory factory = new AsynchronousJiraRestClientFactory();
        URI uri = URI.create("https://ericssonconnectedoffice.atlassian.net");
        restClient = factory.createWithBasicHttpAuthentication(uri, applicationContext.getEnvironment().getProperty("jira.user"), applicationContext.getEnvironment().getProperty("jira.password"));
        
        for (Priority prio : restClient.getMetadataClient().getPriorities().claim()) {            
            System.out.println("found prio: " + prio);
            map.put(prio.getId().intValue(), prio);
            
        }
        
    }

}
