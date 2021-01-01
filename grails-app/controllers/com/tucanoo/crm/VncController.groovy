package com.tucanoo.crm

import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.client.RestClientException

class VncController {

    def index() { }

    def blackButton() {
    }
    def experiments(){
    }
    def vnc_lite(){

    }
    def home(){}


    List<Object> testcenters() {
        try {
            return ["testcenter1","testcenter2"]
        } catch (RestClientException e) {
            log.error("Error when fetching list of testcenters: ", e);
            return new ArrayList<>();
        }
    }
}
