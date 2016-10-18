package eu.brolien.appiot_java_example.ticketing.jira;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;

import org.springframework.stereotype.Service;

import com.atlassian.jira.rest.client.api.JiraRestClient;
import com.atlassian.jira.rest.client.api.domain.BasicIssue;
import com.atlassian.jira.rest.client.api.domain.Comment;
import com.atlassian.jira.rest.client.api.domain.Issue;
import com.atlassian.jira.rest.client.api.domain.IssueType;
import com.atlassian.jira.rest.client.api.domain.SearchResult;
import com.atlassian.jira.rest.client.api.domain.Status;
import com.atlassian.jira.rest.client.api.domain.input.FieldInput;
import com.atlassian.jira.rest.client.api.domain.input.IssueInput;
import com.atlassian.jira.rest.client.api.domain.input.IssueInputBuilder;
import com.atlassian.jira.rest.client.api.domain.input.TransitionInput;
import com.atlassian.jira.rest.client.internal.async.AsynchronousJiraRestClientFactory;
import com.atlassian.util.concurrent.Promise;

import se.sigma.sensation.event.sdk.dto.EventStatus;

@Service
public class JIRAPublisher {

    final JiraRestClient restClient;

    public JIRAPublisher() {
        final AsynchronousJiraRestClientFactory factory = new AsynchronousJiraRestClientFactory();
        URI uri = URI.create("https://ericssonconnectedoffice.atlassian.net");
        restClient = factory.createWithBasicHttpAuthentication(uri, "carl-martin.glos@ericsson.com", "Wick3dFast!");

    }

    public void publish(String category, String location, String trigger, EventStatus status, String sensor,
            String event, String rule, String value) {

        Promise<SearchResult> result = restClient.getSearchClient().searchJql(
                "issueType = Task AND status in (Backlog, \"Selected for Development\") AND labels = '" + event + "'");
        result.claim();
/**
        switch (status) {
        case ManualReset:
        case AutomaticReset:
            try {
                SearchResult sr = result.get();
                for (Issue issue : sr.getIssues()) {
                    System.out.println(issue);
                    TransitionInput input = new TransitionInput(251, Comment.valueOf("Auto closing issue due to status: " + status.name()));
                    restClient.getIssueClient().transition(issue, input).claim();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return;
        }
        **/

        try {
            SearchResult sr = result.get();
            if (sr.getTotal() > 0) {
                System.out.println("issue exists, returning");
                return;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("puslish");
   
        IssueInput issue = new IssueInputBuilder()
                .setDescription("Location: " + location + "\nCategory: " + category + "\nSensor:" + sensor + "\nRule: "
                        + rule + "\nValue: " + value + "\nStatus: " + status)
                .setIssueTypeId(10001L).setProjectKey("WOR").setSummary(category + " " + location).setFieldValue("labels", Arrays.asList(event, location.replace(' ', '_'))).build();
        Promise<BasicIssue> p = restClient.getIssueClient().createIssue(issue);
        p.claim();
        try {
            System.out.println("puslished: " + p.get().toString());
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

}
