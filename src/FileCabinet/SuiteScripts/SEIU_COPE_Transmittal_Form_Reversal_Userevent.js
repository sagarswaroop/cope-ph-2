/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@author Sagar Kumar
 *@description Show "Reversla" button when Cope form is approved and cash sales are also created for all Attched cash deposit with current Cope record.
 */
define(["N/ui/serverWidget", "N/record", "N/search"], function (
  serverWidget,
  record,
  search
) {
  function getcustomerId(recordId) {
    const localList = record.load({
      type: "customrecord_localized",
      id: recordId,
    });
    const custId = localList.getValue({
      fieldId: "custrecord_lz_customer",
    });

    return custId;
  }

  function checkRecord(cdID, currentRecord) {
    log.debug(`${cdID} and ${getcustomerId(currentRecord)}`);
    var cashsaleSearchObj = search.create({
      type: "cashsale",
      filters: [
        ["type", "anyof", "CashSale"],
        "AND",
        ["custbody_je_source_record", "anyof", cdID],
        "AND",
        ["applyingtransaction.number", "isempty", ""],
        "AND",
        ["mainline", "is", "T"],
        "AND",
        ["name", "anyof", getcustomerId(currentRecord)],
      ],
      columns: [search.createColumn({ name: "amount", label: "Amount" })],
    });
    var searchResultCount = cashsaleSearchObj.runPaged().count;
    log.debug(`searchResultCount is ${searchResultCount}`);
    if (searchResultCount > 0) {
      return 1;
    } else {
      return 0;
    }
  }
  function beforeLoad(context) {
    const APPROVE = 4;
    var currentRecord = context.newRecord;
    var form = context.form;
    let copeCDTotal = 0;
    let cashSaleTotal = 0;
    try {
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

      const localCust = currentRecord.getValue({
        fieldId: "custbody_local_customer",
      });

      const isStatus = currentRecord.getValue({
        fieldId: "custbody_status",
      });

      if (CopeTramsmittalFormData.qualifyingRecord) {
        copeCDTotal++;
        cashSaleTotal += checkRecord(
          CopeTramsmittalFormData.qualifyingRecord,
          localCust
        );
      }
      if (CopeTramsmittalFormData.nonQualifyingRecord) {
        copeCDTotal++;
        cashSaleTotal += checkRecord(
          CopeTramsmittalFormData.nonQualifyingRecord,
          localCust
        );
      }
      if (CopeTramsmittalFormData.holdCD) {
        copeCDTotal++;
        cashSaleTotal += checkRecord(CopeTramsmittalFormData.holdCD, localCust);
      }
      if (CopeTramsmittalFormData.adjNonQaulCD) {
        copeCDTotal++;
        cashSaleTotal += checkRecord(
          CopeTramsmittalFormData.adjNonQaulCD,
          localCust
        );
      }
      if (CopeTramsmittalFormData.adjsutQaulCD) {
        copeCDTotal++;
        cashSaleTotal += checkRecord(
          CopeTramsmittalFormData.adjsutQaulCD,
          localCust
        );
      }

      // if (qualifyingCD) {
      //   islink = true;
      // } else if (nonQualifyingCD) {
      //   islink = true;
      // } else if (holdCD) {
      //   islink = true;
      // } else {
      //   islink = false;
      // }

      log.debug(
        `copeCDTotal is ${copeCDTotal} and cashSaleTotal is ${cashSaleTotal}`
      );

      if (copeCDTotal == cashSaleTotal && isStatus == APPROVE) {
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
    } catch (error) {
      log.debug(error);
    }
    // if (context.newRecord.type == "customtransaction108") {
    //   let isReversal = false;

    //   isReversal = context.currentRecord.getValue({
    //     fieldId: "custbody_seiu_ctf_is_reversal_create",
    //   });

    //   if (isReversal) {
    //     window.location.reload;
    //   }
    // }
  }
  return {
    beforeLoad: beforeLoad,
    //beforeSubmit: beforeSubmit,
    //afterSubmit: afterSubmit
  };
});
