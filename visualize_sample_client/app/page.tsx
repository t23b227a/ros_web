import Link from 'next/link'
import Viewer from './viewer/page';
import MenuBar from '@/lib/Menubar/Menubar';



export default function Home() {
  return (
    <div>
      <header>
        <MenuBar />
      </header>
      <div>
        <Link href='/viewer'>ログ表示へ移動</Link>
      </div>
      <div>
        <Link href="/sender">pubのテストページへ移動</Link>
      </div>
      <div>
        <Link href="/controller">コントローラー</Link>
      </div>
      <div>
        <Link href="/test">テスト</Link>
      </div>
      <Viewer></Viewer>
    </div>
  );
}
