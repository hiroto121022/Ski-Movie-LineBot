# Google Driveにある動画をLINEから簡単に参照できるボット
Google Apps Script、Google Drive、LINE Messaging APIを用いてLINEで動画の閲覧及び、動画の保存をできるようにしたシステム
## 使用技術
* Google Apps Script (Javascript)
* Google Drive API
* LINE Messaging API
## 作成時間
* 初リリースは5時間くらい
## できること
* Google Driveにある動画をLINEのFlex_Messageから閲覧できる。
* Google Driveにある動画をLINEのメッセージに送ることができる。
* 動画をスマホのローカルに保存することができる。
* 複数ドライブのフォルダを横断的に閲覧できる。
## 使い方
### まずは`動画`とメッセージを送ってみよう。
* Google Driveのフォルダが表示される

![Image](https://github.com/user-attachments/assets/89a9df4c-a792-4915-add1-9977694039b3)

* フォルダを選択していくと、動画ファイルが入っているフォルダにたどり着くので、動画を選択する

![Image](https://github.com/user-attachments/assets/8004a896-e6fd-48cb-b0c8-2a33d4bbe8b7)

* 動画を閲覧できるFlex_Messageが表示される

![Image](https://github.com/user-attachments/assets/f592e5c4-f550-406e-ad3f-31185b3a0f38)

* 動画を保存するを選択すると、トークに動画が送信される

![Image](https://github.com/user-attachments/assets/b21e332f-8bb7-4657-9cf5-43a6831803c2)

* 動画を開いて右下からスマホのカメラロールに保存できる

![Image](https://github.com/user-attachments/assets/ee8591a0-a699-4899-a853-eabd75b6856b)
