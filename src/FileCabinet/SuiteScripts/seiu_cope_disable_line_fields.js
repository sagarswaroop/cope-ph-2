/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @author Sagar kumar
 * @description Disable all the fields in cope transmittal form
 * @version 1.0
 * @NModuleScope SameAccount
 */
define(["N/record", "N/search"], function (record,search) {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */
  function pageInit(scriptContext) {
    debugger;
    var line = "line";
    var copeRecord = scriptContext.currentRecord;

    

    var customer = copeRecord.getField({
      fieldId: "custbody_local_customer",
    });
    customer.isDisabled = true;

    var tranmittedDate = copeRecord.getField({
      fieldId: "custbody_date_transmitted",
    });

    tranmittedDate.isDisabled = true;

    var headerQualFund = copeRecord.getField({
      fieldId: "custbody_local_qualifying_funds",
    });

    headerQualFund.isDisabled = true;

    var headernonQualFundDate = copeRecord.getField({
      fieldId: "custbody_non_qualifying_date",
    });

    headernonQualFundDate.isDisabled = true;

    var headernonQualFund = copeRecord.getField({
      fieldId: "custbody_local_non_qualifying_fund",
    });

    headernonQualFund.isDisabled = true;

    var status = copeRecord.getField({
      fieldId: "custbody_status",
    });

    status.isDisabled = true;

    var supportDocs = copeRecord.getField({
      fieldId: "custbody_seiu_support_docs",
    });

    supportDocs.isDisabled = true;

    var seiuNonQualFund = copeRecord.getField({
      fieldId: "custbody_seiu_non_qualifying_funds",
    });
    seiuNonQualFund.isDisabled = true;

    var seiuQualFund = copeRecord.getField({
      fieldId: "custbody_seiu_qualifying_funds",
    });
    seiuQualFund.isDisabled = true;

    var currency = copeRecord.getField({
      fieldId: "currency",
    });
    currency.isDisabled = true;

    var seiuQualFund = copeRecord.getField({
      fieldId: "custbody_seiu_qualifying_funds",
    });
    seiuQualFund.isDisabled = true;

    var exchangerate = copeRecord.getField({
      fieldId: "exchangerate",
    });
    exchangerate.isDisabled = true;

    var pacCehckBox = copeRecord.getField({
      fieldId: "custbody_seiu_pac_bank_acc",
    });
    pacCehckBox.isDisabled = true;

    var postingperiod = copeRecord.getField({
      fieldId: "postingperiod",
    });
    postingperiod.isDisabled = true;

    var year = copeRecord.getField({
      fieldId: "custbodycope_year",
    });
    year.isDisabled = true;

    var line = copeRecord.getSublist({
      sublistId: "line",
    });
    var item = line.getColumn({
      fieldId: "custcol_membership_item",
    });
    item.isDisabled = true;

    var confirmationNo = line.getColumn({
      fieldId: "custcol_check_confirmation_number",
    });

    confirmationNo.isDisabled = true;
    var nonQualifyFund = line.getColumn({
      fieldId: "custcol_non_qualifying_funds",
    });

    nonQualifyFund.isDisabled = true;
    var qualifyFund = line.getColumn({
      fieldId: "custcol_qualifying_funds",
    });

    qualifyFund.isDisabled = true;
    var paymentMentod = line.getColumn({
      fieldId: "custcol_seiu_payment_method",
    });

    paymentMentod.isDisabled = true;

    var serviceDate = line.getColumn({
      fieldId: "custcol_service_date",
    });
    serviceDate.isDisabled = true;

    var colRate = line.getColumn({
      fieldId: "custcol_rate",
    });
    colRate.isDisabled = true;

    var colQuantity = line.getColumn({
      fieldId: "custcol_quantity",
    });
    colQuantity.isDisabled = true;

    var colAmount = line.getColumn({
      fieldId: "amount",
    });
    colAmount.isDisabled = true;

    var colAccount = line.getColumn({
      fieldId: "account",
    });

    colAccount.isDisplay = false;
    colAccount.isDisabled = true;
    colAccount.userFacing = false;

    relaodandSetdata(copeRecord);
  }

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

  function relaodandSetdata(currentRecord) {
    const APPROVE = 4;
    // var currentRecord = context.currentRecord;
    let copeCDTotal = 0;
    let cashSaleTotal = 0;
    let cashRefundTotal = 0;
    let copeReversalValue = 0;
    try {
      var CopeTramsmittalFormData = {
        // CTFInternalId: currentRecord.id,
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

      const localCust = currentRecord.getValue({
        fieldId: "custbody_local_customer",
      });

      const isStatus = currentRecord.getValue({
        fieldId: "custbody_status",
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
        if(cashSaleTotal && copeCDTotal > cashSaleTotal && cashRefundTotal == 0){
          copeReversalValue = 1; // ready for reverse
        }

        if(copeCDTotal > cashRefundTotal){
          copeReversalValue = 3; //partial revers
        }

        if(cashRefundTotal == copeCDTotal){
          copeReversalValue = 2; // fully revers
        }
      }

      log.debug("copeReversalValue",copeReversalValue);

      if (copeReversalValue != 0) {
        currentRecord.setValue({
          fieldId: "custbody_cope_reversal",
          value: copeReversalValue,
        });
      }
    } catch (error) {
      log.debug(error);
      throw error.message;
    }
  }

  function fieldChanged(context){
    var isFieldChange = context.fieldId;
    

    if(isFieldChange == "custbody_cope_reversal"){
        log.debug("isFieldChange",isFieldChange);
        const isReversal = context.currentRecord.getValue({
            fieldId: "custbody_cope_reversal"
        });
    }
  } 

  return {
    pageInit: pageInit,
    // fieldChanged:fieldChanged
  };
});
