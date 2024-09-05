import Link from 'next/link';
import { ReactNode } from 'react';

/** カテゴリー毎のコンテナー */
const MenuCategory = ({ children }: { children?: ReactNode }) => {
  return <div className="flex flex-col gap-3">{children}</div>;
};

/** カテゴリーのタイトル */
const MenuTitle = ({ children }: { children?: ReactNode }) => {
  return <p className="font-bold">{children}</p>;
};

/** カテゴリー内の要素 */
const MenuEntry = ({ children }: { children?: ReactNode }) => {
  return <p>{children}</p>;
};

/** サイドバーのメニュー部分 */
export const Menu = () => {
  return (
    <>
      <MenuCategory>
        <MenuTitle>地形障壁</MenuTitle>
        <MenuEntry>
          <Link href="/barriers">表示・削除</Link>
        </MenuEntry>
        <MenuEntry>
          <Link href="/barriers/create">生成</Link>
        </MenuEntry>
      </MenuCategory>

      <MenuCategory>
        <MenuTitle>建物の障壁</MenuTitle>
        <MenuEntry>
          <Link href="/building-barriers">表示・削除</Link>
        </MenuEntry>
        <MenuEntry>
          <Link href="/building-barriers/create">生成</Link>
        </MenuEntry>
      </MenuCategory>

      <MenuCategory>
        <MenuTitle>緊急エリア</MenuTitle> {/*Changed Flight Area reservation to emergency area*/}
        <MenuEntry>
          <Link href="/emergency-areas">表示・削除</Link>
        </MenuEntry>
        <MenuEntry>
          <Link href="/emergency-areas/create">生成</Link>
        </MenuEntry>
      </MenuCategory>

      <MenuCategory>
        <MenuTitle>割込禁止エリア予約</MenuTitle>
        <MenuEntry>
          <Link href="/blocked-areas">表示・削除</Link>
        </MenuEntry>
        <MenuEntry>
          <Link href="/blocked-areas/create">生成</Link>
        </MenuEntry>
        {/* <MenuEntry>
          <Link href="/blocked-areas/auto-create">位置情報による自動生成</Link>
        </MenuEntry> */}
      </MenuCategory>

      <MenuCategory>
        <MenuTitle>予約ルート</MenuTitle>
        <MenuEntry>
          <Link href="/reserved-routes">表示・削除</Link>
        </MenuEntry>
        <MenuEntry>
          <Link href="/reserved-routes/create">生成</Link>
        </MenuEntry>
      </MenuCategory>

      <MenuCategory>
        <MenuTitle>機体割付ルート</MenuTitle>
        <MenuEntry>
          <Link href="/aircraft-routes">表示</Link>
        </MenuEntry>
      </MenuCategory>

      <MenuCategory>
        <MenuTitle>ルート設計</MenuTitle>
        <MenuEntry>
          <Link href="/routes/create">設計</Link>
        </MenuEntry>
      </MenuCategory>
    </>
  );
};
