# External Image Opener

<!-- このファイルは AI エージェント（Claude Code・Codex など）と人の両方に向けた、このリポジトリの作業規則。
     「プロジェクト固有」の節はプロジェクトごとに書き換え、「共通の規則」の節は sahokun の全リポジトリで共通に保つ。 -->

## プロジェクト固有

### 概要

Obsidian のプラグイン。ノートの画像を、キーボードショートカットやボタンで外部のプログラムを使って開く。
デスクトップとモバイルの Obsidian 利用者向けに、GitHub Releases で配布する。

### 技術スタックと構成

- TypeScript（strict）を esbuild で 1 つの `main.js` にまとめる。Obsidian API と CodeMirror のモジュールは external にして含めない。
- ソースはすべてリポジトリの直下にある。
  - `main.ts`: プラグインの入口。`Plugin` を継承し、コマンド・エディタのコンテキストメニュー・閲覧モードのクリック・リボンのアイコンを登録して、他のモジュールを呼ぶ。
  - `image-path-extractor.ts`: カーソルの位置または選択範囲から、正規表現で画像の参照を見つける。対応する拡張子（PNG・JPG・GIF・WebP・SVG・BMP・TIFF・ICO・AVIF）で絞る。
  - `image-opener.ts`: Vault 内の相対パスを `metadataCache.getFirstLinkpathDest()` で絶対パスにし、指定のプログラムなら `child_process.execFile()`、未指定なら Obsidian の既定のアプリで開く。HTTP/HTTPS の URL は別に扱う。
  - `i18n.ts`: 英語と日本語の簡易な翻訳。`{path}`・`{msg}` の変数を埋め込む。言語は Obsidian の設定から決める。
  - `settings.ts`: 設定は `customProgramPath` の 1 つだけ（空文字ならシステムの既定）。
- 実装の要点:
  - 閲覧モードの画像は `app://` の URL なので、デコードして Vault のファイルと照合し、絶対パスを得る。
  - エラーは例外として投げず、Obsidian の `Notice` で利用者に見せる。
  - 外部のプログラムは `exec()` ではなく `execFile()` で起動する。コマンドインジェクションを防ぐため。

### 確認の手順

```bash
npm ci
npm run build    # tsc の型検査と esbuild の本番ビルド
```

- テストと lint は無い。TypeScript の strict（`noImplicitAny`・`strictNullChecks`・`noUnusedLocals`）で検査する。
- 開発中は `npm run dev` で、変更を監視してビルドする。

### リリース

- プラグインのソース（`*.ts` など）を変えたら、バージョンを上げる。ワークフローや文書だけの変更では上げない。
- 手順:
  1. `npm run bump -- <新しいバージョン>` で、`manifest.json`・`versions.json`・`package.json`・`package-lock.json` をまとめて更新し、PR で main に取り込む。
  2. `git tag v<バージョン>` と `git push origin v<バージョン>` でタグを push する。`release.yml` が GitHub Releases に成果物を公開する（main への push だけではリリースされない）。

## 共通の規則

### ブランチと PR

<!-- branch-model:begin -->
- 既定のブランチは `main`。作業はブランチを切り、`main` への PR にする。
- PR は squash merge で取り込む。main の履歴には PR のタイトルだけが 1 コミットとして残る。
<!-- branch-model:end -->
- PR のタイトルは Conventional Commits（`feat: ...`・`fix: ...` など）で、変更の内容が 1 行で分かるように書く。
- PR がマージされたら、作業ブランチは自動で削除される。

### 履歴と公開物に書かないもの

- メールアドレス・トークン・パスワード・個人の環境の情報・AI エージェントのセッションへのリンクを、コミット・PR・Issue・コメントに書かない。
  - 作業ブランチのコミットと PR は、マージ後も GitHub に残り続け、所有者でも消せない。main の履歴も書き換えには強制 push とサポートへの依頼が要る。PR の本文だけは後から編集で直せる。
- コミットの作成者のメールアドレスは、GitHub の noreply アドレス（`<ID>+<ユーザー名>@users.noreply.github.com`）を使う。
- `.env`・鍵ファイル・ローカル設定（`.claude/settings.local.json` など）はコミットしない。

### 依存関係

- 追加・更新する依存は、公開から 7 日以上たったバージョンに限る。公開直後に乗っ取り・差し替えが見つかる事例が多いため。
  - Dependabot のバージョン更新は `cooldown` で 7 日待つ。npm は `.npmrc` の `min-release-age=7` で手作業の更新にも同じ制限を掛ける。
- GitHub Actions のアクションは、フル SHA（40 桁）で固定し、行末にバージョンをコメントで残す（例: `actions/checkout@<SHA> # v7.0.1`）。タグは差し替えられるため。
- Dependabot の PR は、更新を知らせる合図として扱う。CI が通ることと、メジャー更新では変更点を確かめてから取り込む。
