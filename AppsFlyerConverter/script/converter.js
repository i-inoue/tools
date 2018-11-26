$(function(){
   // FileAPIでCSVファイルのドロップ出力処理
    $("#drop_wrap").on("drop", function(e) {
        e.preventDefault();
        var $result_body = $('#data_result tbody');
        var file = e.originalEvent.dataTransfer.files[0];
        var name = getFilename(new Date(), file.name);
        var reader = new FileReader();
        reader.onload = function(event) {
        	    // CSvの変換
        	    var itemArr = CSVToArray(event.target.result, ',');
        	    
            // 最低でも２行（ヘッダー + データ）が必要
            if (itemArr.length < 2) {
            	    alert("データが不足しています。\nCSVファイルを確認してください。");
            	    return;
            }
            
            // Eventのインデックスを取得
            var eventIndex = itemArr[0].indexOf("Event Value");
            
            // インデックスが取得できたか確認
            if (eventIndex < 0) {
            	    alert("「Event Value」が見つかりません。\nCSVファイルを確認してください。");
            	    return;
            }
            
            // 出力データを生成する
            var resValue = [];
            for(var i = 1; i < itemArr.length -1; i++){
            	    var json = JSON.parse(itemArr[i][eventIndex]);
            	    
            	    // ヘッダー生成
            	    if (i == 1) {
            	    	    resValue.push(itemArr[0].slice(0, eventIndex)
            	    	                      .concat(Object.keys(json))
            	    	                      .concat(itemArr[0].slice(eventIndex +1)));
            	    }
            	    
            	    // ボディ生成
            	    resValue.push(itemArr[i].slice(0, eventIndex)
  	                      .concat(Object.values(json))
  	                      .concat(itemArr[i].slice(eventIndex +1)));
            }

            // 指定されたデータを保持するBlobを作成する。
            var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            var blob = new Blob([ bom, resValue.join("\n") ], { "type" : "text/csv" });
            var link = document.createElement("a");
         
            /* 自動ダウンロードにする場合 */
            if (window.navigator.msSaveOrOpenBlob) {
            	  // for ie
            	  window.navigator.msSaveOrOpenBlob(blob, name);
            	} else if (window.URL && window.URL.createObjectURL) {
            	  // for chrome (and safari)
            	  link.setAttribute('download', name);
            	  link.setAttribute('href', window.URL.createObjectURL(blob));
            	  link.click();
            	} else if (window.URL && window.URL.createObjectURL) {
            	  // for firefox
            	  link.setAttribute('download', name);
            	  link.setAttribute('href', window.URL.createObjectURL(blob));
            	  link.click();
            	}
            
            /* 手動ダウンロードにする場合 */
//            window.URL = window.URL || window.webkitURL;
//            $("#" + id).attr("href", window.URL.createObjectURL(blob));
//            $("#" + id).attr("download", "tmp.txt");
        }

        reader.readAsText(file, 'UTF-8');
    }).on("dragenter", function() {
        return false;
    }).on("dragover", function() {
        return false;
    });
});

//This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
            ){
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }
    // Return the parsed data.
    return( arrData );
}

function getFilename(date, baseFilename) {
    var Year = date.getFullYear();
    var Month = date.getMonth()+1;
    var Date = date.getDate();
    var Hour = date.getHours();
    var Min = date.getMinutes();
    var Sec = date.getSeconds();

    return ""+ Year + Month + Date + "_" + Hour + Min + Sec + "_" + baseFilename;
}