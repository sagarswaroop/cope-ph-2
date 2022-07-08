/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(["N/record", "N/search", "N/url"], function (record, search, url) {
  function pageInit(context) {
    try {
      debugger;

      var currRecord = context.currentRecord;
      var recordId = 0;

      // try {

      recordId = currRecord.id;
      log.debug("currRecord.id", recordId);
      // } catch (error) {
      //     log.debug("error during getting record id ",error);
      // }

      var resultFilters = [];

      var transmittalpaymentMethods = {
        ach: 1,
        check: 2,
        wire: 3,
      };

      var copePaymentMethods = {
        ach: 1,
        check: 2,
        wire: 5,
      };

      var tranStatus = currRecord.getValue({
        fieldId: "custbody_status",
      });

      //cehcking the status is submit for approval.
      if (tranStatus == 2) {
        var islink = false;

        // var qualifyingCD = currRecord.getValue({
        //     fieldId: "custbody_qualifying_cd"
        // });

        // var nonQualifyingCD = currRecord.getValue({
        //     fieldId: "custbody_cd_non_qualifying"
        // });

        // var holdCD = currRecord.getValue({
        //     fieldId: "custbody_cd_hold_acc"
        // });

        // debugger;

        // if (qualifyingCD) {
        //     islink = true
        // } else if (nonQualifyingCD) {
        //     islink = true
        // } else if (holdCD) {
        //     islink = true
        // } else {
        //     islink = false;
        // }

        if (!islink) {
          var copeObjects = {
            customer: "custbody_local_customer",
            localNonQualiyingFund: "custbody_local_non_qualifying_fund",
            localQualiyingFund: "custbody_local_qualifying_funds",
            paymentMethod: currRecord.getSublistValue({
              sublistId: "line",
              fieldId: "custcol_seiu_payment_method",
              line: 0
            }),
            holdAcc: "custbody_cust_bank_hold_acc",
            amount: "total",
            recordId: recordId,
          };

          for (var field in copeObjects) {
            var fieldId = copeObjects[field];
            if (field == "recordId" || field == "paymentMethod") {
              continue;
            } else {
              copeObjects[field] = currRecord.getValue({
                fieldId: fieldId,
              });
            }
          }

          log.debug({
            title: "COpe object data is",
            details: copeObjects,
          });

          debugger;

          if (!copeObjects.holdAcc) {
            if (copeObjects.paymentMethod == transmittalpaymentMethods.ach) {
              // var amount = copeObjects.localQualiyingFund > 0 ? copeObjects.localQualiyingFund : copeObjects.localNonQualiyingFund;
              // log.debug("amount is " + amount);
              resultFilters = [
                ["type", "anyof", "Custom105"],
                "AND",
                ["name", "anyof", getcustomerDetails(copeObjects.customer)],
                "AND",
                ["custcol_seiu_source_record", "anyof", "@NONE@"],
                "AND",
                ["custcol_cd_pay_meth", "anyof", copePaymentMethods.ach],
                "AND",
                ["custcol_cdt", "anyof", 2],
                // "AND",
                // ["amount", "equalto", -amount]
              ];

              //custcol_cdt
            } else if (
              copeObjects.paymentMethod == transmittalpaymentMethods.check
            ) {
              // var amount = copeObjects.localQualiyingFund > 0 ? copeObjects.localQualiyingFund : copeObjects.localNonQualiyingFund;
              // log.debug("amount is " + amount);
              resultFilters = [
                ["type", "anyof", "Custom105"],
                "AND",
                ["name", "anyof", getcustomerDetails(copeObjects.customer)],
                "AND",
                ["custcol_seiu_source_record", "anyof", "@NONE@"],
                "AND",
                ["custcol_cd_pay_meth", "anyof", copePaymentMethods.check],
                "AND",
                ["custcol_cdt", "anyof", 2],
                // "AND",
                // ["amount", "equalto", -amount]
              ];
            } else if (
              copeObjects.paymentMethod == transmittalpaymentMethods.wire
            ) {
              // var amount = copeObjects.localQualiyingFund > 0 ? copeObjects.localQualiyingFund : copeObjects.localNonQualiyingFund;
              // log.debug("amount is " + amount);
              resultFilters = [
                ["type", "anyof", "Custom105"],
                "AND",
                ["name", "anyof", getcustomerDetails(copeObjects.customer)],
                "AND",
                ["custcol_seiu_source_record", "anyof", "@NONE@"],
                "AND",
                ["custcol_cd_pay_meth", "anyof", copePaymentMethods.wire],
                "AND",
                ["custcol_cdt", "anyof", 2],
                // "AND",
                // ["amount", "equalto", -amount]
              ];
            } else {
              log.debug(" the selecte payemnt is not valid");
            }
          } else {
            // var amount = -copeObjects.amount
            // log.debug("amount is " + amount);

            var methods =
              copeObjects.paymentMethod == copePaymentMethods.ach ||
              copeObjects.paymentMethod == copePaymentMethods.check
                ? copeObjects.paymentMethod
                : copePaymentMethods.wire;
            resultFilters = [
              ["type", "anyof", "Custom105"],
              "AND",
              ["name", "anyof", getcustomerDetails(copeObjects.customer)],
              "AND",
              ["custcol_seiu_source_record", "anyof", "@NONE@"],
              "AND",
              ["custcol_cd_pay_meth", "anyof", methods],
              "AND",
              ["custcol_cdt", "anyof", 2],
              // "AND",
              // ["amount", "equalto", amount],
              "AND",
              ["custbody_seiu_cd_fundtype", "anyof", "3"],
            ];
          }

          log.debug("filter is ", resultFilters);
          var isRecordExist;
          if (resultFilters.length > 0) {
            isRecordExist = searchCopeRecord(resultFilters);
          }

          if (isRecordExist) {
            // var suiteletURL = '/app/site/hosting/scriptlet.nl?script=1184&deploy=1';
            var suiteletURL = url.resolveScript({
              scriptId: "customscript_show_created_dep_for_cope",
              deploymentId: "customdeploy_show_created_dep_for_cope",
              returnExternalUrl: false,
              params: copeObjects,
              // {
              //     'Name': getcustomerDetails(copeObjects.customer),
              //     'method': copeObjects.paymentMethod,
              //     'QaulifyingAmount': copeObjects.localQualiyingFund,
              //     'nonQualifyingAmount': copeObjects.localNonQualiyingFund,
              //     'type' :
              // }
            });

            // var SuitURLwithParam = suiteletURL +"&docnum="+ +"&date="+ +"&fundtype="+ +"&memo="+ +"&amount="+ ;
            var isOk = confirm(
              "Some Cash Deposits Transaction is matched for this Transaction\n Please click on 'Ok' to view"
            );

            if (isOk) {
              // alert("is ok pressed " + isOk);
              window.open(
                suiteletURL,
                "MsgWindow",
                "left=200,top=200,width=1200,height=620"
              );
            }
          } else {
            return isRecordExist;
          }
        }
      }
    } catch (error) {
      log.debug("error is ", error);
    }
  }

  //search the transmital cope already exist.
  function searchCopeRecord(dynamicFilter) {
    var transactionSearchObj = search.create({
      type: "transaction",
      filters: dynamicFilter,
      columns: [
        search.createColumn({
          name: "entity",
          label: "Name",
        }),
        search.createColumn({
          name: "custbody_seiu_cd_fundtype",
          label: "Type of Amount",
        }),
        search.createColumn({
          name: "custcol_entity_type",
          label: "Entity Type",
        }),
        search.createColumn({
          name: "custcol_cd_pay_meth",
          label: "Payment Method",
        }),
        search.createColumn({
          name: "amount",
          label: "Amount",
        }),
      ],
    });
    var searchResultCount = transactionSearchObj.runPaged().count;
    log.debug("transactionSearchObj result count", searchResultCount);
    //  transactionSearchObj.run().each(function(result){
    //     // .run().each has a limit of 4,000 results
    //     return true;
    //  });

    if (searchResultCount > 0) {
      return true;
    } else {
      return false;
    }

    /*
        transactionSearchObj.id="customsearch1655238991736";
        transactionSearchObj.title="Suitelet cash deposit (copy)";
        var newSearchId = transactionSearchObj.save();
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

  function saveRecord(context) {
    debugger;
    var currRecord = context.currentRecord;

    if (currRecord.type == "customtransaction108") {
      return true;
    } else {
      // var dateObj = currRecord.getValue({
      //     fieldId: "custpage_add_date"
      // });

      var linecounts = currRecord.getLineCount({
        sublistId: "custpage_deposit_list",
      });

      var counter = 0;
      var isSelect = false;
      if (linecounts > 0) {
        for (var index = 0; index < linecounts; index++) {
          // const element = array[index];
          var selectedRow = currRecord.getSublistValue({
            sublistId: "custpage_deposit_list",
            fieldId: "custpage_cd_select",
            line: index,
          });

          // var fundType = currRecord.getSublistValue({
          //   sublistId: "custpage_deposit_list",
          //   fieldId: "custpage_rec_fund_type",
          //   line: index
          // });

          if (selectedRow) {
            isSelect = true;
          }
        }
      }

      if (isSelect) {
        return true;
      } else {
        alert("Please select a record to attach.");
        return isSelect;
      }

      // debugger;
      // var currRecord = context.currentRecord;

      // var dateObj = currRecord.getValue({
      //     fieldId: "custpage_add_date"
      // });

      // var date = dateObj.getDate();
      // var month = dateObj.getMonth()+1;
      // var year = dateObj.getFullYear();

      // var BankRecDate = month+"/"+date+"/"+year;

      // // var checkDate = format.parse({
      // //     value: BankRecDate,
      // //     type: format.Type.DATE
      // // });

      // // log.debug({
      // //     title: "checkDate",
      // //     details: checkDate
      // // });

      // var transactionSearchObj = search.create({
      //     type: "transaction",
      //     filters: [
      //       ["type", "anyof", "Custom108"],
      //       "AND",
      //       [
      //         "custbody_seiu_cope_bank_rec_date",
      //         "within",
      //         BankRecDate,
      //         BankRecDate,
      //       ],
      //       "AND",
      //       ["mainline", "is", "T"],
      //       "AND",
      //       ["custbody_status", "anyof", "4"],
      //       "AND",
      //       ["custbody_cd_hold_acc", "is", "@NONE@"],
      //       "AND",
      //       ["custbody_qualifying_cd", "is", "@NONE@"],
      //       "AND",
      //       ["custbody_cd_non_qualifying", "is", "@NONE@"],
      //     ],
      //     columns: [
      //       search.createColumn({ name: "internalid", label: "Internal ID" }),
      //       search.createColumn({
      //         name: "custbody_local_customer",
      //         label: "Local Customer",
      //       }),
      //       search.createColumn({
      //         name: "custbody_local_non_qualifying_fund",
      //         label: "Local Non-Qualifying Funds",
      //       }),
      //       search.createColumn({
      //         name: "custbody_local_qualifying_funds",
      //         label: "Local Qualifying Funds",
      //       }),
      //       search.createColumn({
      //         name: "custbody_seiu_non_qualifying_funds",
      //         label: "SEIU Non-Qualifying Funds",
      //       }),
      //       search.createColumn({
      //         name: "custbody_seiu_qualifying_funds",
      //         label: "SEIU Qualifying Funds",
      //       }),
      //       search.createColumn({ name: "amount", label: "Amount" }),
      //       search.createColumn({
      //         name: "custbody_ctf_payment_method_header",
      //         label: "Payment Method (Header)",
      //       }),
      //       search.createColumn({
      //         name: "custbody_seiu_cope_bank_rec_date",
      //         label: "Bank received date",
      //       }),
      //       search.createColumn({
      //         name: "custbody_cust_bank_hold_acc",
      //         label: "Bank hold Acc",
      //       }),
      //       search.createColumn({
      //         name: "custbody_seiu_pac_bank_acc",
      //         label: "PAC Bank Account",
      //       }),
      //       search.createColumn({
      //         name: "custbody_seiu_support_docs",
      //         label: "Supporting Document",
      //       }),
      //     ],
      //   });
      //   var searchResultCount = transactionSearchObj.runPaged().count;

      //   if(searchResultCount>0){
      //       return true;
      //   }else{
      //       alert("No data found for selected date");
      //       return false;
      //   }
    }

    
  }

  function validateField(context) {}

  function fieldChanged(context) {}

  function postSourcing(context) {}

  function lineInit(context) {}

  function validateDelete(context) {}

  function validateInsert(context) {}

  function validateLine(context) {
    var currRecord = context.currentRecord;
    debugger;

    if (currRecord.type == "customtransaction108") {
      return true;
    } else {
      var isSelect = currRecord.getCurrentSublistValue({
        sublistId: "custpage_deposit_list",
        fieldId: "custpage_cd_select",
      });

      var fundType = currRecord.getCurrentSublistValue({
        sublistId: "custpage_deposit_list",
        fieldId: "custpage_rec_fund_type",
      });

      if (isSelect) {
        if (fundType == "") {
          alert("Please select the transaction with fund type.");
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  function sublistChanged(context) {}

  function backtoForm(recordId) {
    log.debug("backtoForm is called....");
    window.close();

    // var output = url.resolveRecord({
    //   isEditMode: true,
    //   recordId: recordId,
    //   recordType: "customtransaction108",
    // });
    // window.open(output, "_self");
  }

  return {
    pageInit: pageInit,
    backtoForm: backtoForm,
    saveRecord: saveRecord,
    // validateField: validateField,
    // fieldChanged: fieldChanged,
    // postSourcing: postSourcing,
    // lineInit: lineInit,
    // validateDelete: validateDelete,
    // validateInsert: validateInsert,
    validateLine: validateLine,
    // sublistChanged: sublistChanged
  };
});
