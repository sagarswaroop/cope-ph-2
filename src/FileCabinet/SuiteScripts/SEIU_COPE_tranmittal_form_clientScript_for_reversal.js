/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/url','N/ui/message'], function(url,message) {

    function CopeTransmitttalclientscriptreversal(CTFInternalId){
        log.debug({
            title: "Internal id of CTF",
            details: CTFInternalId
        });
        // alert(CTFInternalId);
        // var URL = redirect.toSuitelet({
        //     scriptId: 'customscript_seiu_ctf_reversal_suitlet',
        //     deploymentId: 'customdeploy1',
        //     parameters: {'RecordId': CTFInternalId}
        // });
        
        var output = url.resolveScript({
            scriptId: 'customscript_seiu_ctf_reversal_suitlet',
            deploymentId: 'customdeploy_seiu_ctf_reversal_form',
            params: {'array_item': JSON.stringify(CTFInternalId)},
            // returnExternalUrl: t
        });
        // window.open(output,);
        window.location.replace(output);
        // url.resolveScript({
        //     deploymentId: string*,
        //     scriptId: string*,
        //     params: Object,
        //     returnExternalUrl: boolean
        // })
    }
    function pageInit(context) {

        let myMsg = message.create({
            title: 'SIEU | Cash Deposit process',
            message: 'Selected Cash deposit processed Successfuly',
            type: message.Type.INFORMATION
        });
        myMsg.show();
        // setTimeout(myMsg.hide, 5000);

        setTimeout(()=>window.close(),5000);
         
    }

    function checkData(isDataexist){
        console.log("checkData",isDataexist);
        if(!isDataexist){
            let myMsg = message.create({
                title: 'SIEU | Cash Depoist process',
                message: 'No tansaction found to revers',
                type: message.Type.INFORMATION
            });
            myMsg.show();
            // setTimeout(myMsg.hide, 5000);
    
            setTimeout(()=>window.close(),5000);
        }
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

    function closeWindow(){
        window.close();
    }

    function saveRecord(context){
        console.log("i am groot");
        window.close();
        return true;
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
