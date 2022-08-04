/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/url'], function(url) {

    function CopeTransmitttalclientscriptreversal(CTFInternalId){
        log.debug({
            title: "Internal id of CTF",
            details: CTFInternalId
        });
        alert(CTFInternalId);
        // var URL = redirect.toSuitelet({
        //     scriptId: 'customscript_seiu_ctf_reversal_suitlet',
        //     deploymentId: 'customdeploy1',
        //     parameters: {'RecordId': CTFInternalId}
        // });
        
        var output = url.resolveScript({
            scriptId: 'customscript_seiu_ctf_reversal_suitlet',
            deploymentId: 'customdeploy1',
            params: {'array_item': JSON.stringify(CTFInternalId)},
            returnExternalUrl: false
        });
        window.location.replace(output);
        // url.resolveScript({
        //     deploymentId: string*,
        //     scriptId: string*,
        //     params: Object,
        //     returnExternalUrl: boolean
        // })
    }
    function pageInit(context) {
        
    }

    function saveRecord(context) {
        
    }

    function validateField(context) {
        
    }

    function fieldChanged(context) {
        
    }

    function postSourcing(context) {
        
    }

    function lineInit(context) {
        
    }

    function validateDelete(context) {
        
    }

    function validateInsert(context) {
        
    }

    function validateLine(context) {
        
    }

    function sublistChanged(context) {
        
    }

    return {
        CopeTransmitttalclientscriptreversal: CopeTransmitttalclientscriptreversal,
        pageInit: pageInit,
        // saveRecord: saveRecord,
        // validateField: validateField,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
