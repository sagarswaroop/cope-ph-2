/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 *
 */

define([
  "N/search",
  "N/format",
  "N/error",
  "N/runtime",
  "N/record",
  "N/redirect",
  "N/ui/serverWidget",
], function (search, format, error, runtime, record, redirect, serverWidget) {
  function beforeLoad(context) {
    var currentRecord = context.newRecord;
    var myUser = runtime.getCurrentUser();
    var objForm = context.form;

    var userRole = myUser.role;

    var custbody_qualifying_conf_no = objForm.getField({
      id: "custbody_qualifying_conf_no",
    });
    
    var custbody_non_qualifying_conf_no = objForm.getField({
      id: "custbody_non_qualifying_conf_no",
    });
    
    var custbody_hold_acc_conf_no = objForm.getField({
      id: "custbody_hold_acc_conf_no",
    });
    
    var objSublist = objForm.getSublist({
      id: "line",
    });

    var objFieldAccount = objSublist.getField({
      id: "account",
    });

    objFieldAccount.updateDisplayType({
      displayType: serverWidget.FieldDisplayType.HIDDEN,
    });

    // custbody_hold_acc_conf_no.updateDisplayType({
    //   displayType: serverWidget.FieldDisplayType.HIDDEN,
    // });

    // custbody_non_qualifying_conf_no.updateDisplayType({
    //   displayType: serverWidget.FieldDisplayType.HIDDEN,
    // });

    // custbody_qualifying_conf_no.updateDisplayType({
    //   displayType: serverWidget.FieldDisplayType.HIDDEN,
    // });
  }

  function afterSubmit(context) {
    //set payment method on body header payment method form line level.
    setPaymentMethod(context);

    // set confirmation form line level in Transmittal
    setconfimationNo(context);
  }

  function setPaymentMethod(context) {
    var recordId = context.newRecord.id;
    var currRecord = context.newRecord;
    var linecount = currRecord.getLineCount({
      sublistId: "line",
    });

    log.debug({
      title: "record id is ",
      details: recordId,
    });

    var headerPaymentMethod = currRecord.getValue({
      fieldId: "custbody_ctf_payment_method_header",
    });

    if (headerPaymentMethod == "") {
      if (linecount > 0) {
        var method = currRecord.getSublistValue({
          sublistId: "line",
          fieldId: "custcol_seiu_payment_method",
          line: 0,
        });

        record.submitFields({
          type: "customtransaction108",
          id: recordId,
          values: { custbody_ctf_payment_method_header: method },
        });
      }
    }
  }

  function setconfimationNo(context) {
    var currRecord = context.newRecord;
    var recordId = context.newRecord.id;

    // var currRecord = currRecord.getLineCount({
    //   sublistId: "line",
    // });

    var totalLines = currRecord.getLineCount({
      sublistId: "line",
    });

    var isHold = currRecord.getValue({
      fieldId: "custbody_cust_bank_hold_acc",
    });

    log.debug("totalLines are ", totalLines);
    log.debug("hold field value is ", isHold);

    if (totalLines > 0) {
      var qualifyingConformationNo = currRecord.getSublistValue({
        sublistId: "line",
        fieldId: "custcol_check_confirmation_number",
        line: 0,
      });

      var nonQaulifyingcconformationNo = currRecord.getSublistValue({
        sublistId: "line",
        fieldId: "custcol_check_confirmation_number",
        line: totalLines - 1,
      });

      log.debug(
        "qualifyingConformationNo " +
          qualifyingConformationNo +
          " nonQaulifyingcconformationNo " +
          nonQaulifyingcconformationNo
      );

      if (isHold == true) {
        log.debug("isHold == true");

        record.submitFields({
          type: "customtransaction108",
          id: recordId,
          values: {"custbody_hold_acc_conf_no": qualifyingConformationNo},          
        });
      
      } else {
        log.debug("else part execut..");

        record.submitFields({
          type: "customtransaction108",
          id: recordId,
          values: {"custbody_qualifying_conf_no": qualifyingConformationNo},          
        });

        record.submitFields({
          type: "customtransaction108",
          id: recordId,
          values: {"custbody_non_qualifying_conf_no": nonQaulifyingcconformationNo},          
        });
      }
    }
  }
  return {
    beforeLoad: beforeLoad,
    afterSubmit: afterSubmit,
  };
});
