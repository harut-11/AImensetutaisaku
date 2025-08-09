# AI面接対策アプリ

# 開発理由
 就職活動中、面接練習をしたいけれど、こんな悩み有りませんか？
- 学生時代に就職活動で面接対策をしたいが一人で学校のキャリアセンターに行くのが不安
- 面接対策をしてもらいたいが就活アドバイザーやキャリアセンターが営業時間外だったり、予約が取れなかったりして、練習する機会がない
- 自分のペースで、自宅で気軽に面接対策をしたい
### このアプリは、そんな学生たちの声に応えるために開発されました。いつでも、どこでも、あなたに寄り添った面接対策をサポートします。
---

# 本プロジェクトのディレクトリツリー

```
.AImensetutaisaku
├── README.md
├── css
│   ├── loginPage.css   // ログインページ用CSS
|   ├── regiterPagePage.css   // 新規登録ページ用CSS
|   ├── style.css   // 修正なしの面接ページ用CSS
│   └── syusei.css      // 修正ありの面接ページ用CSS
├── javascript
│   ├── loginPage.js       // ログインページ用Javascript
│   ├── registerPage.js       // 新規登録ページ用Javascript
│   ├── script.js       // 修正なしの面接ページ用Javascript
│   └── syusei.js          // 修正有の面接ページ用Javascript
├── pictures // 使用方法画像
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.png
│   ├── 4.png
│   ├── 5.png
│   ├── loading.gif
│   ├── mensetubi.png
│   ├── mensetukan.png
│   ├── mensetukan2.png
│   ├── s1.png
│   ├── s2.png
│   ├── s3.png
│   ├── s4.png
│   └── s5.png
├── .env.example   // Gemini APIキー設定
├── aiFeedback.js // フィードバック生成 
├── AImensetushu.xlsx // 質問集の管理
├── index.html // 修正なしの面接ページ用html
├── syusei.html // 修正ありの面接ページ用html
├── loginPage.html // ログインページ用html
├── registerPage.html // 新規登録ページ用html
├── server.js // バックエンドサーバー
├── package-lock.json //  プロジェクトの依存関係
├── package.json // プロジェクトのメタデータ
└── users.txt    // ユーザー・パスワード管理用

```

---

## インストールとセットアップ

プロジェクトをローカル環境で動かすための手順を説明します。

### 前提条件

このプロジェクトを実行するために必要なソフトウェアやツールを記載します。
- パソコン(Windows, macOS)
- Visual Studio Code(推奨エディタ) (Visual Studio Codeが未インストールの場合は、[こちら](https://code.visualstudio.com/download))
- Node.js (v20.15.0)（未インストールの場合は、[こちら](https://nodejs.org/en/download)）

### 手順

1.  **リポジトリのクローン**

    ```bash
    git clone [https://github.com/あなたのユーザー名/あなたのリポジトリ名.git](https://github.com/あなたのユーザー名/あなたのリポジトリ名.git)
    cd あなたのリポジトリ名
    ```

2.  **依存関係のインストール**

    ```bash
    npm install express
    ```

3.  **.envファイルの設定**

    `.env.example`を参考に、プロジェクトのルートディレクトリに`.env`ファイルを作成し、APIキーなどの環境変数を設定してください。

    ```
    GEMINI_API_KEY=あなたのAPIキー
    ```

4.  **アプリケーションの起動**

    以下のコマンドでアプリケーションを起動します。

    ```bash
    node server.js

    ```

---

## 使い方

アプリケーションの具体的な使い方や操作手順を説明します。

1.  ブラウザで`http://localhost:3000`にアクセスします。

## アプリの特徴
1.こちらがログイン画面になります。
![ログイン画像](pictures/login.png)
2.新規登録はこちらをクリックするとユーザー名とパスワードを設定できます。
![新規登録画像](pictures/sinki.png)
3.ログインすると使用方法ボタンを押すとそれぞれの操作方法がわかります。
---

## 技術スタック

このプロジェクトで使われている主要な技術をリストアップします。

| 分類           | 技術・ライブラリ        |
| -------------- | ----------------------- |
| フロントエンド | HTML, CSS, JavaScript   |
| バックエンド   | Node.js (Express)       |
| ライブラリ     | bcrypt, dotenv, pandas 等 |
| API            | Gemini API              |


---


