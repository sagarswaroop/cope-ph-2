/**
 * @NApiVersion 2.x
 */

define([
  "N/log",
  "N/ui/serverWidget",
  "N/record",
  "N/search",
  "N/format",
  "N/runtime",
], function (log, serverWidget, record, search, format, runtime) {
  function CreateAdjustmentTransactions(cashDeposit) {
    var adjustmentTranList = [];
    var subsidiary,
      account,
      PrimaryAttachment,
      line_type,
      line_lineAccount,
      line_department,
      line_projectCode,
      line_paymentMethod;
    var line_account;
    var attachment;
    var paymentMethod;
    var entityName;
    var localCode;
    var vendorBillQualifyingVendor = 3140; // 10290 SEIU COPE Fund
    var vendorBillNonQualifyingVendor = 3152; // 10458 SEIU General Fund
    var vendorBillVendor;
    var cashDepositLM2Code,
      cashDepositLM2Purpose = "";
    var objUser = runtime.getCurrentUser();
    var vendorBillLineDepartment;
    var vendorBillLineStateCode;
    var vendorBillLineLocalCode;
    var vendorBillLineLM2Code;
    var vendorBillLineLM2Purpose;
    var vendorBillLineAccount;
    var vendorBillTransactionType;
    var OTHERS = 9;
    var cashDepositSubsidiay;
    var CONTRIB = 105;
    var accountCD;
    var line_typeCD;
    var line_accountCD;
    var line_departmentCD;
    var line_projectCodeCD;
    var CDLINELM2Code;
    var CDLINELM2Purpose;
    var CDLINEStateCode;
    var cashDepositMemo;

    const accountsData = {
      qaulifyingAccount: getAccount(1),
      nonQaulifyingAccount: getAccount(2),
      holdAccount: getAccount(3),
    };

    // log.debug("accountsData",accountsData);

    const copePaymentMethods = {
      ach: 1,
      check: 2,
      wire: 5,
    };

    log.debug("deposit data", cashDeposit);
    for (var index = 0; index < cashDeposit.length; index++) {
      var transFields = cashDeposit[index].Fields;

        // log.debug("LocalCustomer",transFields.LocalCustomer);

      entityName = getcustomerDetails(transFields.LocalCustomer).customerId;
      localCode = getcustomerDetails(transFields.LocalCustomer).customerCode;
      paymentMethod = transFields.PaymentMethod;

      if (paymentMethod == copePaymentMethods.ach) line_paymentMethod = 1;
      else if (paymentMethod == copePaymentMethods.check)
        line_paymentMethod = 2;
      else if (paymentMethod == copePaymentMethods.wire) line_paymentMethod = 5;

      if (transFields.Record == "Qualifying") {
        subsidiary = accountsData.nonQaulifyingAccount.subsidiary;
        account = accountsData.nonQaulifyingAccount.glAccount;
        line_type = 2; // cash sale
        line_account = accountsData.nonQaulifyingAccount.lineAccount;
        line_department = accountsData.nonQaulifyingAccount.department;
        line_projectCode = accountsData.nonQaulifyingAccount.projectCode;

        vendorBillLineLM2Code = OTHERS;
        vendorBillLineLM2Purpose = CONTRIB;
        //line_paymentMethod= copePaymentMethods.ach;
        vendorBillVendor = vendorBillQualifyingVendor;
        // vendorBillLineDepartment=101;
        vendorBillLineStateCode = 103; // --- value
        // vendorBillLineLocalCode=1;

        // vendorBillLineAccount=357;
        vendorBillTransactionType = 1;

        //cash deposit fields.
        cashDepositSubsidiay = accountsData.qaulifyingAccount.subsidiary;
        accountCD = accountsData.qaulifyingAccount.glAccount; // qual, non-qyal or hold acc.
        line_accountCD = accountsData.qaulifyingAccount.lineAccount;
        line_departmentCD = accountsData.qaulifyingAccount.department;
        line_projectCodeCD = accountsData.qaulifyingAccount.projectCode;
        CDLINELM2Code = OTHERS; 
        CDLINELM2Purpose = 203;  // ---
        cashDepositMemo = transFields.Memo;
      } else if (transFields.Record == "Non-Qualifying") {
        subsidiary = accountsData.qaulifyingAccount.subsidiary;
        account = accountsData.qaulifyingAccount.glAccount; // qual, non-qyal or hold acc.
        line_type = 2; // cash sale
        line_account = accountsData.qaulifyingAccount.lineAccount;
        line_department = accountsData.qaulifyingAccount.department;
        line_projectCode = accountsData.qaulifyingAccount.projectCode;
        vendorBillVendor = vendorBillNonQualifyingVendor;
        vendorBillLineLM2Code = OTHERS;
        vendorBillLineLM2Purpose = 203;
        vendorBillLineStateCode = 103; // --- value
        vendorBillTransactionType = 2;

        //cash deposit fields.
        cashDepositSubsidiay = accountsData.nonQaulifyingAccount.subsidiary;
        accountCD = accountsData.nonQaulifyingAccount.glAccount; // qual, non-qyal or hold acc.
        line_accountCD = accountsData.nonQaulifyingAccount.lineAccount;
        line_departmentCD = accountsData.nonQaulifyingAccount.department;
        line_projectCodeCD = accountsData.nonQaulifyingAccount.projectCode;
        CDLINELM2Code = OTHERS; 
        CDLINELM2Purpose = 203; 
        cashDepositMemo = transFields.Memo + "NQ";
      } else if (transFields.Record == "Hold-Qualifying") {
        subsidiary = accountsData.holdAccount.subsidiary;
        account = accountsData.holdAccount.glAccount; // qual, non-qyal or hold acc.
        line_type = 2; // cash sale
        line_account = accountsData.holdAccount.lineAccount;
        line_department = accountsData.holdAccount.department;
        line_projectCode = accountsData.holdAccount.projectCode;
        vendorBillVendor = vendorBillQualifyingVendor;
        vendorBillLineStateCode = 103; // --- value
        vendorBillLineLM2Code = 19; // 22 - To Affiliates of Funds Collected on Their Behalf
        vendorBillLineLM2Purpose = "";
        vendorBillTransactionType = 3;

        //cash deposit fields.
        cashDepositSubsidiay = accountsData.qaulifyingAccount.subsidiary;
        accountCD = accountsData.qaulifyingAccount.glAccount; // qual, non-qyal or hold acc.
        line_accountCD = accountsData.qaulifyingAccount.lineAccount;
        line_departmentCD = accountsData.qaulifyingAccount.department;
        line_projectCodeCD = accountsData.qaulifyingAccount.projectCode;
        CDLINELM2Code = 7; //11 - On Behalf of Affiliates for Transmittal to Them;
        CDLINELM2Purpose = 203; // 	---
        cashDepositMemo = transFields.Memo;

        // cashDepositSubsidiay = accountsData.qaulifyingAccount.subsidiary;
        // cashDepositLM2Code = 7; //11 - On Behalf of Affiliates for Transmittal to Them
      } else if (transFields.Record == "Hold-NonQualifying") {
        subsidiary = accountsData.holdAccount.subsidiary;
        account = accountsData.holdAccount.glAccount; // qual, non-qyal or hold acc.
        line_type = 2; // cash sale
        line_account = accountsData.holdAccount.lineAccount;
        line_department = accountsData.holdAccount.department;
        line_projectCode = accountsData.holdAccount.projectCode;
        vendorBillVendor = vendorBillNonQualifyingVendor;
        vendorBillLineDepartment = 59;
        vendorBillLineStateCode = 103; // --- value
        vendorBillLineLM2Code = 19; // 22 - To Affiliates of Funds Collected on Their Behalf
        vendorBillLineLM2Purpose = "";
        vendorBillTransactionType = 4;

        //cash deposit fields.
        cashDepositSubsidiay = accountsData.nonQaulifyingAccount.subsidiary;
        accountCD = accountsData.nonQaulifyingAccount.glAccount; // qual, non-qyal or hold acc.
        line_accountCD = accountsData.nonQaulifyingAccount.lineAccount;
        line_departmentCD = accountsData.nonQaulifyingAccount.department;
        line_projectCodeCD = accountsData.nonQaulifyingAccount.projectCode;
        CDLINELM2Code = OTHERS;
        CDLINELM2Purpose = CONTRIB;
        cashDepositMemo = transFields.Memo + "NQ";

        // cash depoist fields.
        cashDepositSubsidiay = accountsData.holdAccount.subsidiary;
        cashDepositLM2Code = 9; //cseg1 "13 - Other"
        cashDepositLM2Purpose = 105; //cseg2 "	CONTRIB - Contribution"
      }

      if (!transFields.attachment) transFields.attachment = 174041;

      // ********************************* START : Cash Deposit Creation *******************************************************************************

      // Cash Deposit Header Fields
      //   var cashDepositAccount = account;
      var cashDepositPostingDate = transFields.postingDate;
      var cashDepositAttachment = transFields.attachment;
      var cashDepositID = transFields.CashDeposit;
      var cdBatchID = transFields.originBatchId;
      

      // Cash Deposit Line Fields
      // var cashDepositLineAccount = account;
      var cashDepositLineEntity = entityName;
      var cashDepositLineCashDepositType = line_type;
      //   var cashDepositLineLineAccount = line_account;
      var cashDepositLinePaymentMethod = line_paymentMethod;
      var cashDepositLineyear = transFields.Year;
      var cashDepositLineAdjustmentAmount = transFields.AdjustmentAmount;
      var cashDepositLineSourceRecord = transFields.TransmittalID;
      //   var cashDepositLineDepartment = line_department;
      //   var cashDepositLineProjectCode = line_projectCode;
      var cashDepositLineLocalCode = localCode;
      var cashDepositLineStateCode = 103; // ---

      

      var cashDeposit = record.create({
        type: "customtransaction_cd_101",
        isDynamic: true,
      });

      // Add Header Fields

      cashDeposit.setValue({
        fieldId: "subsidiary",
        value: cashDepositSubsidiay,
      });

      cashDeposit.setValue({
        fieldId: "custbody_bk_acct",
        value: accountCD,
      });

      cashDeposit.setValue({
        fieldId: "custbody_seiu_cashdeposit_cd_batchid",
        value: cdBatchID,
      });

      cashDeposit.setValue({
        fieldId: "custbody_seiu_cd_cd_transection_no",
        value: cashDepositID,
      });

      

      cashDeposit.setValue({
        fieldId: "trandate",
        value: new Date(cashDepositPostingDate)
      });

      cashDeposit.setValue({ fieldId: "memo", value: cashDepositMemo });

      cashDeposit.setValue({
        fieldId: "custbody_prim_attach",
        value: cashDepositAttachment,
      });
      cashDeposit.setValue({
        fieldId: "custbody_total_batch",
        value: cashDepositLineAdjustmentAmount,
      });

      cashDeposit.setValue({
        fieldId: "custbody_batch_process",
        value: true,
      });

      // Add lines
      var lineNum = cashDeposit.selectNewLine({ sublistId: "line" });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "account",
        value: accountCD,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "entity",
        value: cashDepositLineEntity,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "custcol_cdt",
        value: cashDepositLineCashDepositType,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "custcol_tranmital_year",
        value: cashDepositLineyear,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "custcol_cr_acct",
        value: line_accountCD,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "custcol_cd_pay_meth",
        value: cashDepositLinePaymentMethod,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "amount",
        value: cashDepositLineAdjustmentAmount,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "custcol_seiu_source_record",
        value: cashDepositLineSourceRecord,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "department",
        value: line_departmentCD,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "cseg3",
        value: line_projectCodeCD,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "cseg_local_code",
        value: cashDepositLineLocalCode,
      });
      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "location",
        value: cashDepositLineStateCode,
      });

        cashDeposit.setCurrentSublistValue({
          sublistId: "line",
          fieldId: "cseg1",
          value: CDLINELM2Code,
          ignoreFieldChange: false
        });

      cashDeposit.setCurrentSublistValue({
        sublistId: "line",
        fieldId: "cseg2",
        value: CDLINELM2Purpose
      });

      cashDeposit.commitLine({ sublistId: "line" });

      var cashDepositRecordID = cashDeposit.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });
      //********************************* Update Initial Cash deposit adjustment id Update start*******************************************************************************
      /*if(accountCD==735)
      {
        record.submitFields({
          type: 'customtransaction_cd_101',
          id: cashDepositID,
          values: {'custbody_cope_adjustment_cash_deposit': cashDepositRecordID},
          // options: {
          //   enablesourcing: boolean,
        })
        // var InitialCashDeposit = record.load({
        //   type: "customtransaction_cd_101",
        //   id: cashDepositID,
        //   isDynamic: true,
        //   //defaultValues: Object
        // })
        // InitialCashDeposit.setValue({
        //   fieldId: "custbody_cope_adjustment_cash_deposit",
        //   value: cashDepositRecordID,
        //   ignoreFieldChange: true
        // });
        // InitialCashDeposit.save({
        //   enableSourcing: true,
        //   ignoreMandatoryFields: true
        // })
      }
      if(accountCD==737)
      {
        record.submitFields({
          type: 'customtransaction_cd_101',
          id: cashDepositID,
          values: {'custbody_seiu_adjustment_q_cd': cashDepositRecordID},
          // options: {
          //   enablesourcing: boolean,
        })
        // var InitialCashDeposit = record.load({
        //   type: "customtransaction_cd_101",
        //   id: cashDepositID,
        //   isDynamic: true,
        //   //defaultValues: Object
        // })
        // InitialCashDeposit.setValue({
        //   fieldId: "custbody_seiu_adjustment_q_cd",
        //   value: cashDepositRecordID,
        //   ignoreFieldChange: true
        // });
        // InitialCashDeposit.save({
        //   enableSourcing: true,
        //   ignoreMandatoryFields: true
        // })
      }*/
      //********************************* Update Initial Cash deposit adjustment id Update end *******************************************************************************

      log.debug("cashDepositRecordID", cashDepositRecordID);

      // ********************************* END : Cash Deposit Creation *******************************************************************************

      // ********************************* START : Vendor Bill Creation *******************************************************************************
      var currentDate = new Date();

      //Vendor Bill Header Fields
      var vendorBillInvoiceNumber = parseInt(
        Math.floor(100000 + Math.random() * 900000)
      ).toFixed();
      var vendorBillCustomForm = 162; //Hardcoded "--"
      var vendorBillPostingDate = format.parse({
        value: transFields.postingDate,
        type: format.Type.DATE,
      });
      var vendorBillDueDate = vendorBillPostingDate;
      var vendorBillMemo = transFields.Memo;
      var vendorBillAttachment = transFields.attachment;
      var vendorYear = transFields.year;
      var vendorBillDocumentDate = currentDate;
      var vendorBillRequestor = objUser.id;
      var vendorBillDepartment = 101; // Hardcoded "--"
      var vendorBillLocation = 103; // Hardcoded "--"

      //Vendor Bill Line Fields
      //var vendorBillLineAccount=357; // Hard Coded 480010 Other Income : Contributions
      var vendorBillLineAmount = transFields.AdjustmentAmount;

      var vendorBill = record.create({
        type: record.Type.VENDOR_BILL,
        isDynamic: true,
      });

      // log.debug("vendor bill create process start");

      // CUSTOM FORM  - Mandatory : "SEIU Vendor Bill (w/o line attachments)"
      vendorBill.setValue("customform", vendorBillCustomForm);

      // VENDOR  - Mandatory : 10290 SEIU COPE Fund
      vendorBill.setValue("entity", vendorBillVendor);

      vendorBill.setValue("subsidiary", subsidiary);

      // VENDOR INVOICE NO. - Mandatory
      vendorBill.setValue("tranid", vendorBillInvoiceNumber);

      log.debug("vendorBillPostingDate",format.parse({ value : vendorBillPostingDate, type : format.Type.DATE}));
      // POSTING DATE  - Mandatory
      vendorBill.setValue(
        "trandate",
        new Date(vendorBillPostingDate)
        // format.parse({ value: vendorBillPostingDate, type: format.Type.DATE })
      );

      // // DUE DATE
      vendorBill.setValue(
        "duedate",
        new Date(vendorBillDueDate)
        // format.parse({ value: vendorBillDueDate, type: format.Type.DATE })
      );

      log.debug("vendorBillMemo",vendorBillMemo);
      // MEMO- Mandatory
      vendorBill.setValue("memo", vendorBillMemo);

      // DOCUMENT ATTACHMENT - Mandatory
      vendorBill.setValue(
        "custbody_signed_contract_vendor",
        vendorBillAttachment
      );

      // DOCUMENT DATE - Mandatory
      vendorBill.setValue(
        "custbody_doc_date",
        format.parse({ value: vendorBillDocumentDate, type: format.Type.DATE })
      );

      // log.debug("vendorBillRequestor",vendorBillRequestor);
      // REQUESTOR - Mandatory
      // vendorBill.setValue('custbody_nsts_gaw_tran_requestor', vendorBillRequestor);

      // DEPARTMENT : "--"
      vendorBill.setValue("department", vendorBillDepartment);

      // STATE CODE : "--"
      vendorBill.setValue("location", vendorBillLocation);

      log.debug("year on vendor bill is ",vendorYear);
      vendorBill.setValue("custbodycope_year", vendorYear);

      vendorBill.setValue(
        "custbody_cope_transaction_type",
        vendorBillTransactionType
      );
  //*****************************************This is for set initial cash deposit id***********************************************************
      vendorBill.setValue({
        fieldId:"custbody_cope_initial_cash_deposit",
        value: cashDepositID,
        ignoreFieldChange: true
      })
      //******************************************This is for set adjustment non qualifying cash deposit id*******************************************************
      if(vendorBillVendor == 3152)
      {
      vendorBill.setValue({
        fieldId:"custbody_cope_adjustment_cash_deposit",
        value: cashDepositRecordID,
        ignoreFieldChange: true
      })
      }
      if(vendorBillVendor == 3140)
      {
      vendorBill.setValue({
        fieldId:"custbody_seiu_adjustment_q_cd",
        value: cashDepositRecordID,
        ignoreFieldChange: true
      })
      }
      //vendorBill.setValue('approvalstatus', 2);

      // Add Expense Lines
      var lineNum = vendorBill.selectNewLine({ sublistId: "expense" });

      vendorBill.setCurrentSublistValue({
        sublistId: "expense",
        fieldId: "account",
        value: line_account,
      });

      vendorBill.setCurrentSublistValue({
        sublistId: "expense",
        fieldId: "amount",
        value: vendorBillLineAmount,
      });

      vendorBill.setCurrentSublistValue({
        sublistId: "expense",
        fieldId: "department",
        value: line_department,
      });

      vendorBill.setCurrentSublistValue({
        sublistId: "expense",
        fieldId: "cseg3",
        value: line_projectCode,
      });

      vendorBill.setCurrentSublistValue({
        sublistId: "expense",
        fieldId: "cseg_local_code",
        value: localCode,
      });

      vendorBill.setCurrentSublistValue({
        sublistId: "expense",
        fieldId: "cseg1",
        value: vendorBillLineLM2Code,
      });

      vendorBill.setCurrentSublistValue({
        sublistId: "expense",
        fieldId: "location",
        value: 103,
      });

      if (vendorBillLineLM2Purpose)
        vendorBill.setCurrentSublistValue({
          sublistId: "expense",
          fieldId: "cseg2",
          value: vendorBillLineLM2Purpose,
        });

      vendorBill.commitLine({ sublistId: "expense" });

      var vendorBillRecordID = vendorBill.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });
      //******************************************** Set adjustment vendor bill on initial cash deposit*************************************************
      /*if(vendorBillVendor == 3152)
      {
        record.submitFields({
          type: 'customtransaction_cd_101',
          id: cashDepositID,
          values: {'custbody_cope_adjustment_vendor_bill': vendorBillRecordID},
          // options: {
          //   enablesourcing: boolean,
        })
      // var InitialCashDeposit = record.load({
      //   type: "customtransaction_cd_101",
      //   id: cashDepositID,
      //   isDynamic: true,
      //   //defaultValues: Object
      // })
      // InitialCashDeposit.setValue({
      //   fieldId: "custbody_cope_adjustment_vendor_bill",
      //   value: vendorBillRecordID,
      //   ignoreFieldChange: true
      // });
      // InitialCashDeposit.save({
      //   enableSourcing: true,
      //   ignoreMandatoryFields: true
      // })
    }
    if(vendorBillVendor == 3140)
      {
      // var InitialCashDeposit = record.load({
      //   type: "customtransaction_cd_101",
      //   id: cashDepositID,
      //   isDynamic: true,
      //   //defaultValues: Object
      // })
      // InitialCashDeposit.setValue({
      //   fieldId: "custbody_cope_adjustment_q_vendor_bill",
      //   value: vendorBillRecordID,
      //   ignoreFieldChange: true
      // });
      // InitialCashDeposit.save({
      //   enableSourcing: true,
      //   ignoreMandatoryFields: true
      // })
      record.submitFields({
        type: 'customtransaction_cd_101',
        id: cashDepositID,
        values: {'custbody_cope_adjustment_q_vendor_bill': vendorBillRecordID},
        // options: {
        //   enablesourcing: boolean,
      })
    }*/

//******************************************** Set adjustment vendor bill on adjustment cash cash deposit*****************************************
  log.debug("vendorBillRecordID", vendorBillRecordID);

      adjustmentTranList.push({
        vendorBill: vendorBillRecordID,
        cashDeposit: cashDepositRecordID,
        // vendorBillVendorId: vendorBillVendor,
        // cashDepositAccountId: accountCD
      });

      // ********************************* END : Vendor Bill Creation *******************************************************************************

      // ********************************* START : Create Custome record *******************************************************************************

      if (
        transFields.Record == "Qualifying" ||
        transFields.Record == "Non-Qualifying"
      ) {
        var adjustmentRecord = record.create({
          type: "customrecord_cope_adjustment_transaction",
          isDynamic: true,
        });

        adjustmentRecord.setValue(
          "custrecord_source_cash_deposit",
          cashDepositID
        );
        adjustmentRecord.setValue(
          "custrecord_cope_transmittal_transaction",
          transFields.TransmittalID
        );
        adjustmentRecord.setValue(
          "custrecord_trans_date",
          new Date(transFields.postingDate)
        );

        if (transFields.Record == "Qualifying") {
          adjustmentRecord.setValue(
            "custrecord_adjustment_amount",
            transFields.AdjustmentAmount ? transFields.AdjustmentAmount : 0
          );
          adjustmentRecord.setValue(
            "custrecord_adjustment_cash_deposit",
            cashDepositRecordID
          );
          adjustmentRecord.setValue(
            "custrecord_adjustment_qualifying_vb",
            vendorBillRecordID
          );
        } else if (transFields.Record == "Non-Qualifying") {
          adjustmentRecord.setValue(
            "custrecord_non_adj_qualifying_amount",
            transFields.AdjustmentAmount ? transFields.AdjustmentAmount : 0
          );
          adjustmentRecord.setValue(
            "custrecord_adjustment_non_qualifying_cd",
            cashDepositRecordID
          );
          adjustmentRecord.setValue(
            "custrecord_adjustment_non_qualifying_vb",
            vendorBillRecordID
          );
        }

        var adjustmentRecordID = adjustmentRecord.save({
          enableSourcing: true,
          ignoreMandatoryFields: true,
        });
        log.debug("adjustmentRecordID", adjustmentRecordID);
      }

      if (
        transFields.Record == "Hold-Qualifying" ||
        transFields.Record == "Hold-NonQualifying"
      ) {
        log.debug("transFields.Operation",transFields.Operation);
        if (transFields.Operation == "Create") {
          adjustmentRecord = record.create({
            type: "customrecord_cope_adjustment_transaction",
            isDynamic: true,
          });
          adjustmentRecord.setValue(
            "custrecord_source_cash_deposit",
            cashDepositID
          );
          adjustmentRecord.setValue(
            "custrecord_cope_transmittal_transaction",
            transFields.TransmittalID
          );
          adjustmentRecord.setValue(
            "custrecord_trans_date",
            new Date(transFields.postingDate)
          );

          if (transFields.Record == "Hold-Qualifying") {
            adjustmentRecord.setValue(
              "custrecord_adjustment_amount",
              transFields.AdjustmentAmount ? transFields.AdjustmentAmount : 0
            );
            adjustmentRecord.setValue(
              "custrecord_adjustment_cash_deposit",
              cashDepositRecordID
            );
            adjustmentRecord.setValue(
              "custrecord_adjustment_qualifying_vb",
              vendorBillRecordID
            );
          } else if (transFields.Record == "Hold-NonQualifying") {
            adjustmentRecord.setValue(
              "custrecord_non_adj_qualifying_amount",
              transFields.AdjustmentAmount ? transFields.AdjustmentAmount : 0
            );
            adjustmentRecord.setValue(
              "custrecord_adjustment_non_qualifying_cd",
              cashDepositRecordID
            );
            adjustmentRecord.setValue(
              "custrecord_adjustment_non_qualifying_vb",
              vendorBillRecordID
            );
          }

          var adjustmentRecordID = adjustmentRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true,
          });
          log.debug("adjustmentRecordID", adjustmentRecordID);
        } else if (transFields.Operation == "Update") {
          var copeAdjustmentInternalID;
          var customrecord_cope_adjustment_transactionSearchObj = search.create(
            {
              type: "customrecord_cope_adjustment_transaction",
              filters: [
                ["custrecord_source_cash_deposit", "anyof", cashDepositID],
                "AND",
                [
                  "custrecord_cope_transmittal_transaction",
                  "anyof",
                  transFields.TransmittalID,
                ],
              ],
              columns: [
                search.createColumn({
                  name: "internalid",
                  label: "Internal ID",
                }),
              ],
            }
          );
          var cashAdjustmentRecordCount =
            customrecord_cope_adjustment_transactionSearchObj.runPaged().count;
          log.debug(
            "customrecord_cope_adjustment_transactionSearchObj result count",
            cashAdjustmentRecordCount
          );
          customrecord_cope_adjustment_transactionSearchObj
            .run()
            .each(function (result) {
              // .run().each has a limit of 4,000 results

              copeAdjustmentInternalID = result.getValue({
                name: "internalid",
                label: "Internal ID",
              });

              return true;
            });

          if (copeAdjustmentInternalID) {
            adjustmentRecord = record.load({
              type: "customrecord_cope_adjustment_transaction",
              id: copeAdjustmentInternalID,
              isDynamic: true,
            });

            if (transFields.Record == "Hold-Qualifying") {
              adjustmentRecord.setValue(
                "custrecord_adjustment_amount",
                transFields.AdjustmentAmount ? transFields.AdjustmentAmount : 0
              );
              adjustmentRecord.setValue(
                "custrecord_adjustment_cash_deposit",
                cashDepositRecordID
              );
              adjustmentRecord.setValue(
                "custrecord_adjustment_qualifying_vb",
                vendorBillRecordID
              );
            } else if (transFields.Record == "Hold-NonQualifying") {
              adjustmentRecord.setValue(
                "custrecord_non_adj_qualifying_amount",
                transFields.AdjustmentAmount ? transFields.AdjustmentAmount : 0
              );
              adjustmentRecord.setValue(
                "custrecord_adjustment_non_qualifying_cd",
                cashDepositRecordID
              );
              adjustmentRecord.setValue(
                "custrecord_adjustment_non_qualifying_vb",
                vendorBillRecordID
              );
            }

            var adjustmentRecordID = adjustmentRecord.save({
              enableSourcing: true,
              ignoreMandatoryFields: true,
            });
            log.debug("adjustmentRecordID", adjustmentRecordID);
          }
        }
      }

      // ********************************* END : Create Custome record *******************************************************************************

      return adjustmentTranList;
    }
  }

  function getcustomerDetails(recordId) {
    var localList = record.load({
      type: "customrecord_localized",
      id: recordId,
    });

    var customerId = localList.getValue({
      fieldId: "custrecord_lz_customer",
    });

    var customerRecord = record.load({
      type: record.Type.CUSTOMER,
      id: customerId,
    });

    var localCode = customerRecord.getValue({
      fieldId: "cseg_local_code",
    });

    return {
      customerId: parseInt(customerId),
      customerCode: parseInt(localCode),
    };
  }

  function getAccount(recordId) {
    var recordFields = {
      glAccount: "custrecord_cope_gl_account",
      FndType: "custrecord_cope_fund_type",
      lineAccount: "custrecord_cope_line_account",
      department: "custrecord_cope_department",
      projectCode: "custrecord_cope_pro_code",
    };

    const accountRec = record.load({
      type: "customrecord_seiu_cope_gl_acc_managment",
      id: recordId,
    });

    var accountsFields = {
      glAccount: parseInt(
        accountRec.getValue({
          fieldId: recordFields.glAccount,
        })
      ),
      FndType: parseInt(
        accountRec.getValue({
          fieldId: recordFields.FndType,
        })
      ),
      lineAccount: parseInt(
        accountRec.getValue({
          fieldId: recordFields.lineAccount,
        })
      ),
      department: parseInt(
        accountRec.getValue({
          fieldId: recordFields.department,
        })
      ),
      projectCode: parseInt(
        accountRec.getValue({
          fieldId: recordFields.projectCode,
        })
      ),
      subsidiary: parseInt(
        accountRec.getValue({
          fieldId: "custrecord_cope_subsidiary",
        })
      ),
    };

    //   log.debug("account internal id is ", accountsFields);

    return accountsFields;
  }

  return {
    CreateAdjustmentTransactions: CreateAdjustmentTransactions,
  };
});
