/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/ui/serverWidget','N/record'], function(serverWidget,record) {

    function beforeLoad(context) {
        var currentRecord = context.newRecord;
        var form = context.form;
        var islink = false;
        var qualifyingCD = currentRecord.getValue({
            fieldId: "custbody_qualifying_cd"
        });
        var nonQualifyingCD = currentRecord.getValue({
            fieldId: "custbody_cd_non_qualifying"
        });
        var holdCD = currentRecord.getValue({
            fieldId: "custbody_cd_hold_acc"
        });
        if (qualifyingCD) {

                islink = true
    
            } else if (nonQualifyingCD) {
    
                islink = true
    
            } else if (holdCD) {
    
                islink = true
    
            } else {
    
                islink = false;
    
            }
        if(islink==true)
        {
            var CopeTramsmittalFormData = {
                CTFInternalId: currentRecord.id,
                qualifyingRecord: currentRecord.getValue({fieldId: "custbody_qualifying_cd"}),
                nonQualifyingRecord: currentRecord.getValue({fieldId: "custbody_cd_non_qualifying"}),
                holdCD: currentRecord.getValue({fieldId: "custbody_cd_hold_acc"}),
                adjQualifyingVB: currentRecord.getValue({fieldId: "custbody_adjustment_qual_vb"}),
                adjNonQualifyingVB: currentRecord.getValue({fieldId: "custbody_adj_nonqualifying_vendor_bill"}),
                adjQualifyingCD: currentRecord.getValue({fieldId: "custbody_adj_qualifying_cash_deposit"}),
                adjNonQualifyingCD: currentRecord.getValue({fieldId: "custbody_adj_noqualifying_cash_deposit"})
            }
            log.debug({
                title: "CTF Data Obj",
                details: CopeTramsmittalFormData
            })
            form.addButton({
                id : 'custpagecancelbutton',
                label : 'Reversal',
                functionName: 'CopeTransmitttalclientscriptreversal('+JSON.stringify(CopeTramsmittalFormData)+')'
                });
                form.clientScriptModulePath = 'SuiteScripts/SEIU_COPE_tranmittal_form_clientScript_for_reversal.js';
        }
        
    }

    function beforeSubmit(context) {
        
    }

    function afterSubmit(context) {
        
    }

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        //afterSubmit: afterSubmit
    }
});
