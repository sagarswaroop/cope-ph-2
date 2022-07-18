/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["N/record", "N/search"], /**
 * @param {record} record
 * @param {search} search
 */ function (record, search) {
  var sublistTypes = ["item", "line", "expense"];
  /**
   * Function definition to be triggered before record is loaded.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {string} scriptContext.type - Trigger type
   * @param {Form} scriptContext.form - Current form
   * @Since 2015.2
   */
  function beforeLoad(scriptContext) {}

  /**
   * Function definition to be triggered before record is loaded.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type
   * @Since 2015.2
   */
  function beforeSubmit(scriptContext) {
    try {
      //var sublistID = 'item';
      var employeeField = "custcol_secondary_employee";
      var newRecord = scriptContext.newRecord;
      log.debug("beforeSubmit - newRecord", JSON.stringify(newRecord));
      log.debug("beforeSubmit - type", newRecord.type);
      /*
	    	if(newRecord.type == 'journalentry'){
	    		sublistID = 'line';
	    		employeeField = 'entity';
	    	}else if(newRecord.type == 'expensereport'){
	    		sublistID = 'expense';
	    	}
	    	*/
      for (var x = 0; x < sublistTypes.length; x++) {
        var sublistID = sublistTypes[x];
        log.debug(
          "beforeSubmit - sublistID, employeeField",
          sublistID + ", " + employeeField
        );
        var lineCount = newRecord.getLineCount(sublistID);
        log.debug("beforeSubmit - lineCount", lineCount);
        var speedKeys = [];
        for (var i = 0; i < lineCount; i++) {
          var speedKey = newRecord.getSublistValue({
            sublistId: sublistID,
            fieldId: "custcol_speed_key",
            line: i,
          });
          if (!isNullOrEmpty(speedKey) && speedKeys.indexOf(speedKey) < 0) {
            speedKeys.push(speedKey);
          }
        }
        if (!isNullOrEmpty(speedKeys) && speedKeys.length > 0) {
          log.debug("beforeSubmit - speedKeys", speedKeys);
          var speedKeyObject = getSpeedKeyValues(speedKeys);
          for (var i = 0; i < lineCount; i++) {
            var speedKey = newRecord.getSublistValue({
              sublistId: sublistID,
              fieldId: "custcol_speed_key",
              line: i,
            });
            if (speedKey in speedKeyObject) {
              log.debug(
                "setSpeedKeyValues - department",
                speedKeyObject[speedKey].department
              );
              newRecord.setSublistValue({
                sublistId: sublistID,
                fieldId: "department",
                line: i,
                value: speedKeyObject[speedKey].department,
              });

              log.debug(
                "setSpeedKeyValues - state",
                speedKeyObject[speedKey].state
              );
              newRecord.setSublistValue({
                sublistId: sublistID,
                fieldId: "location",
                line: i,
                value: speedKeyObject[speedKey].state,
              });

              log.debug(
                "setSpeedKeyValues - project",
                speedKeyObject[speedKey].project
              );
              newRecord.setSublistValue({
                sublistId: sublistID,
                fieldId: "cseg3",
                line: i,
                value: speedKeyObject[speedKey].project,
              });

              log.debug(
                "setSpeedKeyValues - region",
                speedKeyObject[speedKey].region
              );
              newRecord.setSublistValue({
                sublistId: sublistID,
                fieldId: "cseg4",
                line: i,
                value: speedKeyObject[speedKey].region,
              });

              log.debug(
                "setSpeedKeyValues - local",
                speedKeyObject[speedKey].local
              );
              newRecord.setSublistValue({
                sublistId: sublistID,
                fieldId: "cseg_local_code",
                line: i,
                value: speedKeyObject[speedKey].local,
              });

              log.debug(
                "setSpeedKeyValues - employee",
                speedKeyObject[speedKey].employee
              );
              newRecord.setSublistValue({
                sublistId: sublistID,
                fieldId: employeeField,
                line: i,
                value: speedKeyObject[speedKey].employee,
              });
            }
          }
        }
      }
    } catch (e) {
      var msg = "";

      if (e.hasOwnProperty("message")) {
        msg = e.name + ": " + e.message;
        log.debug("beforeSubmit - EXPECTED_ERROR", msg);
        log.debug("beforeSubmit - stack", e.stack);
      } else {
        msg = e.toString();
        log.debug("beforeSubmit - UNEXPECTED_ERROR", msg);
        log.debug("beforeSubmit - stack", e.stack);
      }
    }
  } //beforeSubmit

  /**
   * Function definition to be triggered before record is loaded.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type
   * @Since 2015.2
   */
  function afterSubmit(scriptContext) {
    if (scriptContext.type == "edit") {
      var accountsData = {
        qaulifyingAccount: getAccount(1),
        nonQaulifyingAccount: getAccount(2),
        holdAccount: getAccount(3),
      };

      var vbNewRecord = scriptContext.newRecord;
      var vbOldRecord = scriptContext.oldRecord;

      var vendorBillRecordID = vbNewRecord.id;
      var approvalStatus = vbNewRecord.getValue({ fieldId: "approvalstatus" });
      var vbStatus = vbNewRecord.getValue({ fieldId: "status" });

      log.debug("Approval status", approvalStatus);
      log.debug("Status", vbStatus);
      try {
        if (approvalStatus == 2 && vbStatus !== "Paid In Full") {
          // ********************************* START : Vendor Payment*******************************************************************************

          var memo = vbNewRecord.getValue({
            fieldId: "memo",
          });

          var isNonQalifying = memo.search("NQ");
          var isHold = memo.search("Hold");

          var objVendorPaymentRec = record.transform({
            fromType: record.Type.VENDOR_BILL,
            fromId: vendorBillRecordID,
            toType: record.Type.VENDOR_PAYMENT,
            isDynamic: true,
          });

          log.debug(
            "isNonQalifying is " +
              isNonQalifying +
              " isHold " +
              isHold +
              " objVendorPaymentRec " +
              objVendorPaymentRec
          );

          if (isHold != -1 && isHold>0) {
            log.debug("ishold condition call...");
            objVendorPaymentRec.setValue({
              fieldId: "account",
              value: accountsData.holdAccount.glAccount,
            });
          } else {
            log.debug(" is hold is false conditin call...");
            if (isNonQalifying != -1 && isNonQalifying>0) {
              log.debug("is non qualifying condition call...");
              objVendorPaymentRec.setValue({
                fieldId: "account",
                value: accountsData.nonQaulifyingAccount.glAccount,
                // ignoreFieldChange: boolean,
              });
            } else {
              log.debug("else of non qualifying mthod (qualifying) call...");
              objVendorPaymentRec.setValue({
                fieldId: "account",
                value: accountsData.qaulifyingAccount.glAccount,
                // ignoreFieldChange: boolean,
              });
            }
          }

          var vendorPaymentId = objVendorPaymentRec.save({
            enableSourcing: true,
            ignoreMandatoryFields: true,
          });

          log.debug("Vendor Payment" + vendorPaymentId);
          // ********************************* END : Vendor Payment *******************************************************************************
        }
      } catch (e) {
        log.debug("Exception: ", e);
      }
    }
  }

  // It return all data of custom form which is deafult for cash depsoit behalf on record id.
  function getAccount(recordId) {
    var recordFields = {
      glAccount: "custrecord_cope_gl_account",
      FndType: "custrecord_cope_fund_type",
      lineAccount: "custrecord_cope_line_account",
      department: "custrecord_cope_department",
      projectCode: "custrecord_cope_pro_code",
    };

    var accountRec = record.load({
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

  function getSpeedKeyValues(speedKeys) {
    var speedKeyObject = {};
    var filters = [];
    filters.push(["internalid", "anyof", speedKeys]);

    var speedKeySearch = search.create({
      type: "customrecord_speed_key",
      filters: filters,
      columns: [
        "name",
        "internalid",
        "custrecord_speed_desc",
        "custrecord_speed_dept",
        "custrecord_speed_project",
        "custrecord_speed_state",
        "custrecord_speed_region",
        "custrecord_speed_local",
        "custrecord_speed_eid",
      ],
    });

    var speedKeyResults = executeSearch(speedKeySearch);

    log.debug(
      "setSpeedKeyValues - speedKeyResults",
      JSON.stringify(speedKeyResults)
    );

    if (!isNullOrEmpty(speedKeyResults)) {
      for (var i = 0; i < speedKeyResults.length; i++) {
        var key = speedKeyResults[i].getValue("internalid");
        speedKeyObject[key] = {
          department: speedKeyResults[i].getValue("custrecord_speed_dept"),
          description: speedKeyResults[i].getValue("custrecord_speed_desc"),
          project: speedKeyResults[i].getValue("custrecord_speed_project"),
          state: speedKeyResults[i].getValue("custrecord_speed_state"),
          region: speedKeyResults[i].getValue("custrecord_speed_region"),
          local: speedKeyResults[i].getValue("custrecord_speed_local"),
          employee: speedKeyResults[i].getValue("custrecord_speed_eid"),
          employeeName: speedKeyResults[i].getText("custrecord_speed_eid"),
        };
      }
    }
    log.debug(
      "setSpeedKeyValues - speedKeyObject",
      JSON.stringify(speedKeyObject)
    );
    return speedKeyObject;
  } //setSpeedKeyValues

  function setSpeedKeyValues(sublistId, fieldId, lineNum, currentRecord) {
    try {
      var recordType = currentRecord.type;
      log.debug(
        "setSpeedKeyValues - currentRecord",
        JSON.stringify(currentRecord)
      );

      log.debug(
        "setSpeedKeyValues - sublistId, fieldId, lineNum, recordType",
        sublistId + ", " + fieldId + ", " + lineNum + ", " + recordType
      );

      //currentRecord.selectLine({sublistId: sublistId, line: lineNum});
      var speedKey = currentRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: fieldId,
      });
      log.debug("setSpeedKeyValues - speedKey", JSON.stringify(speedKey));

      var filters = [];
      filters.push(["internalid", "anyof", speedKey]);

      var speedKeySearch = search.create({
        type: "customrecord_speed_key",
        filters: filters,
        columns: [
          "name",
          "internalid",
          "custrecord_speed_desc",
          "custrecord_speed_dept",
          "custrecord_speed_project",
          "custrecord_speed_state",
          "custrecord_speed_region",
          "custrecord_speed_local",
          "custrecord_speed_eid",
        ],
      });

      var speedKeyResults = executeSearch(speedKeySearch);

      log.debug(
        "setSpeedKeyValues - speedKeyResults",
        JSON.stringify(speedKeyResults)
      );

      if (!isNullOrEmpty(speedKeyResults)) {
        var department = speedKeyResults[0].getValue("custrecord_speed_dept");
        var description = speedKeyResults[0].getValue("custrecord_speed_desc");
        var project = speedKeyResults[0].getValue("custrecord_speed_project");
        var state = speedKeyResults[0].getValue("custrecord_speed_state");
        var region = speedKeyResults[0].getValue("custrecord_speed_region");
        var local = speedKeyResults[0].getValue("custrecord_speed_local");
        var employee = speedKeyResults[0].getValue("custrecord_speed_eid");
        var employeeName = speedKeyResults[0].getText("custrecord_speed_eid");

        //Per Kendell, we do not need to set the description/memo
        //console.log('setSpeedKeyValues - description:  ' + description);
        //currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'description',       	value: description, forceSyncSourcing: true});
        //currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'memo',       			value: description, forceSyncSourcing: true});

        //console.log('setSpeedKeyValues - department:  ' + department);
        currentRecord.setCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "department",
          value: department,
          forceSyncSourcing: true,
        });

        //console.log('setSpeedKeyValues - state:  ' + state);
        currentRecord.setCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "location",
          value: state,
          forceSyncSourcing: true,
        });

        //console.log('setSpeedKeyValues - project:  ' + project);
        currentRecord.setCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "cseg3",
          value: project,
          forceSyncSourcing: true,
        });

        //console.log('setSpeedKeyValues - region:  ' + region);
        currentRecord.setCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "cseg4",
          value: region,
          forceSyncSourcing: true,
        });

        //console.log('setSpeedKeyValues - local:  ' + local);
        currentRecord.setCurrentSublistValue({
          sublistId: sublistId,
          fieldId: "cseg_local_code",
          value: local,
          forceSyncSourcing: true,
        });

        if (recordType == "journalentry") {
          //console.log('setSpeedKeyValues - employee (je):  ' + employee);
          currentRecord.setCurrentSublistValue({
            sublistId: sublistId,
            fieldId: "entity",
            value: employee,
            forceSyncSourcing: true,
          });
        } else {
          //console.log('setSpeedKeyValues - employee (other):  ' + employee);
          currentRecord.setCurrentSublistValue({
            sublistId: sublistId,
            fieldId: "custcol_secondary_employee",
            value: employee,
            forceSyncSourcing: true,
          });
        }
      }
    } catch (e) {
      var msg = "";

      if (e.hasOwnProperty("message")) {
        msg = e.name + ": " + e.message;
        log.error("setSpeedKeyValues - EXPECTED_ERROR", msg);
        log.error("setSpeedKeyValues - stack", e.stack);
      } else {
        msg = e.toString();
        log.error("setSpeedKeyValues - UNEXPECTED_ERROR", msg);
        log.error("setSpeedKeyValues - stack", e.stack);
      }
    }
  } //setSpeedKeyValues

  /*
   * helper function to get the search results
   */
  function executeSearch(srch) {
    var results = [];

    var pagedData = srch.runPaged({
      pageSize: 1000,
    });
    pagedData.pageRanges.forEach(function (pageRange) {
      var page = pagedData.fetch({
        index: pageRange.index,
      });
      page.data.forEach(function (result) {
        results.push(result);
      });
    });

    return results;
  } //executeSearch

  /*
   * Validating if value is null or empty
   */
  function isNullOrEmpty(val) {
    if (
      val == null ||
      val == "" ||
      val == "" ||
      val == "undefined" ||
      val == [] ||
      val == {}
    ) {
      return true;
    } else {
      return false;
    }
  } //isNullOrEmpty

  return {
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit,
  };
});
