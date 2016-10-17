package eu.brolien.appiot_java_example.services;

import java.io.IOException;

import org.apache.http.client.ClientProtocolException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import eu.brolien.appiot_java_example.cache.PrinterCache;
import se.sigma.sensation.client.sdk.SensationException;

@Controller
@RequestMapping("/refresh")
public class RefreshService {

    @Autowired
    private PrinterCache printerCache;
    
    
    
    @RequestMapping(method=RequestMethod.POST)
    public @ResponseBody void refresh() throws ClientProtocolException, SensationException, IOException {
        printerCache.refresh();
    }
    
}
