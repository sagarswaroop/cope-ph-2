/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *@Author Praveen Singh
 */
define(['N/ui/serverWidget','N/record', 'N/http','N/redirect','N/workflow'], function(serverWidget,record,http,redirect,workflow) {
    function onRequest(context) {
        //var currentRecord=context.newRecord;
        var form = serverWidget.createForm({
            title: 'COPE Transmittal Form Reversal'
        });
        if (context.request.method === 'GET') {
            form.addSubmitButton({
                label: "Submit"
            });
            var COPETransmittalFormData = JSON.parse(context.request.parameters['array_item']);
            var recordType= 'customtransaction108';
            form.addButton({
                id : 'custpagecancelbutton',
                label : 'Cancel',
                functionName: 'setButton("'+COPETransmittalFormData.CTFInternalId+'","'+'customtransaction108'+'")'
                });
                form.clientScriptModulePath = 'SuiteScripts/GenericResolverecordforCancelbuttonclientscript.js';
                var Date= form.addField({
                    id: 'custpagedate',
                    label: "Date",
                    type: serverWidget.FieldType.DATE,
                });
                Date.isMandatory = true;
                var reversalRecord = form.addField({
                    id: 'custpagereversalrecord',
                    label: "Reversal Record",
                    type: serverWidget.FieldType.SELECT,
                });
                reversalRecord.addSelectOption({
                    value: '1',
                    text: 'Qualifying'
                });
                reversalRecord.addSelectOption({
                    value: '2',
                    text: 'Non-Qualifying'
                });
                reversalRecord.addSelectOption({
                    value: '3',
                    text: 'Both'
                });
                var CTFData= form.addField({
                    id: 'custpagecoprformdata',
                    label: "COPE Processed Data",
                    type: serverWidget.FieldType.LONGTEXT,
                });
                CTFData.defaultValue = COPETransmittalFormData;
            context.response.writePage(form);

        } else if (context.request.method === 'POST') {
            var postDate = context.request.parameters.custpagedate;
            var ReversalRecordtype = context.request.parameters.custpagereversalrecord;
            log.debug({
                title: "Reversal Record Type",
                details: ReversalRecordtype
            })
            // log.debug({
            //     title: "Record Internal Id",
            //     details: InternalId
            // });
            // var SalesOrder=record.load({
            //     type: record.Type.SALES_ORDER, 
            //     id: InternalId
            //     //isDynamic: true,
            // });
            // SalesOrder.setValue({
            //     fieldId: 'custbody7',
            //     value: Reason,
            //   });
            //   SalesOrder.save({
            //     enableSourcing: true,
            //     ignoreMandatoryFields: true
            // });
            // log.debug({
            //     title: "Rejection Raesion is ",
            //     details: Reason
            // });
            // var workflowInstanceId = workflow.trigger({
            //     recordId: InternalId, // replace with an actual record id    
            //     recordType: 'salesorder',
            //     workflowId: 'customworkflow_',
            //     actionId: 'workflowaction253',
            //     stateId: 'workflowstate87'
            // });
            // redirect.toRecord({
            //     type: record.Type.SALES_ORDER, 
            //     id: InternalId,
            //     parameters: {
            //         'custparam_test':'helloWorld'
            //     } 
            // redirect.redirect({
            //     url: '/app/site/hosting/scriplet.nl?script=130&deploy=1',
            //     parameters: {
            //         'custparam_test':'helloWorld'
            //     } 
            // });
            // serverResponse.write({
            //     output: Reason
            // });
            //response.write(Reason);
            // var reason = context.request.parameters.custpagerejectionreason;
            //context.response.write('You have entered:' + '<br/>  Rejection Reason is: '+ reason);
        }
    }
    

    return {
        onRequest: onRequest
    }
});
