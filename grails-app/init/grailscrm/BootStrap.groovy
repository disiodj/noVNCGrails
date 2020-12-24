package grailscrm

import com.tucanoo.crm.Customer
import com.tucanoo.crm.Handset
import groovy.sql.Sql

class BootStrap {

    def dataSource

    def init = { servletContext ->
       new Handset(
               telephoneNumber: '+39456789123',
               operator: 'vodafone',
               country: 'Austria').save(failOnError: true)
    }
    def destroy = {
    }
}
