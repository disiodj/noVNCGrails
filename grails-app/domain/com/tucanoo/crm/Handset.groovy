package com.tucanoo.crm

class Handset {

    String telephoneNumber
    String operator
    String country
    static constraints = {
        telephoneNumber blank: false
        operator nullable: true
        country nullable: true
    }

    static mapping = {
        version false
    }
}
