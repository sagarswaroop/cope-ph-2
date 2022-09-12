/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@author Sagar Kumar
 *@description Show "Reversla" button when Cope form is approved and cash sales are also created for all Attched cash deposit with current Cope record.
 */

// let copeReversalValue = 0;
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

  function checkRecord(filterArr) {
    // log.debug(`${cdID} and ${getcustomerId(currentRecord)}`);
    var cashsaleSearchObj = search.create({
      type: "cashsale",
      filters: filterArr,
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
    let cashRefundTotal = 0;
    let copeReversalValue = 0;
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

      form
        .getField({
          id: "custbody_cope_reversal",
        })
        .updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED,
        });

      currentRecord.setValue({
        fieldId: "custbody_cope_reversal",
        value: 1,
      });

      log.debug({
        title: "CTF Data Obj",
        details: CopeTramsmittalFormData,
      });

      const localCust = currentRecord.getValue({
        fieldId: "custbody_local_customer",
      });

      const isStatus = currentRecord.getValue({
        fieldId: "custbody_status"
      });

      if (CopeTramsmittalFormData.qualifyingRecord) {
        log.debug(
          "CopeTramsmittalFormData.qualifyingRecord",
          CopeTramsmittalFormData.qualifyingRecord
        );
        const cashSaleFileter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.qualifyingRecord,
          ],
          "AND",
          ["applyingtransaction.number", "isempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];

        const cashRefundFilter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.qualifyingRecord,
          ],
          "AND",
          ["applyingtransaction.number", "isnotempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];
        copeCDTotal++;
        cashSaleTotal += checkRecord(cashSaleFileter);
        cashRefundTotal += checkRecord(cashRefundFilter);
      }
      if (CopeTramsmittalFormData.nonQualifyingRecord) {
        log.debug(
          "CopeTramsmittalFormData.nonQualifyingRecord",
          CopeTramsmittalFormData.nonQualifyingRecord
        );
        const cashSaleFileter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.nonQualifyingRecord,
          ],
          "AND",
          ["applyingtransaction.number", "isempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];

        const cashRefundFilter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.nonQualifyingRecord,
          ],
          "AND",
          ["applyingtransaction.number", "isnotempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];
        copeCDTotal++;
        cashSaleTotal += checkRecord(cashSaleFileter);
        cashRefundTotal += checkRecord(cashRefundFilter);
      }
      if (CopeTramsmittalFormData.holdCD) {
        log.debug(
          "CopeTramsmittalFormData.holdCD",
          CopeTramsmittalFormData.holdCD
        );
        const cashSaleFileter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.holdCD,
          ],
          "AND",
          ["applyingtransaction.number", "isempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];

        const cashRefundFilter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.holdCD,
          ],
          "AND",
          ["applyingtransaction.number", "isnotempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];
        copeCDTotal++;
        cashSaleTotal += checkRecord(cashSaleFileter);
        cashRefundTotal += checkRecord(cashRefundFilter);
      }
      if (CopeTramsmittalFormData.adjNonQaulCD) {
        log.debug(
          "CopeTramsmittalFormData.adjNonQaulCD",
          CopeTramsmittalFormData.adjNonQaulCD
        );
        const cashSaleFileter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.adjNonQaulCD,
          ],
          "AND",
          ["applyingtransaction.number", "isempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];

        const cashRefundFilter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.adjNonQaulCD,
          ],
          "AND",
          ["applyingtransaction.number", "isnotempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];
        copeCDTotal++;
        cashSaleTotal += checkRecord(cashSaleFileter);
        cashRefundTotal += checkRecord(cashRefundFilter);
      }
      if (CopeTramsmittalFormData.adjsutQaulCD) {
        log.debug(
          "CopeTramsmittalFormData.adjsutQaulCD",
          CopeTramsmittalFormData.adjsutQaulCD
        );
        const cashSaleFileter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.adjsutQaulCD,
          ],
          "AND",
          ["applyingtransaction.number", "isempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];

        const cashRefundFilter = [
          ["type", "anyof", "CashSale"],
          "AND",
          [
            "custbody_je_source_record",
            "anyof",
            CopeTramsmittalFormData.adjsutQaulCD,
          ],
          "AND",
          ["applyingtransaction.number", "isnotempty", ""],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["name", "anyof", getcustomerId(localCust)],
        ];
        copeCDTotal++;
        cashSaleTotal += checkRecord(cashSaleFileter);
        cashRefundTotal += checkRecord(cashRefundFilter);
      }

      log.debug(
        `copeCDTotal is ${copeCDTotal} and cashSaleTotal is ${cashSaleTotal} and cashRefundTotal ${cashRefundTotal}`
      );


      if(isStatus == APPROVE){

        // const strNumber = toString(copeCDTotal)+toString(cashSaleTotal)+toString(cashRefundTotal);

        // if(strNumber)



        if(cashSaleTotal == copeCDTotal && copeCDTotal >0 && cashRefundTotal == 0){
          copeReversalValue = 1; // ready for reverse
        }

        if(cashSaleTotal < copeCDTotal && cashRefundTotal > 0 && copeCDTotal !=cashRefundTotal){
          copeReversalValue = 3; //partial revers
        }

        if(cashRefundTotal == copeCDTotal){
          copeReversalValue = 2; // fully revers
        }
      }

      log.debug("copeReversalValue",copeReversalValue);

      if (copeReversalValue == 1 || copeReversalValue == 3) {
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

      // if (isStatus == APPROVE && copeCDTotal > 0) {
      //   if (cashSaleTotal < cashRefundTotal && cashRefundTotal == copeCDTotal) {
      //     copeReversalValue = 2; // fully revers
      //   } else if (
      //     cashSaleTotal > cashRefundTotal &&
      //     cashSaleTotal < copeCDTotal
      //   ) {
      //     copeReversalValue = 3; //partial revers
      //   } else {
      //     copeReversalValue = 1; // ready for reverse
      //   }

      //   log.debug("copeReversalValue", copeReversalValue);

        
      // }
    } catch (error) {
      log.debug(error);
      throw error;
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

  function beforeSubmit(context) {
    if (copeReversalValue != 0)
      context.newRecord.setValue({
        fieldId: "custbody_cope_reversal",
        value: copeReversalValue,
      });
  }

  // function relaodandSetdata(context) {
  //   log.debug("relaodandSetdata called .......***************");
  //   const APPROVE = 4;
  //   var currentRecord = context.newRecord;
  //   let copeCDTotal = 0;
  //   let cashSaleTotal = 0;
  //   let cashRefundTotal = 0;
  //   try {
  //     var CopeTramsmittalFormData = {
  //       // CTFInternalId: currentRecord.id,
  //       qualifyingRecord: currentRecord.getValue({
  //         fieldId: "custbody_qualifying_cd",
  //       }),
  //       nonQualifyingRecord: currentRecord.getValue({
  //         fieldId: "custbody_cd_non_qualifying",
  //       }),
  //       holdCD: currentRecord.getValue({ fieldId: "custbody_cd_hold_acc" }),
  //       adjsutQaulCD: currentRecord.getValue({
  //         fieldId: "custbody_adj_qualifying_cash_deposit",
  //       }),
  //       adjNonQaulCD: currentRecord.getValue({
  //         fieldId: "custbody_adj_noqualifying_cash_deposit",
  //       }),
  //     };

  //     const localCust = currentRecord.getValue({
  //       fieldId: "custbody_local_customer",
  //     });

  //     const isStatus = currentRecord.getValue({
  //       fieldId: "custbody_status",
  //     });

  //     if (CopeTramsmittalFormData.qualifyingRecord) {
  //       log.debug(
  //         "CopeTramsmittalFormData.qualifyingRecord",
  //         CopeTramsmittalFormData.qualifyingRecord
  //       );
  //       const cashSaleFileter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.qualifyingRecord,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];

  //       const cashRefundFilter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.qualifyingRecord,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isnotempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];
  //       copeCDTotal++;
  //       cashSaleTotal += checkRecord(cashSaleFileter);
  //       cashRefundTotal += checkRecord(cashRefundFilter);
  //     }
  //     if (CopeTramsmittalFormData.nonQualifyingRecord) {
  //       log.debug(
  //         "CopeTramsmittalFormData.nonQualifyingRecord",
  //         CopeTramsmittalFormData.nonQualifyingRecord
  //       );
  //       const cashSaleFileter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.nonQualifyingRecord,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];

  //       const cashRefundFilter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.nonQualifyingRecord,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isnotempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];
  //       copeCDTotal++;
  //       cashSaleTotal += checkRecord(cashSaleFileter);
  //       cashRefundTotal += checkRecord(cashRefundFilter);
  //     }
  //     if (CopeTramsmittalFormData.holdCD) {
  //       log.debug(
  //         "CopeTramsmittalFormData.holdCD",
  //         CopeTramsmittalFormData.holdCD
  //       );
  //       const cashSaleFileter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.holdCD,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];

  //       const cashRefundFilter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.holdCD,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isnotempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];
  //       copeCDTotal++;
  //       cashSaleTotal += checkRecord(cashSaleFileter);
  //       cashRefundTotal += checkRecord(cashRefundFilter);
  //     }
  //     if (CopeTramsmittalFormData.adjNonQaulCD) {
  //       log.debug(
  //         "CopeTramsmittalFormData.adjNonQaulCD",
  //         CopeTramsmittalFormData.adjNonQaulCD
  //       );
  //       const cashSaleFileter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.adjNonQaulCD,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];

  //       const cashRefundFilter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.adjNonQaulCD,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isnotempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];
  //       copeCDTotal++;
  //       cashSaleTotal += checkRecord(cashSaleFileter);
  //       cashRefundTotal += checkRecord(cashRefundFilter);
  //     }
  //     if (CopeTramsmittalFormData.adjsutQaulCD) {
  //       log.debug(
  //         "CopeTramsmittalFormData.adjsutQaulCD",
  //         CopeTramsmittalFormData.adjsutQaulCD
  //       );
  //       const cashSaleFileter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.adjsutQaulCD,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];

  //       const cashRefundFilter = [
  //         ["type", "anyof", "CashSale"],
  //         "AND",
  //         [
  //           "custbody_je_source_record",
  //           "anyof",
  //           CopeTramsmittalFormData.adjsutQaulCD,
  //         ],
  //         "AND",
  //         ["applyingtransaction.number", "isnotempty", ""],
  //         "AND",
  //         ["mainline", "is", "T"],
  //         "AND",
  //         ["name", "anyof", getcustomerId(localCust)],
  //       ];
  //       copeCDTotal++;
  //       cashSaleTotal += checkRecord(cashSaleFileter);
  //       cashRefundTotal += checkRecord(cashRefundFilter);
  //     }

  //     // if (qualifyingCD) {
  //     //   islink = true;
  //     // } else if (nonQualifyingCD) {
  //     //   islink = true;
  //     // } else if (holdCD) {
  //     //   islink = true;
  //     // } else {
  //     //   islink = false;
  //     // }

  //     log.debug(
  //       `copeCDTotal is ${copeCDTotal} and cashSaleTotal is ${cashSaleTotal} and cashRefundTotal ${cashRefundTotal}`
  //     );

  //     if (isStatus == APPROVE && copeCDTotal > 0) {
  //       if (cashSaleTotal < cashRefundTotal && cashRefundTotal == copeCDTotal) {
  //         copeReversalValue = 2; // fully revers
  //       } else if (copeCDTotal > cashRefundTotal && cashRefundTotal > 0) {
  //         copeReversalValue = 3; //partial revers
  //       } else {
  //         copeReversalValue = 1; // ready for reverse
  //       }

  //       log.debug("copeReversalValue", copeReversalValue);

  //       if (copeReversalValue != 0) {
  //         currentRecord.setValue({
  //           fieldId: "custbody_cope_reversal",
  //           value: copeReversalValue,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     log.debug(error);
  //     throw error.message;
  //   }
  // }
  return {
    beforeLoad: beforeLoad,
    // beforeSubmit: relaodandSetdata,
    //afterSubmit: afterSubmit
  };
});
