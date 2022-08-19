/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/ui/serverWidget", "N/record"], function (serverWidget, record) {
  function beforeLoad(context) {
    const APPROVE = 4;
    var currentRecord = context.newRecord;
    var form = context.form;
    var islink = false;
    var qualifyingCD = currentRecord.getValue({
      fieldId: "custbody_qualifying_cd",
    });
    var nonQualifyingCD = currentRecord.getValue({
      fieldId: "custbody_cd_non_qualifying",
    });
    var holdCD = currentRecord.getValue({
      fieldId: "custbody_cd_hold_acc",
    });

    var isStatus = currentRecord.getValue({
      fieldId: "custbody_status",
    });

    if (qualifyingCD) {
      islink = true;
    } else if (nonQualifyingCD) {
      islink = true;
    } else if (holdCD) {
      islink = true;
    } else {
      islink = false;
    }
    if (islink == true && isStatus == APPROVE) {
      var CopeTramsmittalFormData = {
        CTFInternalId: currentRecord.id,
        qualifyingRecord: currentRecord.getValue({
          fieldId: "custbody_qualifying_cd",
        }),
        nonQualifyingRecord: currentRecord.getValue({
          fieldId: "custbody_cd_non_qualifying",
        }),
        holdCD: currentRecord.getValue({ fieldId: "custbody_cd_hold_acc" }),
        adjsutQaulCD: currentRecord.getValue({
          fieldId: "custbody_adj_qualifying_cash_deposit",
        }),
        adjNonQaulCD: currentRecord.getValue({
          fieldId: "custbody_adj_noqualifying_cash_deposit",
        }),
      };
      log.debug({
        title: "CTF Data Obj",
        details: CopeTramsmittalFormData,
      });
      form.addButton({
        id: "custpagecancelbutton",
        label: "Reversal",
        functionName:
          "CopeTransmitttalclientscriptreversal(" +
          JSON.stringify(CopeTramsmittalFormData) +
          ")",
      });
      form.clientScriptModulePath =
        "SuiteScripts/SEIU_COPE_tranmittal_form_clientScript_for_reversal.js";
    }
  
    if (context.newRecord.type == "customtransaction108") {
      let isReversal = false;
      
      isReversal = context.currentRecord.getValue({
        fieldId: "custbody_seiu_ctf_is_reversal_create",
      });

      if (isReversal) {
        window.location.reload;
      }
    }
  }
  return {
    beforeLoad: beforeLoad,
    //beforeSubmit: beforeSubmit,
    //afterSubmit: afterSubmit
  };
});
