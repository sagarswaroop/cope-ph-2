/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@author Sagar Kumar
 *@description This script taking tha transmited data and finding the diffrent in days. Then, it will distribute the line amount acordin to difference days and calculate the sum of qualified and non-qualified amount.
 */
var isPACAcc = false;
var isHold = false;
define(["N/record", "N/search", "./SEIU_ML_Cope_Adjustment.js"], function (record, search, adjustment) {
  function determineCopeFunds(context) {
    var copeRecord = context.newRecord;

    // var copeRecord = record.load({
    //     type: "customtransaction108",
    //     id: copeRecordId
    // })

    isPACAcc = copeRecord.getValue({
      fieldId: "custbody_seiu_pac_bank_acc",
    });

    isHold = copeRecord.getValue({
      fieldId: "custbody_cust_bank_hold_acc",
    });

    var tranStatus = copeRecord.getValue({
      fieldId: "custbody_status",
    });

    log.debug({
      title: "isPACAcc",
      details: isPACAcc,
    });

    // Execute below code when Status is approved.
    // if (tranStatus == "4") {
      var totalQualifiedAmount = 0;
      var totalUnqualifiedAmount = 0;

      try {
        var transmitDate2 = copeRecord.getValue({
          fieldId: "custbody_2nd_date_transmitted",
        });

        // log.debug("transmitDate2 is"+transmitDate2);

        var transmitDate = copeRecord.getValue({
          fieldId: "custbody_date_transmitted",
        });
        // log.debug("transmitDate is"+transmitDate);

        var linesCounts = copeRecord.getLineCount({
          sublistId: "line",
        });

        // log.debug("linesCounts are"+linesCounts);

        // Execute when TransmittedDate2 is not blank.
        if (transmitDate2) {
          if (linesCounts > 0) {
            for (var i = 0; i < linesCounts; i++) {
              var approvedDate = transmitDate2;

              if (context.type === context.UserEventType.EDIT) {
                var ItemDateString = copeRecord.getSublistValue({
                  sublistId: "line",
                  fieldId: "custcol_service_date_by_seiu",
                  line: i,
                });

                if (ItemDateString == "") {
                  log.debug(" transmitDate2 if part execute");
                  copeRecord.setSublistValue({
                    sublistId: "line",
                    fieldId: "custcol_service_date_by_seiu",
                    value: transmitDate2,
                    line: i,
                  });

                  approvedDate = transmitDate2;
                } else if (ItemDateString) {
                  if (
                    formateDate(ItemDateString) == formateDate(transmitDate)
                  ) {
                    log.debug(" transmitDate2 else if part execute");
                    copeRecord.setSublistValue({
                      sublistId: "line",
                      fieldId: "custcol_service_date_by_seiu",
                      value: transmitDate2,
                      line: i,
                    });

                    approvedDate = transmitDate2;
                  }
                } else {
                  log.debug(" transmitDate2 else execute");
                  approvedDate = ItemDateString;
                }
              } else {
                copeRecord.setSublistValue({
                  sublistId: "line",
                  fieldId: "custcol_service_date_by_seiu",
                  value: transmitDate2,
                  line: i,
                });
              }

              var serviceDate = copeRecord.getSublistValue({
                sublistId: "line",
                fieldId: "custcol_service_date",
                line: i,
              });

              var diffrenceDays = calculateDate(transmitDate2, serviceDate);
              var headerAmount = fundAmountDetermine(
                copeRecord,
                diffrenceDays,
                i
              );
              totalQualifiedAmount += headerAmount.qualified;
              totalUnqualifiedAmount += headerAmount.notQualified;
            }
          }
        } else {
          if (!isHold) {
            // Execute when TransmittedDate2 is blank.
            for (var i = 0; i < linesCounts; i++) {
              var approvedDate = transmitDate;
              if (context.type === context.UserEventType.EDIT) {
                var ItemDateString = copeRecord.getSublistValue({
                  sublistId: "line",
                  fieldId: "custcol_service_date_by_seiu",
                  line: i,
                });

                if (ItemDateString == "") {
                  log.debug("transmitDate  if part execute");

                  copeRecord.setSublistValue({
                    sublistId: "line",
                    fieldId: "custcol_service_date_by_seiu",
                    value: transmitDate,
                    line: i,
                  });

                  approvedDate = transmitDate;
                } else {
                  log.debug("transmitDate else part execute");
                  approvedDate = ItemDateString;
                }
              } else {
                copeRecord.setSublistValue({
                  sublistId: "line",
                  fieldId: "custcol_service_date_by_seiu",
                  value: transmitDate,
                  line: i,
                });
              }

              log.debug(" approvedDate part execute ** " + approvedDate);

              var serviceDate = copeRecord.getSublistValue({
                sublistId: "line",
                fieldId: "custcol_service_date",
                line: i,
              });

              var diffrenceDays = calculateDate(approvedDate, serviceDate);
              var headerAmount = fundAmountDetermine(
                copeRecord,
                diffrenceDays,
                i
              );
              totalQualifiedAmount += headerAmount.qualified;
              totalUnqualifiedAmount += headerAmount.notQualified;
            }
          }
        }

        log.debug("totalQualifiedAmount  is**" + totalQualifiedAmount);
        log.debug("totalUnqualifiedAmount  is**" + totalUnqualifiedAmount);

        copeRecord.setValue({
          fieldId: "custbody_seiu_qualifying_funds",
          value: totalQualifiedAmount,
        });

        copeRecord.setValue({
          fieldId: "custbody_seiu_non_qualifying_funds",
          value: totalUnqualifiedAmount,
        });

        log.debug(
          "totalQualifiedAmount is" +
          totalQualifiedAmount +
          "and totalUnqualifiedAmount is" +
          totalUnqualifiedAmount
        );

        // var id = copeRecord.save();
        // var id = copeRecord.save({
        //     enableSourcing: true,
        //     ignoreMandatoryFields: true
        // })

        // log.debug({
        //     title: "cope id",
        //     details: id
        // })
      } catch (userError) {
        log.debug({
          title: "error during copeform script execution",
          details: userError,
        });

        log.error({
          title: "Error is ",
          details: userError.message,
        });
      }
    // }
  }

  function calculatePayRollDeduction(amount, days) {
    // var status = "";
    var funds = {
      qualifyingAmount: 0,
      nonQualifyingAMount: 0,
    };
    if (!isPACAcc) {
      if (days <= 30) {
        funds.qualifyingAmount = amount;
      } else {
        funds.nonQualifyingAMount = amount;
      }
    } else {
      funds.qualifyingAmount = amount;
    }

    return funds;
  }

  // Calculate and assign the amount for Individual Contributions: $50 or less.
  function calLessIndContrilbution(amount, days) {
    // var status = "";
    var funds = {
      qualifyingAmount: 0,
      nonQualifyingAMount: 0,
    };
    if (!isPACAcc) {
      // if (amount <= 50) {
      if (days <= 30) {
        funds.qualifyingAmount = amount;
      } else {
        funds.nonQualifyingAMount = amount;
      }
      // }
    } else {
      funds.qualifyingAmount = amount;
    }

    return funds;
  }

  // Calculate and assign the amount for Individual Contributions: $50 or less.
  function calOverIndContrilbution(amount, days) {
    // var status = "";
    var funds = {
      qualifyingAmount: 0,
      nonQualifyingAMount: 0,
    };
    if (!isPACAcc) {
      if (amount >= 50) {
        if (days <= 10) {
          funds.qualifyingAmount = amount;
        } else {
          funds.nonQualifyingAMount = amount;
        }
      }
    } else {
      funds.qualifyingAmount = amount;
    }

    return funds;
  }

  function calEtcCollectionRaffles(amount, days) {
    // var status = "";
    var funds = {
      qualifyingAmount: 0,
      nonQualifyingAMount: 0,
    };
    if (!isPACAcc) {
      if (days <= 30) {
        funds.qualifyingAmount = amount;
      } else {
        funds.nonQualifyingAMount = amount;
      }
    } else {
      funds.qualifyingAmount = amount;
    }

    return funds;
  }

  function calNonQualifyingCope(amount, days) {
    var funds = {
      qualifyingAmount: 0,
      nonQualifyingAMount: 0,
    };
    if (!isPACAcc) {
      funds.nonQualifyingAMount = amount;
    } else {
      funds.qualifyingAmount = 0;
    }
    return funds;
  }

  function fundAmountDetermine(copeRecord, days, index) {
    var funds = {};

    var copeItems = {
      payRollDeduction: "848",
      moreindividualContribution: "850",
      lessindividualContribution: "849",
      collections: "851",
      nonQualifyingCope: "852",
    };

    var sublistId = "line";

    var lineAmount = copeRecord.getSublistValue({
      sublistId: sublistId,
      fieldId: "amount",
      line: index,
    });

    var itemId = copeRecord.getSublistValue({
      sublistId: sublistId,
      fieldId: "custcol_membership_item",
      line: index,
    });

    if (itemId == copeItems.collections) {
      funds = calEtcCollectionRaffles(lineAmount, days);
      return distributeFunds(copeRecord, funds, index);
    } else if (itemId == copeItems.lessindividualContribution) {
      funds = calLessIndContrilbution(lineAmount, days);
      return distributeFunds(copeRecord, funds, index);
    } else if (itemId == copeItems.moreindividualContribution) {
      funds = calOverIndContrilbution(lineAmount, days);
      return distributeFunds(copeRecord, funds, index);
    } else if (itemId == copeItems.payRollDeduction) {
      funds = calculatePayRollDeduction(lineAmount, days);
      return distributeFunds(copeRecord, funds, index);
    } else if (itemId == copeItems.nonQualifyingCope) {
      funds = calNonQualifyingCope(lineAmount, days);
      return distributeFunds(copeRecord, funds, index);
    } else {
      return {
        qualified: 0,
        notQualified: 0,
      };
    }
  }

  function distributeFunds(copeRecord, funds, index) {
    var sublistId = "line";
    copeRecord.setSublistValue({
      sublistId: sublistId,
      fieldId: "custcol_qualifying_funds",
      line: index,
      value: funds.qualifyingAmount,
    });

    copeRecord.setSublistValue({
      sublistId: sublistId,
      fieldId: "custcol_non_qualifying_funds",
      line: index,
      value: funds.nonQualifyingAMount,
    });

    return {
      qualified: funds.qualifyingAmount,
      notQualified: funds.nonQualifyingAMount,
    };
  }

  // find out the Diffrence date of given dates.
  function calculateDate(transmitDate, serviceDate) {
    const processtransmitDate = new Date(transmitDate);
    const prossserviceDate = new Date(serviceDate);

    // const getdate2 = formateDate(serviceDate);
    log.debug(
      "transmitDate " +
      processtransmitDate +
      " serviceDate " +
      processtransmitDate
    );

    const diffTime = Math.abs(
      processtransmitDate.getTime() - prossserviceDate.getTime()
    );
    //    log.debug(diffTime + " diffTime");
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    log.debug(diffDays + " days");
    return diffDays;
  }

  // covert netsuite date to calculation date.
  function formateDate(date) {
    var dateCorresion = new Date(date);
    log.debug("dateCorresion", dateCorresion);
    var transDate = dateCorresion.toLocaleDateString();
    var dteArray = transDate.split(" ");
    var month = {
      January: 01,
      Feburary: 02,
      March: 03,
      April: 04,
      May: 05,
      June: 06,
      July: 07,
      August: 08,
      September: 09,
      October: 10,
      November: 11,
      December: 12,
    };

    return (
      month[dteArray[0]] +
      "/" +
      dteArray[1].replace(",", "") +
      "/" +
      dteArray[2]
    );
  }

  function afterSubmit(context){
    log.debug("calcuateObligatinAmount process start");
  
      var currRecord = context.newRecord;

  
      var year = currRecord.getValue({
        fieldId: "custbodycope_year",
      });
  
      var localCustomer = currRecord.getValue({
        fieldId: "custbody_local_customer",
      });
  
      log.debug("year is " + year + " local customer is " + localCustomer);
      var totalAmount = 0;
      if (localCustomer && year) {
        
      totalAmount =  calculatedContributionAmount(localCustomer,year);

       setObligationRecordTotalAmount(localCustomer,year,"custrecord220",totalAmount);

      totalAmount = calcuteReversalQaulifingAmount(getcustomerDetails(localCustomer),year);
      setObligationRecordTotalAmount(localCustomer,year,"",totalAmount);

       calcuteReversalNonQaulifingAmount(getcustomerDetails(localCustomer),year);
       calcuteReversalHoldAmount(getcustomerDetails(localCustomer),year);
  
        // runAdjustment(context);
      }
  
    
      
      // serach form with and give result of calucated obligation amount.
     
  }

  function calculatedContributionAmount(localCustomer,year) {
    var totalAmount = 0;
    var transactionSearchObj = search.create({
      type: "transaction",
      filters: [
        ["type", "anyof", "Custom108"],
        "AND",
        ["custbodycope_year", "is", year],
        "AND",
        ["custbody_seiu_qualifying_funds", "isnotempty", ""],
        "AND",
        ["custbody_seiu_non_qualifying_funds", "isnotempty", ""],
        "AND",
        ["custbody_status", "anyof", "4"],
        "AND",
        ["mainline", "is", "T"],
        "AND",
        ["custbody_local_customer", "anyof", localCustomer],
      ],
      columns: [
        search.createColumn({
          name: "formulacurrency",
          summary: "SUM",
          formula:
            "{custbody_seiu_qualifying_funds}+(2/3*{custbody_seiu_non_qualifying_funds})",
          label: "obligationResult",
        }),
      ],
    });
    var searchResultCount = transactionSearchObj.runPaged().count;
    log.debug("transactionSearchObj result count", searchResultCount);
    transactionSearchObj.run().each(function (result) {
      // .run().each has a limit of 4,000 results
      totalAmount = result.getValue({
        name: "formulacurrency",
        summary: "SUM",
      });

      log.debug("resulst is" + totalAmount);
      return true;
    });

    return totalAmount;

    /*
   transactionSearchObj.id="customsearch1654783312828";
   transactionSearchObj.title="cope obligation distribution sk script (copy)";
   var newSearchId = transactionSearchObj.save();
   */
  }

  function setObligationRecordTotalAmount(localCustomer,year,obliationFieldId,amount){
       // serach record to set total amount in cope obligation field.
       var customrecord_seiu_cope_obligationSearchObj = search.create({
        type: "customrecord_seiu_cope_obligation",
        filters: [
          ["custrecord218", "anyof", localCustomer],
          "AND",
          ["custrecord_script_year", "is", year],
        ],
        columns: [
          search.createColumn({ name: "internalid", label: "Internal ID" }),
        ],
      });
      var searchResultCount =
        customrecord_seiu_cope_obligationSearchObj.runPaged().count;
      log.debug(
        "customrecord_seiu_cope_obligationSearchObj result count",
        searchResultCount
      );
      customrecord_seiu_cope_obligationSearchObj.run().each(function (result) {
        // .run().each has a limit of 4,000 results
        var recordId = result.getValue({
          name: "internalid"
        });
  
        log.debug("record id is " + recordId);
  
        if (totalAmount > 0) {
  
          var updatedRecord = record.submitFields({
            type: "customrecord_seiu_cope_obligation",
            id: recordId,
            values: { obliationFieldId: amount }
          });
  
          log.debug("Updated record is " + updatedRecord);
  
        }
        return true;
      });

      //localCustomer,year,obliationFieldId,amount

      
  
      /*
   customrecord_seiu_cope_obligationSearchObj.id="customsearch1654784421346";
   customrecord_seiu_cope_obligationSearchObj.title="COPE Obligation Search sk (copy)";
   var newSearchId = customrecord_seiu_cope_obligationSearchObj.save();
   */
  }

  

  // get the customer data to to set on line level.
  function getcustomerDetails(recordId) {
    var localList = record.load({
      type: "customrecord_localized",
      id: recordId,
    });

    var customerId = localList.getValue({
      fieldId: "custrecord_lz_customer",
    });


    return parseInt(customerId);
  }

  function runAdjustment(context) {
    var currRecord = context.newRecord;
    var tranStatus = currRecord.getValue({
      fieldId: "custbody_status"
    });

    //cehcking the status is approved.
    if (tranStatus == 4) {

      var islink = false

      var qualifyingCD = currRecord.getValue({
        fieldId: "custbody_qualifying_cd"
      });

      var nonQualifyingCD = currRecord.getValue({
        fieldId: "custbody_cd_non_qualifying"
      });

      var holdCD = currRecord.getValue({
        fieldId: "custbody_cd_hold_acc"
      });

      var customerId = getcustomerDetails(currRecord.getValue({
        fieldId: "custbody_local_customer"
      }));

      var localCustomer = currRecord.getValue({
        fieldId: "custbody_local_customer"
      });

      debugger;

      var cdRecord = record.load({
        type: "customtransaction_cd_101",
        id: qualifyingCD
      });

      var headerMemo = cdRecord.getValue({
        fieldId: "memo"
      });

      var postingDate = cdRecord.getValue({
        fieldId: "trandate"
      });

      var PrimaryAttachment = cdRecord.getValue({
        fieldId: "custbody_prim_attach"
      });

      var transactionIndex = cdRecord.findSublistLineWithValue({
        sublistId: "line",
        fieldId: "entity",
        value: customerId
      });

      var lineAmount = 0;
      var paymentMethod = 0;

      if (transactionIndex != -1) {

        lineAmount = cdRecord.getSublistValue({
          sublistId: "line",
          fieldId: "amount",
          line: transactionIndex
        });

        paymentMethod = cdRecord.getSublistValue({
          sublistId: "line",
          fieldId: "custcol_cd_pay_meth",
          line: transactionIndex
        });


      } else {
        customerId = "";
      }

      if (qualifyingCD) {
        var adjustmentRecordList = [];
        adjustmentRecordList.push({
          Fields: {
            CashDeposit: qualifyingCD,
            Record: "Non-Qualifying",
            postingDate: postingDate,
            PrimaryAttachment: PrimaryAttachment,
            Memo: headerMemo,
            LocalCustomer: localCustomer,
            AdjustmentAmount: lineAmount,
            TransmittalID: currRecord.id,
            PaymentMethod: paymentMethod
          },
        });

        log.debug("adjustmentRecordList", adjustmentRecordList);
        createdAdjustmentTranList =
          adjustment.CreateAdjustmentTransactions(adjustmentRecordList);

        log.debug("createdAdjustmentTranList", createdAdjustmentTranList);
        log.debug("transLines[j].copeId", currRecord.id);

        if (createdAdjustmentTranList.length > 0) {
          record.submitFields({
            type: "customtransaction108",
            id: currRecord.id,
            values: {
              "custbody_adj_noqualifying_cash_deposit": createdAdjustmentTranList[0].cashDeposit,
              "custbody_adj_nonqualifying_vendor_bill": createdAdjustmentTranList[0].vendorBill,
            },
          });
        }
      }// end qualifying adjustment

      if (nonQualifyingCD) {
        var adjustmentRecordList = [];
        adjustmentRecordList.push({
          Fields: {
            CashDeposit: nonQualifyingCD,
            Record: "Qualifying",
            postingDate: postingDate,
            PrimaryAttachment: PrimaryAttachment,
            Memo: headerMemo,
            LocalCustomer: localCustomer,
            AdjustmentAmount: lineAmount,
            TransmittalID: currRecord.id,
            PaymentMethod: paymentMethod
          },
        });

        log.debug("adjustmentRecordList", adjustmentRecordList);
        createdAdjustmentTranList =
          adjustment.CreateAdjustmentTransactions(adjustmentRecordList);

        log.debug("createdAdjustmentTranList", createdAdjustmentTranList);
        log.debug("transLines[j].copeId", currRecord.id);

        if (createdAdjustmentTranList.length > 0) {
          record.submitFields({
            type: "customtransaction108",
            id: transmittalId,
            values: {
              "custbody_adj_qualifying_cash_deposit": createdAdjustmentTranList[0].cashDeposit,
              "custbody_adjustment_qual_vb": createdAdjustmentTranList[0].vendorBill,
            },
          });
        }
      }// end non-qualifying adjustment
    }
  }

  return {
    beforeSubmit: determineCopeFunds,
    afterSubmit: afterSubmit,
  };
});
