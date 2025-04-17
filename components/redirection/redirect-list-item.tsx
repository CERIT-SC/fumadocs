import React from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";

interface RedirectListItemProps {
  href: string;
  text: string;
}

const RedirectListItem: React.FC<RedirectListItemProps> = ({ href, text }) => {
  return (
    <li>
      <Link href={href} className="text-fd-primary flex items-center gap-2">
        <MoveRight className="pt-[3px]" />
        {text}
      </Link>
    </li>
  );
};

export default RedirectListItem;
