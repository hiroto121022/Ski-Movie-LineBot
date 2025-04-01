var debugEmailAddress = PropertiesService.getScriptProperties().getProperty("MAIL_ADDRESS");
var accessToken = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
var skiDriveId1 = PropertiesService.getScriptProperties().getProperty("DRIVE_ID1");
var skiDriveId2 = PropertiesService.getScriptProperties().getProperty("DRIVE_ID2");
var skiDriveIds = [
  skiDriveId1,
  skiDriveId2,
];
// 単体のメッセージを送るためのコード
function reply_message(replyToken, message) {
  var apiUrl = 'https://api.line.me/v2/bot/message/reply/';
  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + accessToken
  };
  var data = {
    "replyToken": replyToken,
    "messages": [{
      "type": "text", 
      "text": message
    }]
  };
  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(data)
  };
  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();
    return { "status": statusCode, "response": JSON.parse(responseBody) };
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return { "status": "error", "message": e.toString() };
  }
}
// Flex_Messageを送るためのコード
function reply_flex_message(replyToken, altText, flexMessage) {
  var apiUrl = 'https://api.line.me/v2/bot/message/reply/';
  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + accessToken
  };
  var data = {
    "replyToken": replyToken,
    "messages": [{
      "type": "flex", 
      "altText": altText,
      "contents": flexMessage
    }]
  };
  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(data)
  };
  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();
    return { "status": statusCode, "response": JSON.parse(responseBody) };
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return { "status": "error", "message": e.toString() };
  }
}
// 動画のメッセージを送るためのコード
function reply_video_message(replyToken, message, videoUrl, videoThumb) {
  var apiUrl = 'https://api.line.me/v2/bot/message/reply/';
  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + accessToken
  };
  var data = {
    "replyToken": replyToken,
    "messages": [
      {
        "type": "video",
        "originalContentUrl": videoUrl,
        "previewImageUrl": videoThumb,
        "trackingId": "track-id"
      },
      {
        "type": "text", 
        "text": message
      }
    ]
  };
  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(data)
  };
  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();
    return { "status": statusCode, "response": JSON.parse(responseBody) };
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return { "status": "error", "message": e.toString() };
  }
}
// ローディングアニメーション
function startLoadingAnimation(userId) {
  var apiUrl = "https://api.line.me/v2/bot/chat/loading/start";

  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + accessToken
  };

  var payload = {
    "chatId": userId,
    "loadingSeconds": 10
  };

  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();
    return { "status": statusCode, "response": JSON.parse(responseBody) };
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return { "status": "error", "message": e.toString() };
  }
}
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);

    // メッセージイベントがあるか確認
    if (postData.events && postData.events.length > 0) {
      var event = postData.events[0];
      // ユーザーID
      var user_id = event.source.userId;
      // リプライトークン
      var replyToken = event.replyToken;
      // ローディングアニメーション開始
      startLoadingAnimation(user_id);

      // messageの場合
      if (event.type === 'message' && event.message.type === 'text') {
        var receivedMessage = event.message.text;
        switch (receivedMessage) {
          case "動画":
            // 動画と送られてきたとき
            var subfolderNames = [];
            for (var i = 0; i < skiDriveIds.length; i++) {
              var parentFolder = DriveApp.getFolderById(skiDriveIds[i]);
              var folders = parentFolder.getFolders();

              while (folders.hasNext()) {
                var folder = folders.next();
                subfolderNames.push(i + ">" + folder.getName()); // "番号>フォルダ名" の形式で追加
              }
            }
            subfolderNames.sort();
            reply_flex_message(replyToken, "フォルダを選択 トークを開いて確認", showFolder("動画", subfolderNames));
          default:
            break;
        }
      // postbackの場合
      } else if (event.type === 'postback') {
        var receivedMessage = event.postback.data;
        // postbackのデータは>で区切られている
        const msgs = receivedMessage.split('>');
        const msglng = msgs.length;

        if (msgs[msglng - 1].includes('mp4') || msgs[msglng - 1].includes('MP4')) {
          var parentFolder = DriveApp.getFolderById(getNestedFolder(skiDriveIds[msgs[0]], msgs, 1));
          var files = parentFolder.getFiles();
          while (files.hasNext()) {
            var file = files.next();
            if (file.getName() === msgs[msglng - 1]) {
              reply_flex_message(replyToken, file.getName() + "動画", showMovie(receivedMessage, file.getId()));
            }
          }
        } else if (msgs[msglng - 1].includes('保存')) {
          var parentFolder = DriveApp.getFolderById(getNestedFolder(skiDriveIds[msgs[0]], msgs, 2));
          var files = parentFolder.getFiles();
          while (files.hasNext()) {
            var file = files.next();
            if (file.getName() === msgs[msglng - 2]) {
              saveMovie(replyToken, file.getId());
            }
          }
        } else {
          var parentId = getNestedFolder(skiDriveIds[msgs[0]], msgs, 0)
          if (findFolder(parentId, "") !== "notFolder") {
            var subfolderNames = [];
            var parentFolder = DriveApp.getFolderById(parentId);
            var folders = parentFolder.getFolders();

            while (folders.hasNext()) {
              var folder = folders.next();
              subfolderNames.push(folder.getName());
            }
            subfolderNames.sort();
            reply_flex_message(replyToken, "フォルダを選択 トークを開いて確認", showFolder(receivedMessage, subfolderNames));
          } else {
            var parentFolder = DriveApp.getFolderById(parentId);
            var fileNames = [];
            var files = parentFolder.getFiles();
            while (files.hasNext()) {
              var file = files.next();
              fileNames.push(file.getName());
            }
            fileNames.sort();
            reply_flex_message(replyToken, "フォルダを選択 トークを開いて確認", showMovieList(receivedMessage, fileNames));
          }
        }
      }
    }
  } catch (error) {
    // エラーが発生した場合、エラーメールを送信
    //MailApp.sendEmail({
      //to: debugEmailAddress,
      //subject: 'Error in doPost',
      //body: 'Error details: ' + error.message + '\nStack trace: ' + error.stack,
    //});
    throw error; // エラーを再スローしてログにも表示
  }
}
function getNestedFolder(skiDriveId, msgs, removeLastCount) {
  return msgs.slice(1, msgs.length - removeLastCount) // 先頭(0)と後ろから指定個数を削除
             .reduce((parentFolderId, folderName) => {
               return findFolder(parentFolderId, folderName);
             }, skiDriveId);
}
function findFolder(parentFolderId, folderName){
    // 指定した親フォルダの中身を取得
  var parentFolder = DriveApp.getFolderById(parentFolderId);

  // サブフォルダを取得
  var folders = parentFolder.getFolders();
  if (folders.hasNext()) {
    while (folders.hasNext()) {
      var folder = folders.next();
      if (folder.getName() === folderName) {
        return folder.getId();
      }
    }
  } else {
    // サブフォルダがない場合、ファイルを取得
    return "notFolder";
  }
}
// フォルダ一覧を作成する
function showFolder(talkMsg, Names) {
  if (talkMsg == "動画") {
    var jsonData = {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [{
          "type": "text", 
          "text": talkMsg, 
          "weight": "bold", 
          "size": "lg", 
          "wrap": true
        }],
      }
    };
    for (var i = 0; i < Names.length; i++) {
      var folderInfo = {
        "type": "box",
        "layout": "horizontal",
        "contents": [{ 
          "type": "text", 
          "text": Names[i].substring(2), 
          "gravity": "center", 
          "wrap": false, 
          "flex": 3, 
          "wrap": true
        },
        {
          "type": "button", 
          "action": {
            "type": "postback",
            "label": "選択",
            "data": `${Names[i]}`}, 
            "height": "sm",
            "flex": 1
        }],
      };
      jsonData.body.contents.push(folderInfo);
    }    
  } else {
    var jsonData = {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [{
          "type": "text", 
          "text": talkMsg, 
          "weight": "bold", 
          "size": "lg", 
          "wrap": true
        }],
      }
    };
    for (var i = 0; i < Names.length; i++) {
      var folderInfo = {
        "type": "box",
        "layout": "horizontal",
        "contents": [{ 
          "type": "text", 
          "text": Names[i], 
          "gravity": "center", 
          "wrap": false, 
          "flex": 3, 
          "wrap": true
        },
        {
          "type": "button", 
          "action": {
            "type": "postback",
            "label": "選択",
            "data": `${talkMsg}>${Names[i]}`}, 
            "height": "sm",
            "flex": 1
        }],
      };
      jsonData.body.contents.push(folderInfo);
    }
    const msgs = talkMsg.split('>');
    const msglng = msgs.length;
    if (msglng == 2) {
      var returnMsg = "動画";
    } else {
      var returnMsg = talkMsg.substring(0, talkMsg.lastIndexOf('>'));
    }
    var returnBtn = {
      "type": "button", 
      "action": {
        "type": "postback",
        "label": "ひとつ前に戻る",
        "data": `${returnMsg}`
      }, 
      "height": "sm",
      "flex": 1
    };
    jsonData.body.contents.push(returnBtn);
  }
  return jsonData;
}
// 動画一覧を作成する
function showMovieList(talkMsg, Names) {
  var returnMsg = talkMsg.substring(0, talkMsg.lastIndexOf('>'));
  var jsonData = {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [{
        "type": "text", 
        "text": talkMsg, 
        "weight": "bold", 
        "size": "lg", 
        "wrap": true
      }]
    }
  };
  for (var i = 0; i < Names.length; i++) {
    var folderInfo = {
      "type": "box",
      "layout": "horizontal",
      "contents": [{
        "type": "text", 
        "text": Names[i], 
        "gravity": "center", 
        "wrap": false, 
        "flex": 3, 
        "wrap": true
      },
      {
        "type": "button", 
        "action": {
          "type": "postback",
          "label": "選択",
          "data": `${talkMsg}>${Names[i]}`
        },
        "height": "sm",
        "flex": 1
      }],
    };
    jsonData.body.contents.push(folderInfo);
  }
  var returnBtn = {
    "type": "button", 
    "action": {
      "type": "postback",
      "label": "ひとつ前に戻る",
      "data": `${returnMsg}`
    },
    "height": "sm",
    "flex": 1
  };
  jsonData.body.contents.push(returnBtn);

  return jsonData;
}
// 動画を閲覧できるFlexMessageを作成する
function showMovie(msg, videoId) {
  var videoUrl = "https://drive.google.com/uc?id=" + videoId;
  var videoThumb = "https://drive.google.com/thumbnail?id=" + videoId;
  var returnText = msg.substring(0, msg.lastIndexOf('>'));
  var jsonData = {
    "type": "bubble",
    "size": "mega",
    "hero": {
      "type": "video",
      "url": videoUrl,
      "previewUrl": videoThumb,
      "altContent": {
        "type": "image",
        "size": "full",
        "aspectRatio": "4:3",
        "aspectMode": "cover",
        "url": "https://example.com/image.jpg"
      },
      "aspectRatio": "4:3"
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [{ 
        "type": "text", 
        "text": msg, 
        "weight": "bold", 
        "size": "lg", 
        "wrap": true
      },
      {
        "type": "button", 
        "action": {
          "type": "postback",
          "label": "動画を保存する",
          "data": `${msg}>保存`
        }, 
        "height": "sm",
        "flex": 1
      },
      {
        "type": "button", 
        "action": {
          "type": "postback",
          "label": "ひとつ前に戻る",
          "data": `${returnText}`
        },
        "height": "sm",
        "flex": 1
      }],
    }
  };
  return jsonData;
}
// 動画をトークに送信する
function saveMovie(replyToken, videoId) {
  var videoUrl = "https://drive.google.com/uc?id=" + videoId;
  var videoThumb = "https://drive.google.com/thumbnail?id=" + videoId;
  reply_video_message(replyToken, "動画を開いて右下のダウンロードボタンから保存", videoUrl, videoThumb)
}
