package com.tucanoo.crm

import grails.gorm.services.Service

@Service(Handset)
interface HandsetService {

    Handset get(Serializable id)
    void delete(Serializable id)
    Handset save(Handset handset)

}
