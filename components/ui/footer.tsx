import Image from 'next/image';
import { footerImangePath } from '@/lib/shared';

export function Footer() {
   return (
      // 
     <footer className="mt-auto border-t py-12 text-fd-secondary-foreground">
        <div className="relative z-20 h-13">
            <Image src={footerImangePath} fill={true} alt="publicity banner"/>
        </div>
     </footer>
   );
}