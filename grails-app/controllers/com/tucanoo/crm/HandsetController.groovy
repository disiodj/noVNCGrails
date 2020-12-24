package com.tucanoo.crm

import grails.converters.JSON
import grails.gorm.PagedResultList

import javax.xml.bind.ValidationException

class HandsetController {

    HandsetService handsetService
    def index() { }

    def handset_for_tiles(){
        int draw = params.int("draw")
        int length = params.int("length")
        int start = params.int("start")

        String queryString = params["search[value]"]

        PagedResultList criteriaResult = Handset.createCriteria().list([max: length, offset: start]){
            readOnly true
            or {
                ilike('telephoneNumber', '%' + queryString + '%')
                ilike('country', '%' + queryString + '%')
                ilike('operator', '%' + queryString + '%')
            }
//            order sortName, sortDir

        }

        Map dataTilesResults = [
                draw: draw,
                recordsTotal: criteriaResult.totalCount,
                recordsFiltered: criteriaResult.totalCount,
                data: criteriaResult
        ]
        render dataTilesResults as JSON
    }

    def create(){
        respond new Handset(params)
    }
    def save(Handset handsetInstance){
        try{
            handsetService.save(handsetInstance)
        } catch(ValidationException ex) {
            respond handsetInstance, view: 'create'
            return
        }
        flash.message = 'Handset Created Succesfully'

        redirect(action:'index')
    }

    def edit(Long id) {
        respond handsetService.get(id)
    }

    def update(Handset handset) {
        try {
            handsetService.save(handset)
        } catch (grails.validation.ValidationException e) {
            respond handset.errors, view:'edit'
            return
        }

        flash.message = "Handset updated successfully!"

        redirect(action: "index")
    }

}
