package eu.brolien.appiot_java_example.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import eu.brolien.appiot_java_example.cache.PrinterCache;
import eu.brolien.appiot_java_example.data.Printer;

@Controller
@RequestMapping("/printers")
public class PrinterService {
    
    @Autowired
    private PrinterCache printerCache;
    
    @RequestMapping(method=RequestMethod.GET)
    public @ResponseBody List<Printer> list() {
        return printerCache.getPrinters();
    }

}
