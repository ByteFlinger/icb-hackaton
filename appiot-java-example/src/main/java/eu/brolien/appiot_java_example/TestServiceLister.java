package eu.brolien.appiot_java_example;

import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class TestServiceLister {

    private static final Logger log = LoggerFactory.getLogger(TestServiceLister.class);

	
	@Autowired
	private Connector connector;
	
	
	public TestServiceLister() {
		Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::listResources, 1, 10, TimeUnit.SECONDS);		
		Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(this::listTags, 1, 10, TimeUnit.SECONDS);		

	}
	
	private void listResources() {
		try {
			System.out.println("-----Resources-----");
			System.out.println(connector.getResourceManager().get());			
		} catch (Exception e) {
			log.warn("", e);			
		}
	}

	private void listTags() {
		try {
			System.out.println("----TAGS----");
			System.out.println(connector.getTagManager().get());			
		} catch (Exception e) {
			log.warn("", e);			
		}
		
		
	}

	
}
