STUDY LAB PDF問題作成機能 追加パック

このパックは、現在公開中のSTUDY LABにPDF問題作成ページを追加するためのものです。
設定：30問／5択／標準（画面で10・30・50・100問、基礎・標準・応用に変更可能）

含まれるファイル
- pdf-maker.html : PDFアップロード・テキスト抽出・問題表示・採点画面
- worker.js : AI生成を行うCloudflare Workerのサーバーコード
- README.txt : この説明

重要：GitHub PagesだけではAI APIキーを安全に保管できません。
そのため、AI生成にはCloudflare Workerを別途公開し、OpenAI APIキーをWorkerのSecretとして設定する必要があります。
API利用にはOpenAI APIの利用契約・課金設定が必要になる場合があります。ChatGPTのサブスクリプションとは別です。

導入手順（iPhoneではなく、できればPC/iPadのブラウザ推奨）
1. GitHubの study_lab リポジトリを開く。
2. Add file > Upload files から pdf-maker.html をリポジトリ直下に追加し、Commit changes。
3. Cloudflareにログインし、Workers & PagesからWorkerを新規作成。
4. worker.jsの内容をWorkerのコード欄に貼り付けてDeploy。
5. WorkerのSettings > Variables and Secretsで、Secret名 OPENAI_API_KEY に自分のOpenAI APIキーを登録。キーをGitHubやHTMLに貼らない。
6. WorkerのURL（例：https://xxxx.workers.dev）を控える。
7. 公開中のSTUDY LABのPDF問題作成ページを開く：
   https://s2541033-glitch.github.io/study_lab/pdf-maker.html
8. 「AI生成サーバーURL」にWorkerのURLを入力し、PDFを選択して問題作成。

注意事項
- 現時点のPDF読み取りは、文字情報が埋め込まれたPDFに対応。スキャン画像だけのPDFはOCR未対応。
- PDF本文は問題生成のためWorker経由でAI APIへ送信されます。個人情報・機密情報を含む資料はアップロードしないでください。
- PDF本文の最大送信量は約65,000文字。長い資料は先頭部分が対象になります。
- 生成問題は誤りを含む可能性があります。授業資料と照合してください。
- 生成問題は現時点では端末間同期・クラウド保存されません。
- この追加ページは独立ページです。既存ホーム画面のメニューへのリンク追加は、既存index.htmlの編集が別途必要です。
