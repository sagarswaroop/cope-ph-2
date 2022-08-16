/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 *
 * Note:
 *   This script will create transaction for every line item in the Cash Deposit custom transaction record.
 * 
 * Changes:
 *   Date        Author            Remarks
 *   2020-02-20  Waldo Lacanlale   Initial version of the script.
 *   
 */

 define(['N/record', 'N/search', 'N/url', 'N/cache', 'N/runtime', 'N/format'], function(record, search, url, cache, runtime, format) {
	function onAction(context){
		log.debug('onAction', 'Start');
		
		log.debug('onAction','context.type='+context.type);
		if(context.type === 'button'){
			try {
				
				var objCashDepositType = {
					1: { type: 'Invoice Application', recordType: record.Type.CUSTOMER_PAYMENT, isDynamic: true  }, //// NOTE: Dynamic! Reason: Need to apply a checkmark on the applied invoice which is sourced only in dynamic mode
					2: { type: 'Revenue'            , recordType: record.Type.CASH_SALE       , isDynamic: false },
					3: { type: 'Return'             , recordType: record.Type.DEPOSIT         , isDynamic: false }
				};
				
				var objScript = runtime.getCurrentScript();
				var stCashsaleSubsTaxcodeInfo = objScript.getParameter({name: 'custscript_ea_wa_cashsale_ln_substaxcode'});
				var objCashsaleSubsTaxcodeInfo = stCashsaleSubsTaxcodeInfo.split(',').map(function(val){
					return val.split('|');
				})
				.reduce(function(acc,val){
					acc[val[0]]=val[1];
					return acc;
				},{});
				log.debug('onAction objCashsaleSubsTaxcodeInfo',objCashsaleSubsTaxcodeInfo);
				
				var inLineCount = context.newRecord.getLineCount({sublistId:'line'});
				log.debug('onAction','inLineCount='+inLineCount);
				
				var objData = {
					body: {
						'id'               : context.newRecord.id,
						'custbody_bk_acct' : context.newRecord.getValue({ fieldId: 'custbody_bk_acct' }),
						'subsidiary'       : context.newRecord.getValue({ fieldId: 'subsidiary'       }),
						'trandate'         : context.newRecord.getValue({ fieldId: 'trandate'         }),
						'custbody_batch_id': context.newRecord.getValue({ fieldId: 'custbody_batch_id'})
					},
					line:[]
				};
				for(var i=0; i<inLineCount; i++){
					
					if( context.newRecord.getSublistValue({sublistId:'line', fieldId: 'custcol_transaction_link', line: i }) ){
						objData.line.push(null);
						continue;
					}
					
					objData.line.push({
						'entity'                   : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'entity'          }),
						'entity_text'              :  context.newRecord.getSublistText({ sublistId: 'line', line: i, fieldId: 'entity'          }),
						'account'                  : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'account'         }),
						'custcol_cr_acct'          : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_cr_acct' }),
						'amount'                   : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'amount'          }),
						'department'               : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'department'      }),
						'memo'                     : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'memo'            }),
						
						'custcol_cdt'              : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_cdt'     }),
						'cseg1'                    : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'cseg1'           }),
						'cseg2'                    : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'cseg2'           }),
						'cseg3'                    : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'cseg3'           }),
						'cseg4'                    : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'cseg4'           }),
						'cseg_local_code'          : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'cseg_local_code' }),
						'location'                 : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'location'        }),
						
						'custcol_inv_application'  : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_inv_application'  }),
						'custcol_inv_application_wo_date'  : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_inv_application_wo_date'  }),
						'custcol_pymt_date'        : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_pymt_date'        }),
						'custcol_cd_pay_meth'      : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_cd_pay_meth'      }),
						'custcol_cd_check_ach_num' : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_cd_check_ach_num' }),
						'custcol_cd_posting_group' : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_cd_posting_group' }),
						'custcol_line_item'        : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_line_item'        }),
						'custcol_document_date'    : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_document_date'    }),
						'custcolallinvoice'        : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcolallinvoice'        }),
						'custcol_tranmital_year'   : context.newRecord.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_tranmital_year'}), //incase of cope transmittal
						'sourceRecord' : context.newRecord.id
						
					});
				}
				log.debug('onAction objData',objData);
				
				for(var i=0; i<inLineCount; i++){
					
					context.newRecord.selectLine({sublistId: 'line', line: i});
					
					if( !objData.line[i] ){
						log.debug('onAction','skip line i='+i);
						continue;
					}
					
					try{
						var objNewTransRec = record.create({type: objCashDepositType[ objData.line[i]['custcol_cdt'] ]['recordType'] , isDynamic: objCashDepositType[ objData.line[i]['custcol_cdt'] ]['isDynamic'] });
						
						if( objData.body['custbody_batch_id'] ) objNewTransRec.setValue({fieldId: 'custbody_batch_id', value: objData.body['custbody_batch_id'] });
						
						switch( objCashDepositType[ objData.line[i]['custcol_cdt'] ]['type'] ){
							///////////////////////////
							case 'Invoice Application':
								
								if( objData.line[i]['entity' ] ) objNewTransRec.setValue({fieldId: 'customer', value: objData.line[i]['entity' ] });
								if( objData.body['subsidiary'      ] ) objNewTransRec.setValue({fieldId: 'subsidiary', value: objData.body['subsidiary'      ] });	
								if( objData.line[i]['custcol_cr_acct'] ) objNewTransRec.setValue({fieldId: 'aracct',   value: objData.line[i]['custcol_cr_acct'] });
								if( objData.body['custbody_bk_acct'] ) objNewTransRec.setValue({fieldId: 'account',    value: objData.body['custbody_bk_acct'] });
								
								if( objData.body['trandate'        ] ) objNewTransRec.setValue({fieldId: 'trandate',   value: objData.body['trandate'        ] });
								
								if( objData.line[i]['department'     ] ) objNewTransRec.setValue({fieldId: 'department',      value: objData.line[i]['department'     ] });
								if( objData.line[i]['location'       ] ) objNewTransRec.setValue({fieldId: 'location',        value: objData.line[i]['location'       ] });
								if( objData.line[i]['amount'         ] ) objNewTransRec.setValue({fieldId: 'payment',         value: objData.line[i]['amount'         ] });
								if( objData.line[i]['cseg3'          ] ) objNewTransRec.setValue({fieldId: 'cseg3',           value: objData.line[i]['cseg3'          ] });
								if( objData.line[i]['cseg1'          ] ) objNewTransRec.setValue({fieldId: 'cseg1',           value: objData.line[i]['cseg1'          ] });
								if( objData.line[i]['cseg2'          ] ) objNewTransRec.setValue({fieldId: 'cseg2',           value: objData.line[i]['cseg2'          ] });
								
								if( objData.line[i]['cseg4'          ] ) objNewTransRec.setValue({fieldId: 'cseg4',           value: objData.line[i]['cseg4'          ] });
								if( objData.line[i]['cseg_local_code'] ) objNewTransRec.setValue({fieldId: 'cseg_local_code', value: objData.line[i]['cseg_local_code'] });
								
								//if( objData.line[i]['custcol_pymt_date'        ] ) objNewTransRec.setValue({fieldId: 'custbody_pymt_date',      value: format.format({value: objData.line[i]['custcol_pymt_date'], type: format.Type.DATE}) });
								setDateFieldValue(objData.line[i]['custcol_pymt_date'], 'custbody_pymt_date', objNewTransRec);
								if( objData.line[i]['custcol_cd_pay_meth'      ] ) objNewTransRec.setValue({fieldId: 'custbody_cust_pay_mthod', value: objData.line[i]['custcol_cd_pay_meth'      ] });
								if( objData.line[i]['custcol_cd_check_ach_num' ] ) objNewTransRec.setValue({fieldId: 'checknum',                value: objData.line[i]['custcol_cd_check_ach_num' ] });
								if( objData.line[i]['memo'                     ] ) objNewTransRec.setValue({fieldId: 'memo',                    value: objData.line[i]['memo'                     ] });
								if( objData.line[i]['custcol_cd_posting_group' ] ) objNewTransRec.setValue({fieldId: 'custbody23',              value: objData.line[i]['custcol_cd_posting_group' ] });
								//if( objData.line[i]['custcol_document_date'    ] ) objNewTransRec.setValue({fieldId: 'custbody_doc_date',       value: format.format({value: objData.line[i]['custcol_document_date'], type: format.Type.DATE}) });
								setDateFieldValue(objData.line[i]['custcol_document_date'], 'custbody_doc_date', objNewTransRec);
								
								if( objData.line[i]['custcol_inv_application'] ){
									var objTranId = search.lookupFields({
										type: search.Type.TRANSACTION,
										id: objData.line[i]['custcol_inv_application'],
										columns: ['tranid']
									});
									log.debug('onAction objTranId', objTranId);
									
									//// This will be pre-populated only in dynamic mode
									var inApplyCount = objNewTransRec.getLineCount({sublistId: 'apply'});
									
									log.debug('onAction','inApplyCount='+inApplyCount);
									for(var applyIdx=0; applyIdx<inApplyCount; applyIdx++){
										if(objTranId.tranid === objNewTransRec.getSublistValue({sublistId: 'apply', fieldId: 'refnum', line: applyIdx}) ){
											objNewTransRec.selectLine({sublistId: 'apply', line: applyIdx });
											objNewTransRec.setCurrentSublistValue({sublistId: 'apply', fieldId: 'apply', value: true});
										}
									}
								}

								if( objData.line[i]['custcol_inv_application_wo_date'] ){
									var objTranId = search.lookupFields({
										type: search.Type.TRANSACTION,
										id: objData.line[i]['custcol_inv_application_wo_date'],
										columns: ['tranid']
									});
									log.debug('onAction objTranId', objTranId);
									
									//// This will be pre-populated only in dynamic mode
									var inApplyCount = objNewTransRec.getLineCount({sublistId: 'apply'});
									
									log.debug('onAction','inApplyCount='+inApplyCount);
									for(var applyIdx=0; applyIdx<inApplyCount; applyIdx++){
										if(objTranId.tranid === objNewTransRec.getSublistValue({sublistId: 'apply', fieldId: 'refnum', line: applyIdx}) ){
											objNewTransRec.selectLine({sublistId: 'apply', line: applyIdx });
											objNewTransRec.setCurrentSublistValue({sublistId: 'apply', fieldId: 'apply', value: true});
										}
									}
								}
								
								if( objData.body['custbody_bk_acct'] ) {
									objNewTransRec.setValue({fieldId: 'undepfunds', value: 'F' });
									while(!objNewTransRec.getValue({ fieldId: 'account' })){ //// because the record was opened in dynamic mode
										log.debug('onAction account try', objNewTransRec.getValue({ fieldId: 'account' }));
										objNewTransRec.setValue({fieldId: 'account', value: objData.body['custbody_bk_acct'] });
									}
									log.debug('onAction account finally', objNewTransRec.getValue({ fieldId: 'account' }));
								}
								
								break;
							///////////////////////////
							case 'Revenue':
								if(objCashDepositType[ objData.line[i]['custcol_cdt'] ]['isDynamic']){
									log.debug('onAction', 'Dynamic mode');
								} else {
									log.debug('onAction', 'Static mode');
									
									if( objData.line[i]['entity'] ) objNewTransRec.setValue({fieldId: 'entity', value: objData.line[i]['entity'] });
									
									if( objData.body['subsidiary'] ) objNewTransRec.setValue({fieldId: 'subsidiary', value: objData.body['subsidiary'] });
									
									//if( objData.line[i]['custcol_pymt_date'] ) objNewTransRec.setValue({fieldId: 'custbody_pymt_date', value: objData.line[i]['custcol_pymt_date'] });
									setDateFieldValue(objData.line[i]['custcol_pymt_date'], 'custbody_pymt_date', objNewTransRec);
									
									if( objData.line[i]['custcol_cd_pay_meth'] ) objNewTransRec.setValue({fieldId: 'custbody_cust_pay_mthod', value: objData.line[i]['custcol_cd_pay_meth'] });
									
									if( objData.line[i]['custcol_cd_check_ach_num'] ) objNewTransRec.setValue({fieldId: 'otherrefnum', value: objData.line[i]['custcol_cd_check_ach_num'] });
									
									if( objData.line[i]['custcol_cd_posting_group'] ) objNewTransRec.setValue({fieldId: 'custbody23', value: objData.line[i]['custcol_cd_posting_group'] });
									if( objData.line[i]['custcol_tranmital_year'] ) objNewTransRec.setValue({fieldId: 'custbodycope_year', value: objData.line[i]['custcol_tranmital_year'] });
									if( objData.line[i]['sourceRecord'] ) objNewTransRec.setValue({fieldId: 'custbody_je_source_record', value: objData.line[i]['sourceRecord'] });
									
									//if( objData.line[i]['custcol_document_date'] ) objNewTransRec.setValue({fieldId: 'custbody_doc_date', value: objData.line[i]['custcol_document_date'] });
									setDateFieldValue(objData.line[i]['custcol_document_date'], 'custbody_doc_date', objNewTransRec);
									
									if( objData.body['trandate'] ) objNewTransRec.setValue({fieldId: 'trandate', value: objData.body['trandate'] });
									
									if( objData.body['custbody_bk_acct'] ) {
										objNewTransRec.setValue({fieldId: 'undepfunds', value: 'F' });
										objNewTransRec.setValue({fieldId: 'account',    value: parseInt(objData.body['custbody_bk_acct']) });
									}
									
									// Hardcode to ---
									objNewTransRec.setValue({fieldId: 'department',      value: 101 });
									objNewTransRec.setValue({fieldId: 'cseg3',           value: 602 });
									objNewTransRec.setValue({fieldId: 'location',        value: 103 });
									objNewTransRec.setValue({fieldId: 'cseg4',           value: 101 });
									objNewTransRec.setValue({fieldId: 'cseg1',           value: 102 });
									objNewTransRec.setValue({fieldId: 'cseg2',           value: 203 });
									objNewTransRec.setValue({fieldId: 'cseg_local_code', value: 301 });
									
									if( objData.line[i]['custcol_line_item'] ){
										log.debug('onAction', 'item exist');
										objNewTransRec.insertLine({sublistId: 'item', line: 0 });
										
										objNewTransRec.setSublistValue({sublistId: 'item', fieldId: 'item',     line: 0, value: objData.line[i]['custcol_line_item'] });
										
										objNewTransRec.setSublistValue({sublistId: 'item', fieldId: 'quantity', line: 0, value: 1});
										
										if( objData.line[i]['amount'] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'amount',      value: objData.line[i]['amount'] });
										if( objData.line[i]['memo'  ] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'description', value: objData.line[i]['memo'] });
										
										if( objData.line[i]['department'     ] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'department',      value: objData.line[i]['department'] });
										if( objData.line[i]['cseg3'          ] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'cseg3',           value: objData.line[i]['cseg3'] });
										if( objData.line[i]['location'       ] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'location',        value: objData.line[i]['location'] });
										if( objData.line[i]['cseg4'          ] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'cseg4',           value: objData.line[i]['cseg4'] });
										if( objData.line[i]['cseg1'          ] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'cseg1',           value: objData.line[i]['cseg1'] });
										if( objData.line[i]['cseg2'          ] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'cseg2',           value: objData.line[i]['cseg2'] });
										if( objData.line[i]['cseg_local_code'] ) objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'cseg_local_code', value: objData.line[i]['cseg_local_code'] });
										
										if( objData.body['subsidiary'] &&  objCashsaleSubsTaxcodeInfo[objData.body['subsidiary']] ){
											objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'taxcode', value: objCashsaleSubsTaxcodeInfo[objData.body['subsidiary']] });
										}
										
										objNewTransRec.setSublistValue({ sublistId: 'item', line: 0, fieldId: 'custcol_lla', value: 3400 });
										
									}
								} //// if else create record in dynamic mode
								break;
							///////////////////////////
							case 'Return':
								
								if( objData.line[i]['amount'] && objData.line[i]['custcol_cr_acct'] && objData.line[i]['department'] && objData.line[i]['location'] ) {
									objNewTransRec.insertLine({sublistId: 'other', line: 0});
									
									if( objData.line[i]['entity'] ) objNewTransRec.setSublistValue({ sublistId: 'other', line: 0, fieldId: 'entity',  value: objData.line[i]['entity'] });
									objNewTransRec.setSublistValue({ sublistId: 'other', line: 0, fieldId: 'amount',     value:      objData.line[i]['amount'] });
									objNewTransRec.setSublistValue({ sublistId: 'other', line: 0, fieldId: 'account',    value:      objData.line[i]['custcol_cr_acct'] });
									objNewTransRec.setSublistValue({ sublistId: 'other', line: 0, fieldId: 'department', value:      objData.line[i]['department'] });
									objNewTransRec.setSublistValue({ sublistId: 'other', line: 0, fieldId: 'location',   value:      objData.line[i]['location'] });
									
									if( objData.line[i]['custcol_cd_check_ach_num'] ) objNewTransRec.setSublistValue({ sublistId: 'other', line: 0, fieldId: 'refnum', value: objData.line[i]['custcol_cd_check_ach_num'] });
								}
								
								objNewTransRec.setValue({ fieldId: 'account', value: objData.body['custbody_bk_acct'] });
								
								//if( objData.line[i]['custcol_pymt_date']   ) objNewTransRec.setValue({fieldId: 'custbody_pymt_date',      value: objData.line[i]['custcol_pymt_date'] });
								setDateFieldValue(objData.line[i]['custcol_pymt_date'], 'custbody_pymt_date', objNewTransRec);

								if( objData.line[i]['custcol_cd_pay_meth'] ) objNewTransRec.setValue({fieldId: 'custbody_cust_pay_mthod', value: objData.line[i]['custcol_cd_pay_meth'] });
								
								if( objData.line[i]['memo'] ) objNewTransRec.setValue({fieldId: 'memo', value: objData.line[i]['memo'] });
								
								if( objData.line[i]['custcol_cd_posting_group' ] ) objNewTransRec.setValue({fieldId: 'custbody23', value: objData.line[i]['custcol_cd_posting_group' ] });
								
								//if( objData.line[i]['custcol_document_date'] ) objNewTransRec.setValue({fieldId: 'custbody_doc_date', value: objData.line[i]['custcol_document_date'] });
								setDateFieldValue(objData.line[i]['custcol_document_date'], 'custbody_doc_date', objNewTransRec);

								if( objData.line[i]['department'     ] ) objNewTransRec.setValue({fieldId: 'department',      value: objData.line[i]['department'     ] });
								if( objData.line[i]['location'       ] ) objNewTransRec.setValue({fieldId: 'location',        value: objData.line[i]['location'       ] });
								if( objData.line[i]['cseg1'          ] ) objNewTransRec.setValue({fieldId: 'cseg1',           value: objData.line[i]['cseg1'          ] });
								if( objData.line[i]['cseg2'          ] ) objNewTransRec.setValue({fieldId: 'cseg2',           value: objData.line[i]['cseg2'          ] });
								if( objData.line[i]['cseg3'          ] ) objNewTransRec.setValue({fieldId: 'cseg3',           value: objData.line[i]['cseg3'          ] });
								if( objData.line[i]['cseg4'          ] ) objNewTransRec.setValue({fieldId: 'cseg4',           value: objData.line[i]['cseg4'          ] });
								if( objData.line[i]['cseg_local_code'] ) objNewTransRec.setValue({fieldId: 'cseg_local_code', value: objData.line[i]['cseg_local_code'] });
								
								if( objData.body['trandate'] ) objNewTransRec.setValue({fieldId: 'trandate', value: objData.body['trandate'] });
								
								break;
							///////////////////////////
							default:
								log.debug('onAction','switch-default');
						}; //// switch
						
						var inNewTransId = objNewTransRec.save({
							enableSourcing: false,
							ignoreMandatoryFields: true
						});
						
						if(inNewTransId){
							
							log.debug('onAction','inNewTransId='+inNewTransId);
							
							if( objData.line[i]['custcolallinvoice'] ){
								record.submitFields({
									type: record.Type.INVOICE,
									id: objData.line[i]['custcolallinvoice'],
									values: {
										custbody_rebate_payment: inNewTransId
									},
									options: {
										enableSourcing: false,
										ignoreMandatoryFields : true
									}
								});
							}
							
							context.newRecord.setCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'custcol_transaction_link',
								value: inNewTransId
							});
							
							context.newRecord.setCurrentSublistValue({
								sublistId:'line',
								fieldId: 'custcol_error',
								value: ""
							});
							context.newRecord.commitLine({sublistId:'line'});
						}
					} catch (innerError) {
						log.debug('onAction-innerError', innerError);
						context.newRecord.setCurrentSublistValue({
							sublistId:'line',
							fieldId: 'custcol_error',
							value: innerError.message
						});
						context.newRecord.commitLine({sublistId:'line'});
					}
				} //// for loop
			} catch(error){
				log.debug('onAction-error', error);
			}
		}
		log.debug('onAction', 'End');
	}
	function setDateFieldValue(inputDate, fieldId, recordObj){
		log.debug('setDateFieldValue-fieldId', fieldId);
		log.debug('setDateFieldValue-inputDate', inputDate);
		if(!(inputDate && fieldId && recordObj)){
			log.debug('setDateFieldValue', '!(inputDate && fieldId && recordObj)');
			return;
		}
		log.debug('setDateFieldValue-typeof-inputDate', typeof inputDate);
		log.debug('setDateFieldValue-typeof-inputDate-isobject', typeof inputDate === 'object');
		log.debug('setDateFieldValue-typeof-inputDate.getMonth-isfunction', typeof inputDate.getMonth === 'function');
		log.debug('setDateFieldValue-instanceof-Date', inputDate instanceof Date);

		var valueToSet = typeof inputDate === 'string' ? format.parse({value: inputDate, type: format.Type.DATE}) : inputDate ;

		log.debug('setDateFieldValue-valueToSet', valueToSet);
		log.debug('setDateFieldValue-valueToSet-typeof', typeof valueToSet);
		recordObj.setValue({fieldId: fieldId, value: valueToSet });
	}
	return {
		onAction: onAction
	}
});