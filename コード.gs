var debugEmailAddress = PropertiesService.getScriptProperties().getProperty("MAIL_ADDRESS");
var skiDriveId = PropertiesService.getScriptProperties().getProperty("DRIVE_ID");

function lineReply(replyToken,altMsg,msgContents) {
  var accessToken = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
  var apiUrl = 'https://api.line.me/v2/bot/message/reply/';
  var messageData = {
    replyToken: replyToken,
    messages: msgContents
  };
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    },
    payload: JSON.stringify(messageData)
  };
  // Lineにリプライを送信（1行目）
  var response = UrlFetchApp.fetch(apiUrl, options);
  // レスポンスのログ出力（デバッグ用）
  Logger.log(response.getContentText());
}
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);

    // メッセージイベントがあるか確認
    if (postData.events && postData.events.length > 0) {
      var event = postData.events[0];

      //テキストメッセージの時
      if (event.type === 'message' && event.message.type === 'text') {
        var replyToken = event.replyToken;
        var receivedMessage = event.message.text;
        if (!receivedMessage.includes('>')) {
          // メッセージが1行
          switch (receivedMessage) {
            case "動画":
              // 動画と送られてきたとき
              var subfolderNames = [];
              var parentFolder = DriveApp.getFolderById(skiDriveId);
              var folders = parentFolder.getFolders();

              while (folders.hasNext()) {
                var folder = folders.next();
                subfolderNames.push(folder.getName());
              }
              subfolderNames.sort();
              lineReply(replyToken, "フォルダを選択 トークを開いて確認", showFolder("動画", subfolderNames));
              break;
            default:
          }
        } else {
          // メッセージが複数行
          const msgs = receivedMessage.split('>');
          switch (msgs.length) {
            case 2:
              // メッセージが2行
              var subfolderNames = [];
              var parentFolder = DriveApp.getFolderById(findFolder(skiDriveId, msgs[1]));
              var folders = parentFolder.getFolders();

              while (folders.hasNext()) {
                var folder = folders.next();
                subfolderNames.push(folder.getName());
              }
              subfolderNames.sort()
              lineReply(replyToken, "フォルダを選択 トークを開いて確認", showFolder(receivedMessage, subfolderNames));
              break;
            case 3:
              // メッセージが3行
              var parentId = findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]);
              if (findFolder(parentId, "") !== "notFolder") {
                var subfolderNames = [];
                var parentFolder = DriveApp.getFolderById(parentId);
                var folders = parentFolder.getFolders();

                while (folders.hasNext()) {
                  var folder = folders.next();
                  subfolderNames.push(folder.getName());
                }
                subfolderNames.sort();
                lineReply(replyToken, "フォルダを選択 トークを開いて確認", showFolder(receivedMessage, subfolderNames));
                break;
              } else {
                var parentFolder = DriveApp.getFolderById(parentId);
                var fileNames = [];
                var fileIds = [];
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  fileNames.push(file.getName());
                  fileIds.push(file.getId());
                }
                fileNames.sort();
                lineReply(replyToken, "フォルダを選択 トークを開いて確認", showMovieList(receivedMessage, fileNames));
                break;
              }
            case 4:
              // メッセージが4行
              if (msgs[3].includes('mp4')) {
                var parentFolder = DriveApp.getFolderById(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]));
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  if (file.getName() === msgs[3]) {
                    lineReply(replyToken, "動画 トークを開いて確認", showMovie(receivedMessage, file.getName(), file.getId()));
                  }
                }
              } else {
                var parentId = findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]);
                if (findFolder(parentId, "") !== "notFolder") {
                  var subfolderNames = [];
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var folders = parentFolder.getFolders();

                  while (folders.hasNext()) {
                    var folder = folders.next();
                    subfolderNames.push(folder.getName());
                  }
                  subfolderNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showFolder(receivedMessage, subfolderNames));
                } else {
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var fileNames = [];
                  var fileIds = [];
                  var files = parentFolder.getFiles();
                  while (files.hasNext()) {
                    var file = files.next();
                    fileNames.push(file.getName());
                  }
                  fileNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showMovieList(receivedMessage, fileNames));
                }
              }
              break;
            case 5:
              // メッセージが5行
              if (msgs[4].includes('mp4')) {
                var parentFolder = DriveApp.getFolderById(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]));
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  if (file.getName() === msgs[4]) {
                    lineReply(replyToken, "動画 トークを開いて確認", showMovie(receivedMessage, file.getName(), file.getId()));
                  }
                }
              } else if (msgs[4].includes('保存')) {
                var parentFolder = DriveApp.getFolderById(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]));
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  if (file.getName() === msgs[3]) {
                    lineReply(replyToken, "動画 トークを開いて確認", saveMovie(file.getId()));
                  }
                }
              } else {
                var parentId = findFolder(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]), msgs[4])
                if (findFolder(parentId, "") !== "notFolder") {
                  var subfolderNames = [];
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var folders = parentFolder.getFolders();

                  while (folders.hasNext()) {
                    var folder = folders.next();
                    subfolderNames.push(folder.getName());
                  }
                  subfolderNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showFolder(receivedMessage, subfolderNames));
                } else {
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var fileNames = [];
                  var fileIds = [];
                  var files = parentFolder.getFiles();
                  while (files.hasNext()) {
                    var file = files.next();
                    fileNames.push(file.getName());
                  }
                  fileNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showMovieList(receivedMessage, fileNames));
                }
              }
              break;
            case 6:
              // メッセージが6行
              if (msgs[5].includes('mp4')) {
                var parentFolder = DriveApp.getFolderById(findFolder(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]), msgs[4]));
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  if (file.getName() === msgs[5]) {
                    lineReply(replyToken, "動画 トークを開いて確認", showMovie(receivedMessage, file.getName(), file.getId()));
                  }
                }
              } else if (msgs[5].includes('保存')) {
                var parentFolder = DriveApp.getFolderById(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]));
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  if (file.getName() === msgs[4]) {
                    lineReply(replyToken, "動画 トークを開いて確認", saveMovie(file.getId()));
                  }
                }
              } else {
                var parentId = findFolder(findFolder(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]), msgs[4]) ,msgs[5])
                if (findFolder(parentId, "") !== "notFolder") {
                  var subfolderNames = [];
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var folders = parentFolder.getFolders();

                  while (folders.hasNext()) {
                    var folder = folders.next();
                    subfolderNames.push(folder.getName());
                  }
                  subfolderNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showFolder(receivedMessage, subfolderNames));
                } else {
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var fileNames = [];
                  var fileIds = [];
                  var files = parentFolder.getFiles();
                  while (files.hasNext()) {
                    var file = files.next();
                    fileNames.push(file.getName());
                  }
                  fileNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showMovieList(receivedMessage, fileNames));
                }
              }
              break;
            case 7:
              // メッセージが7行
              if (msgs[6].includes('mp4')) {
                var parentFolder = DriveApp.getFolderById(findFolder(findFolder(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]), msgs[4]) ,msgs[5]));
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  if (file.getName() === msgs[6]) {
                    lineReply(replyToken, "動画 トークを開いて確認", showMovie(receivedMessage, file.getName(), file.getId()));
                  }
                }
              } else if (msgs[6].includes('保存')) {
                var parentFolder = DriveApp.getFolderById(findFolder(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]), msgs[4]));
                var files = parentFolder.getFiles();
                while (files.hasNext()) {
                  var file = files.next();
                  if (file.getName() === msgs[5]) {
                    lineReply(replyToken, "動画 トークを開いて確認", saveMovie(file.getId()));
                  }
                }
              } else {
                var parentId = findFolder(findFolder(findFolder(findFolder(findFolder(findFolder(skiDriveId, msgs[1]), msgs[2]), msgs[3]), msgs[4]) ,msgs[5]) ,msgs[6])
                if (findFolder(parentId, "") !== "notFolder") {
                  var subfolderNames = [];
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var folders = parentFolder.getFolders();

                  while (folders.hasNext()) {
                    var folder = folders.next();
                    subfolderNames.push(folder.getName());
                  }
                  subfolderNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showFolder(receivedMessage, subfolderNames));
                } else {
                  var parentFolder = DriveApp.getFolderById(parentId);
                  var fileNames = [];
                  var fileIds = [];
                  var files = parentFolder.getFiles();
                  while (files.hasNext()) {
                    var file = files.next();
                    fileNames.push(file.getName());
                  }
                  fileNames.sort();
                  lineReply(replyToken, "フォルダを選択 トークを開いて確認", showMovieList(receivedMessage, fileNames));
                }
              }
              break;
            default:
              // メッセージが8行以上
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
        break;
      }
    }
  } else {
    // サブフォルダがない場合、ファイルを取得
    return "notFolder";
  }
}
function showFolder(talkMsg, Names) {
  var jsonData = [{
    type: 'flex',
    altText: "フォルダ選択",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [{ type: "text", text: talkMsg, weight: "bold", size: "lg", wrap: true}],
      }
    }
  }];
  for (var i = 0; i < Names.length; i++) {
    var folderInfo = {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: Names[i], gravity: "center", wrap: false, flex: 3, wrap: true},
        { type: "button", action: {type: "message",label: "選択",text: `${talkMsg}>${Names[i]}`}, height: "sm",flex: 1},
      ],
    };
    jsonData[0].contents.body.contents.push(folderInfo);
  }
  if (talkMsg !== "動画") {
    var returnMsg = talkMsg.substring(0, talkMsg.lastIndexOf('>'));
    var returnBtn = { type: "button", action: {type: "message",label: "ひとつ前に戻る",text: `${returnMsg}`}, height: "sm",flex: 1};
    jsonData[0].contents.body.contents.push(returnBtn);
  } else {
  }
  return jsonData;
}
function showMovieList(talkMsg, Names) {
  var returnMsg = talkMsg.substring(0, talkMsg.lastIndexOf('>'));
  var jsonData = [{
    type: 'flex',
    altText: "動画選択",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [{ type: "text", text: talkMsg, weight: "bold", size: "lg", wrap: true}],
      }
    }
  }];
  for (var i = 0; i < Names.length; i++) {
    var folderInfo = {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: Names[i], gravity: "center", wrap: false, flex: 3, wrap: true},
        { type: "button", action: {type: "message",label: "選択",text: `${talkMsg}>${Names[i]}`}, height: "sm",flex: 1},
      ],
    };
    jsonData[0].contents.body.contents.push(folderInfo);
  }
  var returnBtn = { type: "button", action: {type: "message",label: "ひとつ前に戻る",text: `${returnMsg}`}, height: "sm",flex: 1};
  jsonData[0].contents.body.contents.push(returnBtn);
  return jsonData;
}
function showMovie(msg, movieName, movieId) {
  var movieUrl = "https://drive.google.com/uc?id=" + movieId;
  var returnText = msg.substring(0, msg.lastIndexOf('>'));
  var jsonData = [{
    type: 'flex',
    altText: movieName + "動画",
    contents: {
      type: "bubble",
      size: "mega",
      hero: {
        type: "video",
        url: movieUrl,
        previewUrl: "https://example.com/video_preview.jpg",
        altContent: {
          type: "image",
          size: "full",
          aspectRatio: "4:3",
          aspectMode: "cover",
          url: "https://example.com/image.jpg"
        },
        aspectRatio: "4:3"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: msg, weight: "bold", size: "lg", wrap: true},
          { type: "button", action: {type: "message",label: "動画を保存する",text: `${msg}>保存`}, height: "sm",flex: 1},
          { type: "button", action: {type: "message",label: "ひとつ前に戻る",text: `${returnText}`}, height: "sm",flex: 1},
        ],
      }
    }
  }];
  return jsonData;
}
function saveMovie(movieId) {
  var movieUrl = "https://drive.google.com/uc?id=" + movieId;
  var jsonData = [{
    type: "video",
    originalContentUrl: movieUrl,
    previewImageUrl: "https://example.com/preview.jpg",
    trackingId: "track-id"
  },{
    type: "text",
    text: "動画を開いて右下のダウンロードボタンから保存"
  }];
  return jsonData;
}