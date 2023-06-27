var ss= SpreadsheetApp.getActiveSpreadsheet();
var mainSheet = ss.getSheetByName("Main");
var hisSheet = ss.getSheetByName("History");
var curProd = "";
const name_col =2;
const ini_col = 4;
const add_col = 5;
const rea_col = 6;
const reason_col = 7;
const cur_col = 3;
const date_col = 1;
const prod_col = 2;
const trans_col = 3;
const qty_col = 4;
const rem_col = 5;


function addCheck() {
  SpreadsheetApp.getUi().alert("⚠️ Invalid Data", "Please enter a number greater than 0.", SpreadsheetApp.getUi().ButtonSet.OK);
  
}

function reasonCheck() {
  SpreadsheetApp.getUi().alert("⚠️ Mandatory Field", "Please enter a valid reason.", SpreadsheetApp.getUi().ButtonSet.OK);
  
}

function remCheck() {
  SpreadsheetApp.getUi().alert("⚠️ Invalid Data", "Stock being removed is more than Current stock,\n please check the product being updated.", SpreadsheetApp.getUi().ButtonSet.OK);
 
}

function successAlert() {
  SpreadsheetApp.getUi().alert("👍 Success!", "Stock Updated.", SpreadsheetApp.getUi().ButtonSet.OK);
  
}

function removeAlert() {
  SpreadsheetApp.getUi().alert("⚠️ Warning!", "Stock Removed.", SpreadsheetApp.getUi().ButtonSet.OK);
  
}

function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Success')
      .setWidth(300)
      .setHeight(100);
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, 'Success!');
}
function getList() { 
  // var ss= SpreadsheetApp.getActiveSpreadsheet();
  // var mainSheet = ss.getSheetByName("Main"); 
  return mainSheet.getRange(2,1,mainSheet.getLastRow()-1,2).getValues(); 
}

function AddRecord(prod,qty) {
  
  // var ss= SpreadsheetApp.getActiveSpreadsheet();
  // var mainSheet = ss.getSheetByName("Main");
  // prod=1;
  // qty=10;
  var name = mainSheet.getRange(Number(prod)+1,name_col).getValue();
  var prevQty = mainSheet.getRange(Number(prod)+1,add_col).getValue();
  var previni = mainSheet.getRange(Number(prod)+1,ini_col).getValue();
  mainSheet.getRange(Number(prod)+1,add_col).setValue(Number(qty)+Number(prevQty));
  var addQty = mainSheet.getRange(Number(prod)+1,add_col).getValue();
  var remQty = mainSheet.getRange(Number(prod)+1,rea_col).getValue();
  var curQty = Number(previni) + Number(addQty)-Number(remQty);
  mainSheet.getRange(Number(prod)+1,cur_col).setValue(curQty);
  var n=Number(hisSheet.getLastRow())+1;
  var date = new Date();
  date = Utilities.formatDate(date, 'Asia/Calcutta', 'MM/dd/yyyy HH:mm:ss');
  Logger.log(date);
  hisSheet.getRange(n,date_col).setValue(date.toString());
  hisSheet.getRange(n,prod_col).setValue(name);
  hisSheet.getRange(n,trans_col).setValue("Added");
  hisSheet.getRange(n,qty_col).setValue(qty);
  hisSheet.getRange(n,rem_col).setValue("New stock added");
}

function RemRecord(prod,qty,reason) {
  
  prod=10;
  var name = mainSheet.getRange(Number(prod)+1,name_col).getValue();
  var prevQty = mainSheet.getRange(Number(prod)+1,rea_col).getValue();
  var curQty = mainSheet.getRange(Number(prod)+1,cur_col).getValue();
 
    var previni = mainSheet.getRange(Number(prod)+1,ini_col).getValue();
  var addQty = mainSheet.getRange(Number(prod)+1,add_col).getValue();
  var curQty = Number(previni) + Number(addQty)-(Number(qty)+Number(prevQty));
   if(Number(curQty)>0){
    mainSheet.getRange(Number(prod)+1,rea_col).setValue(Number(qty)+Number(prevQty));
  mainSheet.getRange(Number(prod)+1,reason_col).setValue(reason);
  mainSheet.getRange(Number(prod)+1,cur_col).setValue(curQty);
  var n=Number(hisSheet.getLastRow())+1;
  var date = new Date();
  date = Utilities.formatDate(date, 'Asia/Calcutta', 'MM/dd/yyyy HH:mm:ss');
  Logger.log(date);
  hisSheet.getRange(n,date_col).setValue(date.toString());
  hisSheet.getRange(n,prod_col).setValue(name);
  hisSheet.getRange(n,trans_col).setValue("Removed");
  hisSheet.getRange(n,qty_col).setValue(qty);
  hisSheet.getRange(n,rem_col).setValue(reason);
  Logger.log(true);
  return true;
  }else{
    remCheck();
    Logger.log(true);
    return false;
  }
  
} 


function SearchRecord(prod){
var name = mainSheet.getRange(Number(prod)+1,name_col).getValue();
var iniStock = mainSheet.getRange(Number(prod)+1,ini_col).getValue();
var curStock = mainSheet.getRange(Number(prod)+1,cur_col).getValue();
return [iniStock,curStock,name];  
}

function getData(condn,qty){
  // var spreadSheetId = "1tMODRuz4T5MYVOGtdLV5j5EqX1MKoz4F_RySpr0YLdE"; //CHANGE
  // var dataRange     = "Data!A2:F"; //CHANGE
 
  // var range   = Sheets.Spreadsheets.Values.get(spreadSheetId,dataRange);
  // var values  = range.values;
  var  range = mainSheet.getRange(2,1,mainSheet.getLastRow()-1,7).getValues().sort();
  var chek=0;
  condn=condn.toString();

  var filterlogic = function filterCols(item){
  if((Number(item[cur_col-1])<Number(qty)) && condn=="less" ){// 
  chek=1;
 return true;
  }
  if((item[cur_col-1]>Number(qty)) && condn=="more" ){// 
  chek=2;
 return true;
  }
  if((item[cur_col-1]==Number(qty)) && condn=="equal"){// 
  chek=3;
 return true;
  }
}
var  filterRange = range.filter(filterlogic);
Logger.log(chek);
Logger.log(filterRange);
  return filterRange;
}

function getdetails(prod){
  // prod=7;
var  range = hisSheet.getRange(2,1,hisSheet.getLastRow()-1,5).getValues().sort();
Logger.log(range);
var name = mainSheet.getRange(Number(prod)+1,name_col).getValue();
var check=0;
Logger.log(name);
var filterlogic2 = function filterCols(raw){
  Logger.log(raw[1]);
  if(raw[1] == name){// 
  check=1;
 return true;
  }
}

var  filterRange2 = range.filter(filterlogic2);
Logger.log(filterRange2);
Logger.log(check);
return filterRange2;
}

function AddForm()
{
 var form = HtmlService.createHtmlOutputFromFile('AddForm');
 form.setWidth(800);
 form.setHeight(300);
 SpreadsheetApp.getUi().showModalDialog(form, 'Add Stock');
    
}
function RemoveForm()
{
 var form = HtmlService.createHtmlOutputFromFile('RemoveForm');
 form.setWidth(800);
 form.setHeight(300);
 SpreadsheetApp.getUi().showModalDialog(form, 'Remove Stock');
    
}

function SearchForm()
{
 var form = HtmlService.createHtmlOutputFromFile('SearchForm');
 form.setWidth(800);
 form.setHeight(300);
 SpreadsheetApp.getUi().showModalDialog(form, 'Product Details');
    
}

function QueryForm()
{
 var form = HtmlService.createHtmlOutputFromFile('QueryForm');
 form.setWidth(800);
 form.setHeight(300);
 SpreadsheetApp.getUi().showModalDialog(form, 'Check Current Stock');
    
}