'use client';
import { CollapsibleContent } from 'fumadocs-ui/components/ui/collapsible';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { SidebarFolder, SidebarFolderLink, SidebarFolderTrigger} from 'fumadocs-ui/layouts/docs/sidebar';
import { twMerge as cn } from 'tailwind-merge';
import { cva } from 'class-variance-authority';
import Link, { type LinkProps } from 'fumadocs-core/link';
import { ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isActive } from '@/lib/is-active';
import type { PageTree } from 'fumadocs-core/server';
import type { ReactNode } from 'react';

export function Folder({
   item, 
   level, 
   children
}:{
  item: PageTree.Folder;
  level: number;
  children: ReactNode;
}) {
  return (
    <SidebarFolder defaultOpen={1 >= level} >
      {item.index ? (
        <SidebarFolderLink href={item.index.url} external={item.index.external}>
          {item.icon}
          <strong>{item.name}</strong>
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger>
          {item.icon}
          <strong>{item.name}</strong>
        </SidebarFolderTrigger>
      )}
      <CollapsibleContent>
      <ul className="px-2">{children}</ul>
      </CollapsibleContent>
    </SidebarFolder>
  );
}

const itemVariants = cva(
  'flex flex-row items-center gap-2 rounded-md p-1 text-start text-fd-muted-foreground [overflow-wrap:anywhere] [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      active: {
        true: 'font-medium text-fd-primary',
        false:
          'transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none',
      },
    },
  },
);

function SidebarItem({
  icon,
  item,
  ...props
}: LinkProps & {
  icon?: ReactNode;
  item: PageTree.Item;
}) {
  const pathname = usePathname();
  const active =
    item.url !== undefined && isActive(item.url, pathname, false);

  return (
    <li className={`border-s ${active ? 'border-e-infra-blue' : ''}`}>
    <div className="ms-3">
    <Link
      {...props}
      data-active={active}
      className={cn(itemVariants({ active }), props.className)}
      prefetch={false}
    >
      {icon ?? (props.external ? <ExternalLink /> : null)}
      {props.children}
    </Link>
    </div>
    </li>
  );
}

function SidebarItemSingle({
  item,
  ...props
}: LinkProps & {
  icon?: ReactNode;
  item: PageTree.Item;
}) {
  const pathname = usePathname();
  const active =
    props.href !== undefined && isActive(props.href, pathname, false);

  return (
     <div>
     <button
      type="button"
      aria-label="Collapse Sidebar"
      data-collapsed={true}
      className={cn(buttonVariants({
          color: 'ghost',
          size: 'icon',
        }), itemVariants({ active }), "p-2", props.className)}
     >
     <a href={props.href}><strong>{item.name}</strong></a>
     </button>
     </div>
   )
}


export function Item({item} : {item: PageTree.Item}) {
    const icon = item.icon as unknown;
    const SBItem = icon == 'Single' ? SidebarItemSingle : SidebarItem;
    return (
      <SBItem
         key={item.url}
         href={item.url}
         external={item.external}
         icon={item.icon}
         item={item}
       >
         {item.name}
      </SBItem>
    );
}
